use app_lib::save_manager::SaveManager;
use std::path::PathBuf;

fn save_slot_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("saves")
        .join("SaveSlot1")
}

#[test]
fn test_full_edit_cycle() {
    let slot_dir = save_slot_dir();
    if !slot_dir.exists() {
        println!("Skipping E2E test - save directory not found");
        return;
    }

    let mut mgr = SaveManager::new();

    // Load
    let count = mgr.load_hero_file(&slot_dir).unwrap();
    assert!(count > 800);

    // Get hero list
    let list = mgr.get_hero_list();
    assert!(!list.is_empty());
    let first_id = list[0].hero_id;

    // Get a hero
    let hero = mgr.get_hero(first_id).unwrap();
    let old_name = hero.hero_name.clone();

    // Edit name
    mgr.update_hero_field(first_id, "heroName", serde_json::json!("TestName")).unwrap();
    let hero = mgr.get_hero(first_id).unwrap();
    assert_eq!(hero.hero_name, "TestName");

    // Check edit status
    let status = mgr.get_edit_status();
    assert!(status.can_undo);
    assert_eq!(status.unsaved_changes, 1);

    // Undo
    mgr.undo().unwrap();
    let hero = mgr.get_hero(first_id).unwrap();
    assert_eq!(hero.hero_name, old_name);

    // Redo
    mgr.redo().unwrap();
    let hero = mgr.get_hero(first_id).unwrap();
    assert_eq!(hero.hero_name, "TestName");

    // Undo again to restore original
    mgr.undo().unwrap();

    println!("E2E test passed: load -> edit -> undo -> redo -> undo");
}
