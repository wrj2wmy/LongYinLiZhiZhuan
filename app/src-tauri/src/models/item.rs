use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents an individual item in a hero's inventory or storage.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    #[serde(rename = "itemID")]
    pub item_id: i32,

    /// The item type. Renamed from JSON "type" which is a Rust keyword.
    #[serde(rename = "type")]
    pub item_type: i32,

    #[serde(rename = "subType")]
    pub sub_type: i32,

    pub name: String,

    #[serde(rename = "checkName")]
    pub check_name: Option<String>,

    pub describe: Option<String>,

    pub value: i64,

    #[serde(rename = "itemLv")]
    pub item_lv: i32,

    #[serde(rename = "rareLv")]
    pub rare_lv: i32,

    pub weight: f64,

    #[serde(rename = "isNew")]
    pub is_new: bool,

    #[serde(rename = "poisonNum")]
    pub poison_num: f64,

    #[serde(rename = "poisonNumDetected")]
    pub poison_num_detected: bool,

    /// Equipment-specific data, null for non-equipment items.
    #[serde(rename = "equipmentData")]
    pub equipment_data: Option<serde_json::Value>,

    /// Medicine/food-specific data.
    #[serde(rename = "medFoodData")]
    pub med_food_data: Option<serde_json::Value>,

    /// Book-specific data.
    #[serde(rename = "bookData")]
    pub book_data: Option<serde_json::Value>,

    /// Treasure-specific data.
    #[serde(rename = "treasureData")]
    pub treasure_data: Option<serde_json::Value>,

    /// Material-specific data.
    #[serde(rename = "materialData")]
    pub material_data: Option<serde_json::Value>,

    /// Horse-specific data.
    #[serde(rename = "horseData")]
    pub horse_data: Option<serde_json::Value>,

    /// Catch-all for unknown/future fields.
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

/// Container for a hero's inventory or storage, including money and items.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemListData {
    #[serde(rename = "heroID")]
    pub hero_id: i32,

    #[serde(rename = "forceID")]
    pub force_id: i32,

    pub money: i64,

    pub weight: f64,

    #[serde(rename = "maxWeight")]
    pub max_weight: f64,

    #[serde(rename = "allItem")]
    pub all_item: Vec<Item>,

    /// Catch-all for unknown/future fields.
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_item_deserialize() {
        let json = r#"{
            "itemID": 42,
            "type": 1,
            "subType": 2,
            "name": "Test Sword",
            "checkName": null,
            "describe": "A test weapon",
            "value": 1000,
            "itemLv": 3,
            "rareLv": 2,
            "weight": 5.5,
            "isNew": false,
            "poisonNum": 0,
            "poisonNumDetected": false,
            "equipmentData": null,
            "medFoodData": null,
            "bookData": null,
            "treasureData": null,
            "materialData": null,
            "horseData": null
        }"#;
        let item: Item = serde_json::from_str(json).expect("Failed to deserialize Item");
        assert_eq!(item.item_id, 42);
        assert_eq!(item.item_type, 1);
        assert_eq!(item.name, "Test Sword");
        assert!(item.check_name.is_none());
        assert_eq!(item.describe, Some("A test weapon".to_string()));
        assert_eq!(item.weight, 5.5);
    }

    #[test]
    fn test_item_with_extra_fields() {
        let json = r#"{
            "itemID": 1,
            "type": 0,
            "subType": 0,
            "name": "Cloth",
            "checkName": null,
            "describe": null,
            "value": 100,
            "itemLv": 1,
            "rareLv": 1,
            "weight": 1.0,
            "isNew": true,
            "poisonNum": 0,
            "poisonNumDetected": false,
            "equipmentData": null,
            "medFoodData": null,
            "bookData": null,
            "treasureData": null,
            "materialData": null,
            "horseData": null,
            "futureField": "surprise"
        }"#;
        let item: Item = serde_json::from_str(json).expect("Failed to deserialize Item with extra");
        assert_eq!(item.extra.len(), 1);
        assert_eq!(item.extra["futureField"], serde_json::json!("surprise"));
    }

    #[test]
    fn test_item_list_data_deserialize() {
        let json = r#"{
            "heroID": 0,
            "forceID": -1,
            "money": 100000,
            "weight": 50.5,
            "maxWeight": 200.0,
            "allItem": []
        }"#;
        let ild: ItemListData = serde_json::from_str(json).expect("Failed to deserialize ItemListData");
        assert_eq!(ild.hero_id, 0);
        assert_eq!(ild.money, 100000);
        assert!(ild.all_item.is_empty());
    }

    #[test]
    fn test_item_roundtrip() {
        let json = r#"{
            "itemID": 5,
            "type": 2,
            "subType": 3,
            "name": "Potion",
            "checkName": "CheckPotion",
            "describe": null,
            "value": 50,
            "itemLv": 1,
            "rareLv": 0,
            "weight": 0.5,
            "isNew": false,
            "poisonNum": 3,
            "poisonNumDetected": true,
            "equipmentData": null,
            "medFoodData": {"effect": 100},
            "bookData": null,
            "treasureData": null,
            "materialData": null,
            "horseData": null
        }"#;
        let item: Item = serde_json::from_str(json).expect("Failed to deserialize");
        let serialized = serde_json::to_string(&item).expect("Failed to serialize");
        let item2: Item = serde_json::from_str(&serialized).expect("Failed to re-deserialize");
        assert_eq!(item.item_id, item2.item_id);
        assert_eq!(item.name, item2.name);
        assert_eq!(item.check_name, Some("CheckPotion".to_string()));
    }
}
