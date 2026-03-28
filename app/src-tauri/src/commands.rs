use crate::assets::{AssetData, ForceEntry, HorseEntry, KungfuEntry, SpeAddEntry, TagEntry};
use crate::models::skill::HeroSummary;
#[allow(unused_imports)]
use crate::save_manager::{EditStatus, SaveManager, SaveSlotInfo};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub save_manager: SaveManager,
    pub asset_data: Option<AssetData>,
}

#[tauri::command]
pub fn load_save(
    slot_path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<usize, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    let path = std::path::Path::new(&slot_path);

    // Load assets from sibling assets dir if not loaded yet
    if app.asset_data.is_none() {
        if let Some(parent) = path.parent().and_then(|p| p.parent()) {
            let assets_dir = parent
                .parent()
                .map(|p| p.join("assets"))
                .unwrap_or_else(|| parent.join("assets"));
            if assets_dir.exists() {
                app.asset_data = AssetData::load_from_dir(&assets_dir).ok();
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
