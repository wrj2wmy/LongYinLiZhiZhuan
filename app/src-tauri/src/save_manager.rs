use crate::models::hero::Hero;
use crate::models::skill::HeroSummary;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSlotInfo {
    pub path: String,
    pub slot_name: String,
    pub save_version: Option<String>,
    pub save_detail: Option<String>,
    pub save_time: Option<String>,
}

#[derive(Debug, Clone)]
pub struct EditCommand {
    pub hero_index: usize,
    pub field_path: String,
    pub old_value: Value,
    pub new_value: Value,
    pub description: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EditStatus {
    pub can_undo: bool,
    pub can_redo: bool,
    pub unsaved_changes: usize,
    pub undo_description: Option<String>,
    pub redo_description: Option<String>,
}

pub struct SaveManager {
    /// The full hero array as raw Values (preserves null entries and ordering)
    heroes_raw: Vec<Option<Value>>,
    /// Parsed typed heroes indexed by their position in the array
    heroes: Vec<Option<Hero>>,
    /// Path to the currently loaded Hero file
    hero_file_path: Option<PathBuf>,
    /// Undo/redo stacks
    undo_stack: Vec<EditCommand>,
    redo_stack: Vec<EditCommand>,
    /// Count of changes since last save
    unsaved_count: usize,
}

impl Default for SaveManager {
    fn default() -> Self {
        Self::new()
    }
}

impl SaveManager {
    pub fn new() -> Self {
        SaveManager {
            heroes_raw: Vec::new(),
            heroes: Vec::new(),
            hero_file_path: None,
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            unsaved_count: 0,
        }
    }

    /// Load hero file from a save slot directory
    pub fn load_hero_file(&mut self, slot_dir: &Path) -> Result<usize, String> {
        let hero_path = slot_dir.join("Hero");
        let content = fs::read_to_string(&hero_path)
            .map_err(|e| format!("Failed to read Hero file: {}", e))?;

        let raw: Vec<Option<Value>> = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse Hero JSON: {}", e))?;

        let mut heroes = Vec::with_capacity(raw.len());
        let mut count = 0;
        for entry in &raw {
            match entry {
                Some(val) => {
                    match serde_json::from_value::<Hero>(val.clone()) {
                        Ok(hero) => {
                            count += 1;
                            heroes.push(Some(hero));
                        }
                        Err(e) => {
                            eprintln!("Warning: hero at index {} failed to parse: {}", heroes.len(), e);
                            heroes.push(None);
                        }
                    }
                }
                None => heroes.push(None),
            }
        }

        self.heroes_raw = raw;
        self.heroes = heroes;
        self.hero_file_path = Some(hero_path);
        self.undo_stack.clear();
        self.redo_stack.clear();
        self.unsaved_count = 0;

        Ok(count)
    }

    /// Get list of hero summaries for the list panel
    pub fn get_hero_list(&self) -> Vec<HeroSummary> {
        self.heroes
            .iter()
            .filter_map(|h| h.as_ref().map(|hero| hero.to_summary()))
            .collect()
    }

    /// Get a full hero by its hero_id
    pub fn get_hero(&self, hero_id: i32) -> Option<&Hero> {
        self.heroes.iter().find_map(|h| {
            h.as_ref().filter(|hero| hero.hero_id == hero_id)
        })
    }

    /// Update a field on a hero. Returns the old value for undo.
    pub fn update_hero_field(
        &mut self,
        hero_id: i32,
        field_path: &str,
        new_value: Value,
    ) -> Result<(), String> {
        let idx = self.heroes.iter().position(|h| {
            h.as_ref().is_some_and(|hero| hero.hero_id == hero_id)
        }).ok_or_else(|| format!("Hero {} not found", hero_id))?;

        let raw = self.heroes_raw[idx].as_mut()
            .ok_or_else(|| format!("Hero {} raw data is null", hero_id))?;

        let old_value = get_nested_value(raw, field_path)
            .cloned()
            .unwrap_or(Value::Null);

        if old_value == new_value {
            return Ok(());
        }

        set_nested_value(raw, field_path, new_value.clone())?;

        let hero = serde_json::from_value::<Hero>(raw.clone())
            .map_err(|e| format!("Failed to re-parse hero after edit: {}", e))?;

        let description = format!(
            "修改 {} 的 {}: {} -> {}",
            hero.hero_name, field_path, old_value, new_value
        );

        self.heroes[idx] = Some(hero);

        self.undo_stack.push(EditCommand {
            hero_index: idx,
            field_path: field_path.to_string(),
            old_value,
            new_value,
            description,
        });
        self.redo_stack.clear();
        self.unsaved_count += 1;

        Ok(())
    }

    /// Undo the last edit
    pub fn undo(&mut self) -> Result<Option<String>, String> {
        let cmd = match self.undo_stack.pop() {
            Some(cmd) => cmd,
            None => return Ok(None),
        };

        let raw = self.heroes_raw[cmd.hero_index].as_mut()
            .ok_or("Hero raw data is null")?;
        set_nested_value(raw, &cmd.field_path, cmd.old_value.clone())?;

        let hero = serde_json::from_value::<Hero>(raw.clone())
            .map_err(|e| format!("Failed to re-parse hero after undo: {}", e))?;
        self.heroes[cmd.hero_index] = Some(hero);

        let desc = cmd.description.clone();
        self.redo_stack.push(cmd);
        self.unsaved_count = self.unsaved_count.saturating_sub(1);

        Ok(Some(desc))
    }

    /// Redo the last undone edit
    pub fn redo(&mut self) -> Result<Option<String>, String> {
        let cmd = match self.redo_stack.pop() {
            Some(cmd) => cmd,
            None => return Ok(None),
        };

        let raw = self.heroes_raw[cmd.hero_index].as_mut()
            .ok_or("Hero raw data is null")?;
        set_nested_value(raw, &cmd.field_path, cmd.new_value.clone())?;

        let hero = serde_json::from_value::<Hero>(raw.clone())
            .map_err(|e| format!("Failed to re-parse hero after redo: {}", e))?;
        self.heroes[cmd.hero_index] = Some(hero);

        let desc = cmd.description.clone();
        self.undo_stack.push(cmd);
        self.unsaved_count += 1;

        Ok(Some(desc))
    }

    pub fn get_edit_status(&self) -> EditStatus {
        EditStatus {
            can_undo: !self.undo_stack.is_empty(),
            can_redo: !self.redo_stack.is_empty(),
            unsaved_changes: self.unsaved_count,
            undo_description: self.undo_stack.last().map(|c| c.description.clone()),
            redo_description: self.redo_stack.last().map(|c| c.description.clone()),
        }
    }

    /// Save the hero file with backup
    pub fn save(&mut self) -> Result<String, String> {
        let path = self.hero_file_path.as_ref()
            .ok_or("No file loaded")?;

        // Create backup
        let backup_path = format!(
            "{}.bak.{}",
            path.display(),
            chrono::Local::now().format("%Y%m%d_%H%M%S")
        );
        fs::copy(path, &backup_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;

        // Serialize and write
        let json = serde_json::to_string(&self.heroes_raw)
            .map_err(|e| format!("Failed to serialize: {}", e))?;
        let temp_path = path.with_extension("tmp");
        fs::write(&temp_path, &json)
            .map_err(|e| format!("Failed to write temp file: {}", e))?;
        fs::rename(&temp_path, path)
            .map_err(|e| format!("Failed to rename temp file: {}", e))?;

        self.unsaved_count = 0;
        Ok(backup_path)
    }
}

/// Navigate a nested JSON value by dot-separated path
fn get_nested_value<'a>(val: &'a Value, path: &str) -> Option<&'a Value> {
    let mut current = val;
    for part in path.split('.') {
        match current {
            Value::Object(map) => {
                current = map.get(part)?;
            }
            Value::Array(arr) => {
                let idx: usize = part.parse().ok()?;
                current = arr.get(idx)?;
            }
            _ => return None,
        }
    }
    Some(current)
}

/// Set a value at a nested dot-separated path
fn set_nested_value(val: &mut Value, path: &str, new_val: Value) -> Result<(), String> {
    let parts: Vec<&str> = path.split('.').collect();
    if parts.is_empty() {
        return Err("Empty path".to_string());
    }

    let mut current = val;
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            match current {
                Value::Object(map) => {
                    map.insert(part.to_string(), new_val);
                    return Ok(());
                }
                Value::Array(arr) => {
                    let idx: usize = part.parse()
                        .map_err(|_| format!("Invalid array index: {}", part))?;
                    if idx < arr.len() {
                        arr[idx] = new_val;
                        return Ok(());
                    }
                    return Err(format!("Array index {} out of bounds", idx));
                }
                _ => return Err(format!("Cannot set field on non-object/array at {}", part)),
            }
        } else {
            match current {
                Value::Object(map) => {
                    current = map.get_mut(*part)
                        .ok_or_else(|| format!("Field '{}' not found", part))?;
                }
                Value::Array(arr) => {
                    let idx: usize = part.parse()
                        .map_err(|_| format!("Invalid array index: {}", part))?;
                    current = arr.get_mut(idx)
                        .ok_or_else(|| format!("Array index {} out of bounds", idx))?;
                }
                _ => return Err(format!("Cannot navigate into non-object/array at {}", part)),
            }
        }
    }
    unreachable!()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_nested_value() {
        let val: Value = serde_json::json!({
            "heroName": "李逍遥",
            "baseAttri": [120.0, 130.0, 140.0],
            "bigMapPos": {"x": 100.0, "y": 200.0}
        });
        assert_eq!(get_nested_value(&val, "heroName"), Some(&Value::String("李逍遥".to_string())));
        assert_eq!(get_nested_value(&val, "baseAttri.1"), Some(&serde_json::json!(130.0)));
        assert_eq!(get_nested_value(&val, "bigMapPos.x"), Some(&serde_json::json!(100.0)));
        assert_eq!(get_nested_value(&val, "nonexistent"), None);
    }

    #[test]
    fn test_set_nested_value() {
        let mut val: Value = serde_json::json!({
            "heroName": "李逍遥",
            "baseAttri": [120.0, 130.0, 140.0],
            "bigMapPos": {"x": 100.0, "y": 200.0}
        });

        set_nested_value(&mut val, "heroName", Value::String("Test".to_string())).unwrap();
        assert_eq!(val["heroName"], "Test");

        set_nested_value(&mut val, "baseAttri.1", serde_json::json!(999.0)).unwrap();
        assert_eq!(val["baseAttri"][1], 999.0);

        set_nested_value(&mut val, "bigMapPos.x", serde_json::json!(500.0)).unwrap();
        assert_eq!(val["bigMapPos"]["x"], 500.0);
    }

    #[test]
    fn test_edit_status_default() {
        let mgr = SaveManager::new();
        let status = mgr.get_edit_status();
        assert!(!status.can_undo);
        assert!(!status.can_redo);
        assert_eq!(status.unsaved_changes, 0);
    }
}
