pub mod assets;
mod commands;
pub mod models;
pub mod save_manager;

use commands::AppState;
use save_manager::SaveManager;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(AppState {
                save_manager: SaveManager::new(),
                asset_data: None,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_save,
            commands::get_hero_list,
            commands::get_hero,
            commands::update_hero_field,
            commands::undo,
            commands::redo,
            commands::get_edit_status,
            commands::save_file,
            commands::get_force_list,
            commands::get_skill_list,
            commands::get_tag_list,
            commands::get_spe_add_names,
            commands::get_horse_list,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
