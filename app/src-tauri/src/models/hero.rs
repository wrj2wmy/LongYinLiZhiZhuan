use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::item::ItemListData;
use super::skill::{Equipment, HeroTag, KungfuSkill};

/// Position on the big map.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigMapPos {
    pub x: f64,
    pub y: f64,
}

/// Face appearance data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FaceData {
    #[serde(rename = "faceID")]
    pub face_id: Vec<i32>,
}

/// The main Hero struct representing a character in the game save.
///
/// Uses a hybrid approach: typed fields for known fields, plus a catch-all
/// `extra` HashMap for any unknown/future fields via `#[serde(flatten)]`.
///
/// The JSON save file uses camelCase and some unusual casing (e.g., heroID),
/// so many fields need explicit `#[serde(rename = "...")]` annotations.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hero {
    // ===== Identity =====
    #[serde(rename = "heroID")]
    pub hero_id: i32,

    #[serde(rename = "heroName")]
    pub hero_name: String,

    #[serde(rename = "heroFamilyName")]
    pub hero_family_name: String,

    #[serde(rename = "heroNickName")]
    pub hero_nick_name: Option<String>,

    #[serde(rename = "isFemale")]
    pub is_female: bool,

    #[serde(rename = "speHero")]
    pub spe_hero: bool,

    #[serde(rename = "tempPlotHero")]
    pub temp_plot_hero: bool,

    #[serde(rename = "recruitAble")]
    pub recruit_able: bool,

    #[serde(rename = "loveAble")]
    pub love_able: bool,

    pub hide: bool,

    pub dead: bool,

    pub age: i32,

    pub generation: i32,

    // ===== Force =====
    #[serde(rename = "belongForceID")]
    pub belong_force_id: i32,

    #[serde(rename = "skillForceID")]
    pub skill_force_id: i32,

    #[serde(rename = "outsideForce")]
    pub outside_force: bool,

    #[serde(rename = "isLeader")]
    pub is_leader: bool,

    #[serde(rename = "heroForceLv")]
    pub hero_force_lv: i32,

    #[serde(rename = "heroStrengthLv")]
    pub hero_strength_lv: f64,

    #[serde(rename = "forceJobType")]
    pub force_job_type: i32,

    #[serde(rename = "forceJobID")]
    pub force_job_id: i32,

    #[serde(rename = "forceJobCD")]
    pub force_job_cd: i32,

    #[serde(rename = "branchLeaderAreaID")]
    pub branch_leader_area_id: i32,

    #[serde(rename = "thisMonthContribution")]
    pub this_month_contribution: f64,

    #[serde(rename = "lastMonthContribution")]
    pub last_month_contribution: f64,

    #[serde(rename = "thisYearContribution")]
    pub this_year_contribution: f64,

    #[serde(rename = "lastYearContribution")]
    pub last_year_contribution: f64,

    #[serde(rename = "lastFightContribution")]
    pub last_fight_contribution: f64,

    // ===== Location =====
    #[serde(rename = "atAreaID")]
    pub at_area_id: i32,

    #[serde(rename = "bigMapPos")]
    pub big_map_pos: BigMapPos,

    #[serde(rename = "inSafeArea")]
    pub in_safe_area: bool,

    #[serde(rename = "inPrison")]
    pub in_prison: bool,

    // ===== Appearance =====
    #[serde(rename = "voicePitch")]
    pub voice_pitch: f64,

    #[serde(rename = "faceData")]
    pub face_data: FaceData,

    #[serde(rename = "skinColorDark")]
    pub skin_color_dark: f64,

    #[serde(rename = "defaultSkinID")]
    pub default_skin_id: i32,

    #[serde(rename = "skinID")]
    pub skin_id: i32,

    #[serde(rename = "skinLv")]
    pub skin_lv: i32,

    #[serde(rename = "changeSkinCd")]
    pub change_skin_cd: i32,

    #[serde(rename = "playerSetSkin")]
    pub player_set_skin: bool,

    #[serde(rename = "setSkinID")]
    pub set_skin_id: i32,

    #[serde(rename = "setSkinLv")]
    pub set_skin_lv: i32,

    // ===== Skill Focus =====
    #[serde(rename = "kungfuSkillFocus")]
    pub kungfu_skill_focus: Vec<serde_json::Value>,

    #[serde(rename = "livingSkillFocus")]
    pub living_skill_focus: Vec<serde_json::Value>,

    #[serde(rename = "goodKungfuSkillName")]
    pub good_kungfu_skill_name: Vec<serde_json::Value>,

    #[serde(rename = "haveMeet")]
    pub have_meet: bool,

    pub favor: f64,

    // ===== Attributes (6-element float arrays) =====
    #[serde(rename = "baseAttri")]
    pub base_attri: Vec<f64>,

    #[serde(rename = "maxAttri")]
    pub max_attri: Vec<f64>,

    #[serde(rename = "totalAttri")]
    pub total_attri: Vec<f64>,

    // ===== Combat Skills (9-element float arrays) =====
    #[serde(rename = "baseFightSkill")]
    pub base_fight_skill: Vec<f64>,

    #[serde(rename = "maxFightSkill")]
    pub max_fight_skill: Vec<f64>,

    #[serde(rename = "totalFightSkill")]
    pub total_fight_skill: Vec<f64>,

    // ===== Living Skills (9-element arrays) =====
    #[serde(rename = "baseLivingSkill")]
    pub base_living_skill: Vec<f64>,

    #[serde(rename = "maxLivingSkill")]
    pub max_living_skill: Vec<f64>,

    #[serde(rename = "totalLivingSkill")]
    pub total_living_skill: Vec<f64>,

    #[serde(rename = "expLivingSkill")]
    pub exp_living_skill: Vec<f64>,

    // ===== Health =====
    pub hp: f64,

    pub maxhp: f64,

    #[serde(rename = "realMaxHp")]
    pub real_max_hp: f64,

    pub power: f64,

    #[serde(rename = "maxPower")]
    pub max_power: f64,

    #[serde(rename = "realMaxPower")]
    pub real_max_power: f64,

    pub mana: f64,

    #[serde(rename = "maxMana")]
    pub max_mana: f64,

    #[serde(rename = "realMaxMana")]
    pub real_max_mana: f64,

    pub armor: f64,

    #[serde(rename = "externalInjury")]
    pub external_injury: f64,

    #[serde(rename = "internalInjury")]
    pub internal_injury: f64,

    #[serde(rename = "poisonInjury")]
    pub poison_injury: f64,

    // ===== Reputation =====
    #[serde(rename = "isGovern")]
    pub is_govern: bool,

    #[serde(rename = "governLv")]
    pub govern_lv: i32,

    #[serde(rename = "governContribution")]
    pub govern_contribution: f64,

    #[serde(rename = "isHornord")]
    pub is_hornord: bool,

    #[serde(rename = "hornorLv")]
    pub hornor_lv: i32,

    #[serde(rename = "forceContribution")]
    pub force_contribution: f64,

    pub fame: f64,

    #[serde(rename = "badFame")]
    pub bad_fame: f64,

    pub loyal: f64,

    pub evil: f64,

    pub chaos: f64,

    pub nature: i32,

    pub talent: i32,

    pub hobby: Vec<i32>,

    // ===== Status =====
    pub rest: bool,

    #[serde(rename = "cureType")]
    pub cure_type: i32,

    pub salary: f64,

    pub population: i32,

    // ===== Equipment =====
    #[serde(rename = "nowEquipment")]
    pub now_equipment: Equipment,

    #[serde(rename = "horseSaveRecord")]
    pub horse_save_record: i32,

    #[serde(rename = "horseArmorSaveRecord")]
    pub horse_armor_save_record: i32,

    // ===== Inventory =====
    #[serde(rename = "itemListData")]
    pub item_list_data: ItemListData,

    // ===== Skills =====
    #[serde(rename = "kungfuSkills")]
    pub kungfu_skills: Vec<KungfuSkill>,

    // ===== Relationships (UPPERCASE in JSON) =====
    #[serde(rename = "Teacher")]
    pub teacher: i32,

    #[serde(rename = "Students")]
    pub students: Vec<i32>,

    #[serde(rename = "Lover")]
    pub lover: i32,

    #[serde(rename = "PreLovers")]
    pub pre_lovers: Vec<i32>,

    #[serde(rename = "Relatives")]
    pub relatives: Vec<i32>,

    #[serde(rename = "Brothers")]
    pub brothers: Vec<i32>,

    #[serde(rename = "Friends")]
    pub friends: Vec<i32>,

    #[serde(rename = "Haters")]
    pub haters: Vec<i32>,

    // ===== Team =====
    #[serde(rename = "inTeam")]
    pub in_team: bool,

    #[serde(rename = "teamLeader")]
    pub team_leader: i32,

    #[serde(rename = "teamMates")]
    pub team_mates: Vec<i32>,

    // ===== Tags =====
    #[serde(rename = "heroTagData")]
    pub hero_tag_data: Vec<HeroTag>,

    #[serde(rename = "heroTagPoint")]
    pub hero_tag_point: f64,

    // ===== Catch-all for unknown/future fields =====
    /// This HashMap captures all fields not explicitly defined above.
    /// Examples: heroAIData, heroAISettingData, recordLog, missions,
    /// fightScore, skillCount, autoSetting, bodyGuard, etc.
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

impl Hero {
    /// Create a lightweight summary of this hero for list display.
    pub fn to_summary(&self) -> super::skill::HeroSummary {
        super::skill::HeroSummary {
            hero_id: self.hero_id,
            hero_name: self.hero_name.clone(),
            hero_nick_name: self.hero_nick_name.clone(),
            is_female: self.is_female,
            belong_force_id: self.belong_force_id,
            dead: self.dead,
            is_leader: self.is_leader,
            age: self.age,
            hero_force_lv: self.hero_force_lv,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn minimal_hero_json() -> String {
        r#"{
            "heroID": 0,
            "heroName": "TestHero",
            "heroFamilyName": "Test",
            "heroNickName": null,
            "isFemale": false,
            "speHero": false,
            "tempPlotHero": false,
            "recruitAble": true,
            "loveAble": false,
            "hide": false,
            "dead": false,
            "age": 20,
            "generation": 1,
            "belongForceID": 1,
            "skillForceID": -1,
            "outsideForce": false,
            "isLeader": false,
            "heroForceLv": 1,
            "heroStrengthLv": 0,
            "forceJobType": -1,
            "forceJobID": -1,
            "forceJobCD": 0,
            "branchLeaderAreaID": -1,
            "thisMonthContribution": 0,
            "lastMonthContribution": 0,
            "thisYearContribution": 0,
            "lastYearContribution": 0,
            "lastFightContribution": 0,
            "atAreaID": 1,
            "bigMapPos": {"x": 0, "y": 0},
            "inSafeArea": true,
            "inPrison": false,
            "voicePitch": 1.0,
            "faceData": {"faceID": [0,0,0,0,0,0,0,0,0]},
            "skinColorDark": 0,
            "defaultSkinID": -1,
            "skinID": -1,
            "skinLv": 1,
            "changeSkinCd": 0,
            "playerSetSkin": false,
            "setSkinID": -100,
            "setSkinLv": 1,
            "kungfuSkillFocus": [],
            "livingSkillFocus": [],
            "goodKungfuSkillName": [],
            "haveMeet": false,
            "favor": 0,
            "baseAttri": [100,100,100,100,100,100],
            "maxAttri": [100,100,100,100,100,100],
            "totalAttri": [100,100,100,100,100,100],
            "baseFightSkill": [100,100,100,100,100,100,100,100,100],
            "maxFightSkill": [100,100,100,100,100,100,100,100,100],
            "totalFightSkill": [100,100,100,100,100,100,100,100,100],
            "baseLivingSkill": [100,100,100,100,100,100,100,100,100],
            "maxLivingSkill": [100,100,100,100,100,100,100,100,100],
            "totalLivingSkill": [100,100,100,100,100,100,100,100,100],
            "expLivingSkill": [0,0,0,0,0,0,0,0,0],
            "hp": 100, "maxhp": 100, "realMaxHp": 100,
            "power": 100, "maxPower": 100, "realMaxPower": 100,
            "mana": 100, "maxMana": 100, "realMaxMana": 100,
            "armor": 0,
            "externalInjury": 0, "internalInjury": 0, "poisonInjury": 0,
            "isGovern": false, "governLv": 0, "governContribution": 0,
            "isHornord": false, "hornorLv": 0, "forceContribution": 0,
            "fame": 0, "badFame": 0, "loyal": 50, "evil": 50, "chaos": 50,
            "nature": 5, "talent": 0, "hobby": [],
            "rest": false, "cureType": -1, "salary": 0, "population": 0,
            "nowEquipment": {
                "equipmentWeight": 0,
                "maxWeaponCount": 1, "weaponSaveRecord": [],
                "maxArmorCount": 1, "armorSaveRecord": [],
                "maxHelmetCount": 1, "helmetSaveRecord": [],
                "maxShoesCount": 1, "shoesSaveRecord": [],
                "maxDecorationCount": 1, "decorationSaveRecord": []
            },
            "horseSaveRecord": -1,
            "horseArmorSaveRecord": -1,
            "itemListData": {
                "heroID": 0, "forceID": -1, "money": 0,
                "weight": 0, "maxWeight": 100, "allItem": []
            },
            "kungfuSkills": [],
            "Teacher": -1, "Students": [], "Lover": -1,
            "PreLovers": [], "Relatives": [], "Brothers": [],
            "Friends": [], "Haters": [],
            "inTeam": false, "teamLeader": -1, "teamMates": [],
            "heroTagData": [], "heroTagPoint": 0
        }"#.to_string()
    }

    #[test]
    fn test_hero_deserialize_minimal() {
        let json = minimal_hero_json();
        let hero: Hero = serde_json::from_str(&json).expect("Failed to deserialize Hero");
        assert_eq!(hero.hero_id, 0);
        assert_eq!(hero.hero_name, "TestHero");
        assert!(hero.hero_nick_name.is_none());
        assert_eq!(hero.base_attri.len(), 6);
        assert_eq!(hero.base_fight_skill.len(), 9);
        assert_eq!(hero.teacher, -1);
        assert!(hero.kungfu_skills.is_empty());
    }

    #[test]
    fn test_hero_with_extra_fields() {
        let json = minimal_hero_json();
        // Parse as Value, add extra fields, re-serialize
        let mut val: serde_json::Value = serde_json::from_str(&json).unwrap();
        val["fightScore"] = serde_json::json!(50000.0);
        val["recordLog"] = serde_json::json!(["entry1", "entry2"]);
        val["bodyGuard"] = serde_json::json!(false);

        let hero: Hero = serde_json::from_value(val).expect("Failed to deserialize Hero with extras");
        assert_eq!(hero.extra.len(), 3);
        assert!(hero.extra.contains_key("fightScore"));
        assert!(hero.extra.contains_key("recordLog"));
        assert!(hero.extra.contains_key("bodyGuard"));
    }

    #[test]
    fn test_hero_to_summary() {
        let json = minimal_hero_json();
        let hero: Hero = serde_json::from_str(&json).expect("Failed to deserialize Hero");
        let summary = hero.to_summary();
        assert_eq!(summary.hero_id, 0);
        assert_eq!(summary.hero_name, "TestHero");
        assert!(summary.hero_nick_name.is_none());
        assert!(!summary.is_female);
        assert!(!summary.dead);
    }

    #[test]
    fn test_hero_roundtrip() {
        let json = minimal_hero_json();
        let hero: Hero = serde_json::from_str(&json).expect("Failed to deserialize");
        let serialized = serde_json::to_string(&hero).expect("Failed to serialize");
        let hero2: Hero = serde_json::from_str(&serialized).expect("Failed to re-deserialize");
        assert_eq!(hero.hero_id, hero2.hero_id);
        assert_eq!(hero.hero_name, hero2.hero_name);
        assert_eq!(hero.base_attri, hero2.base_attri);
        assert_eq!(hero.teacher, hero2.teacher);
    }

    #[test]
    fn test_face_data_deserialize() {
        let json = r#"{"faceID": [15, 41, 0, 21, 12, 0, 21, -1, -1]}"#;
        let fd: FaceData = serde_json::from_str(json).expect("Failed to deserialize FaceData");
        assert_eq!(fd.face_id.len(), 9);
        assert_eq!(fd.face_id[0], 15);
        assert_eq!(fd.face_id[7], -1);
    }

    #[test]
    fn test_big_map_pos_deserialize() {
        let json = r#"{"x": -5181, "y": 1342}"#;
        let pos: BigMapPos = serde_json::from_str(json).expect("Failed to deserialize BigMapPos");
        assert_eq!(pos.x, -5181.0);
        assert_eq!(pos.y, 1342.0);
    }
}
