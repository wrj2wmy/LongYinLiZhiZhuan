//! Integration test: validates our Hero struct against the real save file.
//!
//! This test reads the actual Hero save file and attempts to parse each
//! non-null entry as our Hero struct. It asserts that >95% of entries
//! parse successfully.

use app_lib::models::Hero;
use std::path::PathBuf;

/// Locate the Hero save file relative to the src-tauri directory.
fn hero_save_path() -> PathBuf {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir.join("..").join("..").join("saves").join("SaveSlot1").join("Hero")
}

#[test]
fn test_parse_real_hero_save_file() {
    let path = hero_save_path();
    assert!(
        path.exists(),
        "Hero save file not found at: {}",
        path.display()
    );

    // Read the file
    let contents = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("Failed to read Hero save file: {}", e));

    // First pass: parse as Vec<Option<Value>> to count entries
    let raw: Vec<Option<serde_json::Value>> = serde_json::from_str(&contents)
        .unwrap_or_else(|e| panic!("Failed to parse Hero file as JSON array: {}", e));

    let total = raw.len();
    let non_null: Vec<&serde_json::Value> = raw.iter().filter_map(|x| x.as_ref()).collect();
    let non_null_count = non_null.len();

    println!("Total entries: {}", total);
    println!("Null entries: {}", total - non_null_count);
    println!("Non-null entries: {}", non_null_count);

    // Second pass: try to parse each non-null entry as Hero
    let mut success_count = 0;
    let mut failure_count = 0;
    let mut failures: Vec<(usize, String)> = Vec::new();

    for (idx, value) in non_null.iter().enumerate() {
        match serde_json::from_value::<Hero>((*value).clone()) {
            Ok(hero) => {
                success_count += 1;
                // Verify some basic fields are sensible
                if idx == 0 {
                    println!(
                        "First hero: id={}, name='{}', family='{}', age={}",
                        hero.hero_id, hero.hero_name, hero.hero_family_name, hero.age
                    );
                    println!(
                        "  Extra fields captured: {}",
                        hero.extra.len()
                    );
                    let extra_keys: Vec<&String> = hero.extra.keys().collect();
                    println!("  Extra field names: {:?}", extra_keys);
                }
            }
            Err(e) => {
                failure_count += 1;
                let hero_id = value.get("heroID").and_then(|v| v.as_i64()).unwrap_or(-1);
                let hero_name = value
                    .get("heroName")
                    .and_then(|v| v.as_str())
                    .unwrap_or("???");
                let err_msg = format!(
                    "Hero #{} (id={}, name='{}'): {}",
                    idx, hero_id, hero_name, e
                );
                if failures.len() < 20 {
                    failures.push((idx, err_msg.clone()));
                }
            }
        }
    }

    println!("\n=== Results ===");
    println!(
        "Success: {}/{} ({:.1}%)",
        success_count,
        non_null_count,
        (success_count as f64 / non_null_count as f64) * 100.0
    );
    println!("Failures: {}", failure_count);

    if !failures.is_empty() {
        println!("\nFirst {} failures:", failures.len());
        for (_, msg) in &failures {
            println!("  {}", msg);
        }
    }

    // Assert >95% success rate
    let success_rate = success_count as f64 / non_null_count as f64;
    assert!(
        success_rate > 0.95,
        "Parse success rate {:.1}% is below 95% threshold. {} failures out of {} heroes.",
        success_rate * 100.0,
        failure_count,
        non_null_count
    );

    // Ideally we want 100%
    if success_count == non_null_count {
        println!("\nPerfect score! All {} heroes parsed successfully.", non_null_count);
    }
}

#[test]
fn test_hero_roundtrip_from_save() {
    let path = hero_save_path();
    if !path.exists() {
        println!("Skipping roundtrip test - save file not found");
        return;
    }

    let contents = std::fs::read_to_string(&path).expect("Failed to read Hero save file");
    let raw: Vec<Option<serde_json::Value>> =
        serde_json::from_str(&contents).expect("Failed to parse as JSON");

    // Take first non-null hero and do a roundtrip test
    let first_value = raw.iter().find_map(|x| x.as_ref()).expect("No non-null heroes");

    let hero: Hero = serde_json::from_value(first_value.clone()).expect("Failed to parse first hero");

    // Serialize back to Value
    let re_serialized: serde_json::Value =
        serde_json::to_value(&hero).expect("Failed to re-serialize hero");

    // The re-serialized version should have all the same keys as the original
    let original_keys: std::collections::HashSet<String> = first_value
        .as_object()
        .unwrap()
        .keys()
        .cloned()
        .collect();
    let reserialized_keys: std::collections::HashSet<String> = re_serialized
        .as_object()
        .unwrap()
        .keys()
        .cloned()
        .collect();

    let missing_keys: Vec<&String> = original_keys.difference(&reserialized_keys).collect();
    let extra_keys: Vec<&String> = reserialized_keys.difference(&original_keys).collect();

    if !missing_keys.is_empty() {
        println!("WARNING: Keys in original but not in re-serialized: {:?}", missing_keys);
    }
    if !extra_keys.is_empty() {
        println!("WARNING: Keys in re-serialized but not in original: {:?}", extra_keys);
    }

    assert!(
        missing_keys.is_empty(),
        "Lost {} keys during roundtrip: {:?}",
        missing_keys.len(),
        missing_keys
    );
}
