use crate::assets::{AssetData, ForceEntry, HorseEntry, KungfuEntry, SpeAddEntry, TagEntry};
use crate::models::skill::HeroSummary;
#[allow(unused_imports)]
use crate::save_manager::{EditStatus, SaveManager, SaveSlotInfo};
use serde_json::Value;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

pub struct AppState {
    pub save_manager: SaveManager,
    pub asset_data: Option<AssetData>,
}

/// Try to load asset data from multiple candidate directories.
/// Returns the first successful load, or an error describing all failures.
fn try_load_assets(candidates: &[PathBuf]) -> Result<AssetData, String> {
    let mut errors = Vec::new();
    for dir in candidates {
        if !dir.exists() {
            errors.push(format!("  {} — directory not found", dir.display()));
            continue;
        }
        match AssetData::load_from_dir(dir) {
            Ok(data) => {
                eprintln!("[assets] ✓ Loaded from: {}", dir.display());
                eprintln!(
                    "[assets]   forces={}, skills={}, tags={}, spe_add={}, horses={}",
                    data.forces.len(),
                    data.kungfu_skills.len(),
                    data.tags.len(),
                    data.spe_add_data.len(),
                    data.horses.len(),
                );
                return Ok(data);
            }
            Err(e) => {
                errors.push(format!("  {} — {}", dir.display(), e));
            }
        }
    }
    Err(format!(
        "Failed to load assets from any candidate:\n{}",
        errors.join("\n")
    ))
}

#[tauri::command]
pub fn load_save(
    slot_path: String,
    app_handle: AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<usize, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    let path = std::path::Path::new(&slot_path);

    // Load assets if not loaded yet, trying multiple locations.
    if app.asset_data.is_none() {
        let mut candidates: Vec<PathBuf> = Vec::new();

        // 1. Tauri bundled resources: <app_dir>/assets/
        if let Ok(resource_dir) = app_handle.path().resource_dir() {
            candidates.push(resource_dir.join("assets"));
        }

        // 2. Save-relative: slot_path is .../saves/SaveSlotN → go up 2 levels
        if let Some(game_root) = path.parent().and_then(|p| p.parent()) {
            candidates.push(game_root.join("assets"));
        }

        // 3. Dev mode: relative to the Cargo manifest (app/src-tauri/../../assets)
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        candidates.push(manifest_dir.join("..").join("..").join("assets"));

        // 4. CWD fallback
        if let Ok(cwd) = std::env::current_dir() {
            candidates.push(cwd.join("assets"));
        }

        match try_load_assets(&candidates) {
            Ok(data) => {
                app.asset_data = Some(data);
            }
            Err(e) => {
                eprintln!("[assets] ✗ {}", e);
                // Don't return an error — the save can still load, just without asset names
            }
        }
    }

    app.save_manager.load_hero_file(path)
}

#[tauri::command]
pub fn get_hero_list(state: State<'_, Mutex<AppState>>) -> Result<Vec<HeroSummary>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    Ok(app.save_manager.get_hero_list())
}

#[tauri::command]
pub fn get_hero(hero_id: i32, state: State<'_, Mutex<AppState>>) -> Result<Value, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    let hero = app
        .save_manager
        .get_hero(hero_id)
        .ok_or_else(|| format!("Hero {} not found", hero_id))?;
    serde_json::to_value(hero).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_hero_field(
    hero_id: i32,
    field_path: String,
    value: Value,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager
        .update_hero_field(hero_id, &field_path, value)
}

#[tauri::command]
pub fn undo(state: State<'_, Mutex<AppState>>) -> Result<Option<String>, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager.undo()
}

#[tauri::command]
pub fn redo(state: State<'_, Mutex<AppState>>) -> Result<Option<String>, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager.redo()
}

#[tauri::command]
pub fn get_edit_status(state: State<'_, Mutex<AppState>>) -> Result<EditStatus, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    Ok(app.save_manager.get_edit_status())
}

#[tauri::command]
pub fn save_file(state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager.save()
}

#[tauri::command]
pub fn get_force_list(
    state: State<'_, Mutex<AppState>>,
) -> Result<HashMap<i32, ForceEntry>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    match &app.asset_data {
        Some(data) => Ok(data.forces.clone()),
        None => Ok(HashMap::new()),
    }
}

#[tauri::command]
pub fn get_skill_list(
    state: State<'_, Mutex<AppState>>,
) -> Result<HashMap<i32, KungfuEntry>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    match &app.asset_data {
        Some(data) => Ok(data.kungfu_skills.clone()),
        None => Ok(HashMap::new()),
    }
}

#[tauri::command]
pub fn get_tag_list(
    state: State<'_, Mutex<AppState>>,
) -> Result<HashMap<i32, TagEntry>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    match &app.asset_data {
        Some(data) => Ok(data.tags.clone()),
        None => Ok(HashMap::new()),
    }
}

#[tauri::command]
pub fn get_spe_add_names(
    state: State<'_, Mutex<AppState>>,
) -> Result<HashMap<i32, SpeAddEntry>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    match &app.asset_data {
        Some(data) => Ok(data.spe_add_data.clone()),
        None => Ok(HashMap::new()),
    }
}

#[tauri::command]
pub fn get_horse_list(
    state: State<'_, Mutex<AppState>>,
) -> Result<HashMap<i32, HorseEntry>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    match &app.asset_data {
        Some(data) => Ok(data.horses.clone()),
        None => Ok(HashMap::new()),
    }
}
