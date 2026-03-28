use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents a kungfu (martial arts) skill learned by a hero.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KungfuSkill {
    #[serde(rename = "skillID")]
    pub skill_id: i32,

    pub lv: i32,

    #[serde(rename = "fightExp")]
    pub fight_exp: f64,

    #[serde(rename = "bookExp")]
    pub book_exp: f64,

    pub equiped: bool,

    #[serde(rename = "isNew")]
    pub is_new: bool,

    #[serde(rename = "belongHeroID")]
    pub belong_hero_id: i32,

    /// Catch-all for unknown/future fields (e.g., speEquipData, extraAddData, etc.).
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

/// Represents a hero tag (buff/debuff/status effect).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeroTag {
    #[serde(rename = "tagID")]
    pub tag_id: i32,

    #[serde(rename = "leftTime")]
    pub left_time: f64,

    /// Can be null or a string (hero name reference).
    #[serde(rename = "sourceHero")]
    pub source_hero: Option<serde_json::Value>,

    /// Catch-all for unknown/future fields.
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

/// Represents a hero's equipment slots and what items are equipped.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Equipment {
    #[serde(rename = "equipmentWeight")]
    pub equipment_weight: f64,

    #[serde(rename = "maxWeaponCount")]
    pub max_weapon_count: i32,

    #[serde(rename = "weaponSaveRecord")]
    pub weapon_save_record: Vec<i32>,

    #[serde(rename = "maxArmorCount")]
    pub max_armor_count: i32,

    #[serde(rename = "armorSaveRecord")]
    pub armor_save_record: Vec<i32>,

    #[serde(rename = "maxHelmetCount")]
    pub max_helmet_count: i32,

    #[serde(rename = "helmetSaveRecord")]
    pub helmet_save_record: Vec<i32>,

    #[serde(rename = "maxShoesCount")]
    pub max_shoes_count: i32,

    #[serde(rename = "shoesSaveRecord")]
    pub shoes_save_record: Vec<i32>,

    #[serde(rename = "maxDecorationCount")]
    pub max_decoration_count: i32,

    #[serde(rename = "decorationSaveRecord")]
    pub decoration_save_record: Vec<i32>,

    /// Catch-all for unknown/future fields.
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

/// Summary view of a hero for list display.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeroSummary {
    #[serde(rename = "heroID")]
    pub hero_id: i32,

    #[serde(rename = "heroName")]
    pub hero_name: String,

    #[serde(rename = "heroNickName")]
    pub hero_nick_name: Option<String>,

    #[serde(rename = "isFemale")]
    pub is_female: bool,

    #[serde(rename = "belongForceID")]
    pub belong_force_id: i32,

    pub dead: bool,

    #[serde(rename = "isLeader")]
    pub is_leader: bool,

    pub age: i32,

    #[serde(rename = "heroForceLv")]
    pub hero_force_lv: i32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kungfu_skill_deserialize() {
        let json = r#"{
            "skillID": 9,
            "lv": 10,
            "fightExp": 0,
            "bookExp": 0,
            "equiped": false,
            "isNew": false,
            "belongHeroID": 0,
            "speEquipData": {"heroSpeAddData": {}},
            "extraAddData": {"heroSpeAddData": {"70": 0.05}}
        }"#;
        let skill: KungfuSkill = serde_json::from_str(json).expect("Failed to deserialize KungfuSkill");
        assert_eq!(skill.skill_id, 9);
        assert_eq!(skill.lv, 10);
        assert_eq!(skill.belong_hero_id, 0);
        assert!(skill.extra.contains_key("speEquipData"));
        assert!(skill.extra.contains_key("extraAddData"));
    }

    #[test]
    fn test_hero_tag_deserialize_null_source() {
        let json = r#"{
            "tagID": 201,
            "leftTime": -1,
            "sourceHero": null
        }"#;
        let tag: HeroTag = serde_json::from_str(json).expect("Failed to deserialize HeroTag");
        assert_eq!(tag.tag_id, 201);
        assert_eq!(tag.left_time, -1.0);
        assert!(tag.source_hero.is_none());
    }

    #[test]
    fn test_hero_tag_deserialize_string_source() {
        let json = r#"{
            "tagID": 100,
            "leftTime": 30.0,
            "sourceHero": "SomeHeroName"
        }"#;
        let tag: HeroTag = serde_json::from_str(json).expect("Failed to deserialize HeroTag");
        assert_eq!(tag.tag_id, 100);
        assert!(tag.source_hero.is_some());
        assert_eq!(tag.source_hero.unwrap(), serde_json::json!("SomeHeroName"));
    }

    #[test]
    fn test_equipment_deserialize() {
        let json = r#"{
            "equipmentWeight": 64.3,
            "maxWeaponCount": 1,
            "weaponSaveRecord": [7],
            "maxArmorCount": 1,
            "armorSaveRecord": [0],
            "maxHelmetCount": 1,
            "helmetSaveRecord": [11],
            "maxShoesCount": 1,
            "shoesSaveRecord": [3],
            "maxDecorationCount": 2,
            "decorationSaveRecord": [4, 6]
        }"#;
        let eq: Equipment = serde_json::from_str(json).expect("Failed to deserialize Equipment");
        assert_eq!(eq.equipment_weight, 64.3);
        assert_eq!(eq.weapon_save_record, vec![7]);
        assert_eq!(eq.decoration_save_record, vec![4, 6]);
        assert_eq!(eq.max_decoration_count, 2);
    }

    #[test]
    fn test_hero_summary_deserialize() {
        let json = r#"{
            "heroID": 0,
            "heroName": "Test Hero",
            "heroNickName": "The Brave",
            "isFemale": false,
            "belongForceID": 1,
            "dead": false,
            "isLeader": true,
            "age": 25,
            "heroForceLv": 5
        }"#;
        let summary: HeroSummary = serde_json::from_str(json).expect("Failed to deserialize HeroSummary");
        assert_eq!(summary.hero_id, 0);
        assert_eq!(summary.hero_name, "Test Hero");
        assert_eq!(summary.hero_nick_name, Some("The Brave".to_string()));
    }

    #[test]
    fn test_kungfu_skill_roundtrip() {
        let json = r#"{
            "skillID": 5,
            "lv": 3,
            "fightExp": 100.5,
            "bookExp": 50.0,
            "equiped": true,
            "isNew": true,
            "belongHeroID": 7
        }"#;
        let skill: KungfuSkill = serde_json::from_str(json).expect("Failed to deserialize");
        let serialized = serde_json::to_string(&skill).expect("Failed to serialize");
        let skill2: KungfuSkill = serde_json::from_str(&serialized).expect("Failed to re-deserialize");
        assert_eq!(skill.skill_id, skill2.skill_id);
        assert_eq!(skill.lv, skill2.lv);
        assert!((skill.fight_exp - skill2.fight_exp).abs() < f64::EPSILON);
    }
}
