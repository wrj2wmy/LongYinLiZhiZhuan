# Save Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Tauri v2 desktop app that loads, displays, and edits the Hero save file for 龙隐立志传, with form-based UI, undo/redo, and auto-backup.

**Architecture:** Rust backend owns the 37MB Hero JSON in memory (parsed via serde into hybrid typed+dynamic structs). React frontend requests hero summaries for the list, full hero data on demand, and sends field-level updates via Tauri IPC. Undo/redo uses a command stack in Rust.

**Tech Stack:** Tauri v2, Rust (serde, serde_json), React 18, TypeScript, Vite, Vitest, react-window (virtualized list)

---

## Task 1: Scaffold Tauri Project

**Files:**
- Create: entire project scaffold via `create-tauri-app`
- Modify: `src-tauri/Cargo.toml` (add serde deps)
- Modify: `package.json` (add test deps)

**Step 1: Create the Tauri project**

Run from `C:/Users/renji/IdeaProjects/LongYinLiZhiZhuan`:

```bash
npm create tauri-app@latest app -- --template react-ts
```

When prompted for bundle identifier, use: `com.longyinlizhizhuan.saveeditor`

**Step 2: Install frontend dependencies**

```bash
cd app
npm install
npm install react-window @types/react-window
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @tauri-apps/api
```

**Step 3: Add Rust dependencies to `app/src-tauri/Cargo.toml`**

Add to `[dependencies]`:

```toml
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**Step 4: Configure Vitest in `app/vite.config.ts`**

Add test config:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  // ... keep existing config
});
```

**Step 5: Add test script to `app/package.json`**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Step 6: Verify the scaffold builds**

```bash
cd app/src-tauri && cargo check
cd app && npm run build
```

**Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Tauri v2 project with React + TypeScript"
```

---

## Task 2: Rust Data Model - Core Hero Struct

**Files:**
- Create: `app/src-tauri/src/models/mod.rs`
- Create: `app/src-tauri/src/models/hero.rs`
- Create: `app/src-tauri/src/models/item.rs`
- Create: `app/src-tauri/src/models/skill.rs`
- Modify: `app/src-tauri/src/lib.rs` (add mod)

**Step 1: Write the test - Hero struct deserializes from a minimal JSON snippet**

Create `app/src-tauri/src/models/hero.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FaceData {
    #[serde(rename = "faceID")]
    pub face_id: Vec<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Equipment {
    pub equipment_weight: f64,
    pub max_weapon_count: i32,
    pub weapon_save_record: Vec<i32>,
    pub max_armor_count: i32,
    pub armor_save_record: Vec<i32>,
    pub max_helmet_count: i32,
    pub helmet_save_record: Vec<i32>,
    pub max_shoes_count: i32,
    pub shoes_save_record: Vec<i32>,
    pub max_decoration_count: i32,
    pub decoration_save_record: Vec<i32>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeroTag {
    #[serde(rename = "tagID")]
    pub tag_id: i32,
    pub left_time: f64,
    pub source_hero: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeroAISettingEntry {
    pub priority_lv: i32,
    #[serde(rename = "speFocusID")]
    pub spe_focus_id: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeroAISettingData {
    #[serde(rename = "heroAISettingDatas")]
    pub hero_ai_setting_datas: HashMap<String, HeroAISettingEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Hero {
    // Identity
    #[serde(rename = "heroID")]
    pub hero_id: i32,
    pub hero_name: String,
    pub hero_family_name: String,
    pub hero_nick_name: Option<String>,
    pub is_female: bool,
    pub spe_hero: bool,
    pub temp_plot_hero: bool,
    pub recruit_able: bool,
    pub love_able: bool,
    pub hide: bool,
    pub dead: bool,
    pub age: i32,
    pub generation: i32,

    // Force/Faction
    #[serde(rename = "belongForceID")]
    pub belong_force_id: i32,
    #[serde(rename = "skillForceID")]
    pub skill_force_id: i32,
    pub outside_force: bool,
    pub is_leader: bool,
    pub hero_force_lv: i32,
    pub hero_strength_lv: f64,
    pub force_job_type: i32,
    #[serde(rename = "forceJobID")]
    pub force_job_id: i32,
    #[serde(rename = "forceJobCD")]
    pub force_job_cd: i32,
    #[serde(rename = "branchLeaderAreaID")]
    pub branch_leader_area_id: i32,

    // Contribution
    pub this_month_contribution: f64,
    pub last_month_contribution: f64,
    pub this_year_contribution: f64,
    pub last_year_contribution: f64,
    pub last_fight_contribution: f64,

    // Location
    #[serde(rename = "atAreaID")]
    pub at_area_id: i32,
    pub big_map_pos: Position,
    pub in_safe_area: bool,
    pub in_prison: bool,

    // Appearance
    pub voice_pitch: f64,
    pub face_data: FaceData,
    pub skin_color_dark: f64,
    #[serde(rename = "defaultSkinID")]
    pub default_skin_id: i32,
    #[serde(rename = "skinID")]
    pub skin_id: i32,
    pub skin_lv: i32,
    pub change_skin_cd: i32,
    pub player_set_skin: bool,
    #[serde(rename = "setSkinID")]
    pub set_skin_id: i32,
    pub set_skin_lv: i32,

    // Skill focus
    pub kungfu_skill_focus: Vec<serde_json::Value>,
    pub living_skill_focus: Vec<serde_json::Value>,
    pub good_kungfu_skill_name: Vec<serde_json::Value>,
    pub have_meet: bool,
    pub favor: f64,

    // Core Attributes (6-element: 力道/灵巧/智力/意志/体质/经脉)
    pub base_attri: Vec<f64>,
    pub max_attri: Vec<f64>,
    pub total_attri: Vec<f64>,

    // Combat Skills (9-element: 内功/轻功/绝技/拳掌/剑法/刀法/长兵/奇门/射术)
    pub base_fight_skill: Vec<f64>,
    pub max_fight_skill: Vec<f64>,
    pub total_fight_skill: Vec<f64>,

    // Living Skills (9-element: 医术/毒术/学识/口才/采伐/木植/锻造/炼药/烹饪)
    pub base_living_skill: Vec<f64>,
    pub max_living_skill: Vec<f64>,
    pub total_living_skill: Vec<f64>,
    pub exp_living_skill: Vec<f64>,

    // Health
    pub hp: f64,
    pub maxhp: f64,
    pub real_max_hp: f64,
    pub power: f64,
    pub max_power: f64,
    pub real_max_power: f64,
    pub mana: f64,
    pub max_mana: f64,
    pub real_max_mana: f64,
    pub armor: f64,
    pub external_injury: f64,
    pub internal_injury: f64,
    pub poison_injury: f64,

    // Reputation
    pub is_govern: bool,
    pub govern_lv: i32,
    pub govern_contribution: f64,
    pub is_hornord: bool,
    pub hornor_lv: i32,
    pub force_contribution: f64,
    pub fame: f64,
    pub bad_fame: f64,
    pub loyal: f64,
    pub evil: f64,
    pub chaos: f64,
    pub nature: i32,
    pub talent: i32,
    pub hobby: Vec<i32>,

    // Status
    pub rest: bool,
    pub cure_type: i32,
    pub salary: i32,
    pub population: i32,

    // Equipment
    pub now_equipment: Equipment,
    pub horse_save_record: i32,
    pub horse_armor_save_record: i32,

    // Inventory
    pub item_list_data: super::item::ItemListData,

    // Skills
    pub kungfu_skills: Vec<super::skill::KungfuSkill>,

    // Relationships
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

    // Team
    pub in_team: bool,
    pub team_leader: i32,
    pub team_mates: Vec<i32>,

    // Tags
    pub hero_tag_data: Vec<HeroTag>,
    pub hero_tag_point: f64,

    // Catch-all for unknown/new fields
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

/// Lightweight summary for the hero list panel
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeroSummary {
    pub hero_id: i32,
    pub hero_name: String,
    pub hero_nick_name: Option<String>,
    pub is_female: bool,
    pub belong_force_id: i32,
    pub dead: bool,
    pub is_leader: bool,
    pub age: i32,
    pub hero_force_lv: i32,
}

impl Hero {
    pub fn to_summary(&self) -> HeroSummary {
        HeroSummary {
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

    #[test]
    fn test_hero_summary() {
        let json = r#"{
            "heroID": 0, "heroName": "李逍遥", "heroFamilyName": "李",
            "heroNickName": "天下第一", "isFemale": false, "speHero": false,
            "tempPlotHero": false, "recruitAble": false, "loveAble": false,
            "hide": false, "dead": false, "age": 18, "generation": 1,
            "belongForceID": 25, "skillForceID": -1, "outsideForce": false,
            "isLeader": true, "heroForceLv": 5, "heroStrengthLv": 0.0,
            "forceJobType": -1, "forceJobID": -1, "forceJobCD": 0,
            "branchLeaderAreaID": -1,
            "thisMonthContribution": 0.0, "lastMonthContribution": 0.0,
            "thisYearContribution": 0.0, "lastYearContribution": 0.0,
            "lastFightContribution": 0.0,
            "atAreaID": 66, "bigMapPos": {"x": -5181.0, "y": 1342.0},
            "inSafeArea": true, "inPrison": false,
            "voicePitch": 1.0, "faceData": {"faceID": [15,41,0,21,12,0,21,-1,-1]},
            "skinColorDark": 0.0, "defaultSkinID": -4, "skinID": -100,
            "skinLv": 5, "changeSkinCd": 0, "playerSetSkin": true,
            "setSkinID": -100, "setSkinLv": 5,
            "kungfuSkillFocus": [], "livingSkillFocus": [],
            "goodKungfuSkillName": [], "haveMeet": false, "favor": -999999.0,
            "baseAttri": [120.0,120.0,120.0,120.0,120.0,120.0],
            "maxAttri": [120.0,120.0,120.0,120.0,120.0,120.0],
            "totalAttri": [139.0,173.0,187.0,159.0,132.0,238.0],
            "baseFightSkill": [120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0],
            "maxFightSkill": [120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0],
            "totalFightSkill": [168.0,182.0,148.0,122.0,143.0,123.0,127.0,135.0,129.0],
            "baseLivingSkill": [100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0],
            "maxLivingSkill": [100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0],
            "totalLivingSkill": [101.0,102.0,104.0,101.0,102.0,101.0,101.0,102.0,102.0],
            "expLivingSkill": [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],
            "hp": 846.92, "maxhp": 846.92, "realMaxHp": 846.92,
            "power": 186.5, "maxPower": 186.5, "realMaxPower": 186.5,
            "mana": 5468.686, "maxMana": 5468.686, "realMaxMana": 5468.686,
            "armor": 42.435, "externalInjury": 0.0, "internalInjury": 0.0,
            "poisonInjury": 0.0,
            "isGovern": true, "governLv": 10, "governContribution": 11421.6416,
            "isHornord": true, "hornorLv": 10, "forceContribution": 3200.0,
            "fame": 9999.0, "badFame": 0.0, "loyal": 0.0, "evil": 50.0,
            "chaos": 50.0, "nature": 6, "talent": 0, "hobby": [],
            "rest": false, "cureType": -1, "salary": 320, "population": 32,
            "nowEquipment": {
                "equipmentWeight": 64.3, "maxWeaponCount": 1,
                "weaponSaveRecord": [7], "maxArmorCount": 1,
                "armorSaveRecord": [0], "maxHelmetCount": 1,
                "helmetSaveRecord": [11], "maxShoesCount": 1,
                "shoesSaveRecord": [3], "maxDecorationCount": 2,
                "decorationSaveRecord": [4, 6]
            },
            "horseSaveRecord": 15, "horseArmorSaveRecord": 1,
            "itemListData": {
                "heroID": 0, "forceID": -1, "money": 95803802,
                "weight": 422.9, "maxWeight": 709.0, "allItem": []
            },
            "kungfuSkills": [],
            "Teacher": -1, "Students": [], "Lover": -1, "PreLovers": [],
            "Relatives": [], "Brothers": [], "Friends": [], "Haters": [],
            "inTeam": false, "teamLeader": -1, "teamMates": [],
            "heroTagData": [], "heroTagPoint": 0.0
        }"#;

        let hero: Hero = serde_json::from_str(json).unwrap();
        assert_eq!(hero.hero_id, 0);
        assert_eq!(hero.hero_name, "李逍遥");
        assert!(hero.is_leader);
        assert_eq!(hero.base_attri.len(), 6);
        assert_eq!(hero.base_fight_skill.len(), 9);

        let summary = hero.to_summary();
        assert_eq!(summary.hero_id, 0);
        assert_eq!(summary.hero_name, "李逍遥");
        assert!(summary.is_leader);
    }
}
```

**Step 2: Create `app/src-tauri/src/models/item.rs`**

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemListData {
    #[serde(rename = "heroID")]
    pub hero_id: i32,
    #[serde(rename = "forceID")]
    pub force_id: i32,
    pub money: i64,
    pub weight: f64,
    pub max_weight: f64,
    pub all_item: Vec<Item>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    #[serde(rename = "itemID")]
    pub item_id: i32,
    #[serde(rename = "type")]
    pub item_type: i32,
    pub sub_type: i32,
    pub name: String,
    pub check_name: Option<String>,
    pub describe: Option<String>,
    pub value: i32,
    pub item_lv: i32,
    pub rare_lv: i32,
    pub weight: f64,
    pub is_new: bool,
    pub poison_num: f64,
    pub poison_num_detected: bool,
    pub equipment_data: Option<serde_json::Value>,
    pub med_food_data: Option<serde_json::Value>,
    pub book_data: Option<serde_json::Value>,
    pub treasure_data: Option<serde_json::Value>,
    pub material_data: Option<serde_json::Value>,
    pub horse_data: Option<serde_json::Value>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_item_deserialize() {
        let json = r#"{
            "itemID": 0, "type": 0, "subType": 1, "name": "完美布甲",
            "checkName": null, "describe": null, "value": 5280,
            "itemLv": 4, "rareLv": 5, "weight": 12.5, "isNew": false,
            "poisonNum": 0.0, "poisonNumDetected": false,
            "equipmentData": {"enhanceLv": 0, "littleType": 0},
            "medFoodData": null, "bookData": null,
            "treasureData": null, "materialData": null, "horseData": null
        }"#;
        let item: Item = serde_json::from_str(json).unwrap();
        assert_eq!(item.name, "完美布甲");
        assert_eq!(item.item_type, 0);
        assert!(item.equipment_data.is_some());
    }
}
```

**Step 3: Create `app/src-tauri/src/models/skill.rs`**

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KungfuSkill {
    #[serde(rename = "skillID")]
    pub skill_id: i32,
    pub lv: i32,
    pub fight_exp: f64,
    pub book_exp: f64,
    pub equiped: bool,
    pub is_new: bool,
    #[serde(rename = "belongHeroID")]
    pub belong_hero_id: i32,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_skill_deserialize() {
        let json = r#"{
            "skillID": 9, "lv": 10, "fightExp": 0.0, "bookExp": 0.0,
            "equiped": false, "isNew": false, "belongHeroID": 0,
            "speEquipData": {"heroSpeAddData": {}}
        }"#;
        let skill: KungfuSkill = serde_json::from_str(json).unwrap();
        assert_eq!(skill.skill_id, 9);
        assert_eq!(skill.lv, 10);
        assert!(skill.extra.contains_key("speEquipData"));
    }
}
```

**Step 4: Create `app/src-tauri/src/models/mod.rs`**

```rust
pub mod hero;
pub mod item;
pub mod skill;

pub use hero::*;
pub use item::*;
pub use skill::*;
```

**Step 5: Register the module in `app/src-tauri/src/lib.rs`**

Add `mod models;` at the top of `lib.rs`.

**Step 6: Run tests**

```bash
cd app/src-tauri && cargo test
```

Expected: all tests pass.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Rust data model for Hero, Item, KungfuSkill"
```

---

## Task 3: Validate Data Model Against Real Save File

**Files:**
- Create: `app/src-tauri/tests/integration_test.rs`

**Step 1: Write integration test that parses the actual Hero save file**

Create `app/src-tauri/tests/integration_test.rs`:

```rust
use serde_json;
use std::fs;

// Import models from the lib crate
// Note: the crate name is defined in Cargo.toml [lib] name
#[test]
fn test_parse_real_hero_file() {
    let hero_path = std::env::var("SAVE_PATH")
        .unwrap_or_else(|_| "../../saves/SaveSlot1/Hero".to_string());

    if !std::path::Path::new(&hero_path).exists() {
        eprintln!("Skipping: Hero file not found at {}", hero_path);
        return;
    }

    let content = fs::read_to_string(&hero_path).expect("Failed to read Hero file");
    let heroes: Vec<Option<serde_json::Value>> =
        serde_json::from_str(&content).expect("Failed to parse Hero JSON");

    let total = heroes.len();
    let non_null = heroes.iter().filter(|h| h.is_some()).count();
    println!("Parsed {} entries, {} non-null heroes", total, non_null);
    assert!(total > 800, "Expected 800+ entries, got {}", total);
    assert!(non_null > 800, "Expected 800+ heroes, got {}", non_null);
}
```

This first test parses as raw `Value` to verify the JSON is valid. The next step is the typed parse.

**Step 2: Add typed parse test**

Add to the same file:

```rust
// This tests that our Hero struct can deserialize every hero in the real save
#[test]
fn test_parse_real_hero_file_typed() {
    // Use path relative to the test file location (src-tauri/tests/)
    let hero_path = std::env::var("SAVE_PATH")
        .unwrap_or_else(|_| "../../saves/SaveSlot1/Hero".to_string());

    if !std::path::Path::new(&hero_path).exists() {
        eprintln!("Skipping: Hero file not found at {}", hero_path);
        return;
    }

    let content = fs::read_to_string(&hero_path).expect("Failed to read Hero file");

    // Parse as array of optional heroes using our typed struct
    // We need to use Value first, then try each element
    let raw: Vec<Option<serde_json::Value>> =
        serde_json::from_str(&content).expect("Failed to parse Hero JSON");

    let mut success = 0;
    let mut failures = Vec::new();

    for (i, entry) in raw.iter().enumerate() {
        if let Some(hero_val) = entry {
            match serde_json::from_value::<longyinlizhizhuan_lib::models::Hero>(hero_val.clone()) {
                Ok(hero) => {
                    assert_eq!(hero.base_attri.len(), 6, "Hero {} has wrong baseAttri length", i);
                    assert_eq!(hero.base_fight_skill.len(), 9, "Hero {} has wrong baseFightSkill length", i);
                    success += 1;
                }
                Err(e) => {
                    failures.push((i, e.to_string()));
                }
            }
        }
    }

    println!("Successfully parsed {}/{} heroes", success, raw.len());
    if !failures.is_empty() {
        println!("Failures:");
        for (i, err) in &failures[..failures.len().min(10)] {
            println!("  Hero {}: {}", i, err);
        }
    }

    // Allow some failures due to optional fields we haven't modeled yet,
    // but the vast majority should parse
    let failure_rate = failures.len() as f64 / success.max(1) as f64;
    assert!(
        failure_rate < 0.05,
        "Too many parse failures: {}/{} ({}%)",
        failures.len(),
        success + failures.len(),
        (failure_rate * 100.0) as i32
    );
}
```

**Step 3: Run the integration test**

```bash
cd app/src-tauri && cargo test --test integration_test -- --nocapture
```

Expected: Both tests pass. If the typed test has failures, iterate on the Hero struct to fix field name/type mismatches until >95% parse successfully.

**Step 4: Fix any deserialization issues found**

Common fixes needed:
- Fields that are sometimes missing need `Option<T>` or `#[serde(default)]`
- Fields with inconsistent types need `serde_json::Value`
- Fields with special casing need explicit `#[serde(rename = "...")]`

**Step 5: Commit**

```bash
git add -A
git commit -m "test: validate Hero struct against real 37MB save file"
```

---

## Task 4: Asset Data Loader

**Files:**
- Create: `app/src-tauri/src/assets.rs`
- Modify: `app/src-tauri/src/lib.rs`

**Step 1: Write the asset loader with tests**

Create `app/src-tauri/src/assets.rs`:

```rust
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Stat effect definition from SpeAddDataBase.txt
#[derive(Debug, Clone, Serialize)]
pub struct SpeAddEntry {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub is_percentage: bool,
}

/// Force/faction definition from ForceData.txt
#[derive(Debug, Clone, Serialize)]
pub struct ForceEntry {
    pub id: i32,
    pub name: String,
    pub style: String,
    pub level: i32,
    pub color: String,
}

/// KungFu skill definition from KungFuData.txt
#[derive(Debug, Clone, Serialize)]
pub struct KungfuEntry {
    pub id: i32,
    pub category: String,
    pub level: i32,
    pub name: String,
    pub description: String,
}

/// Hero tag definition from HeroTagData.txt
#[derive(Debug, Clone, Serialize)]
pub struct TagEntry {
    pub id: i32,
    pub name: String,
    pub value: i32,
    pub effect: String,
    pub category: String,
}

/// Horse definition from HorseData.txt
#[derive(Debug, Clone, Serialize)]
pub struct HorseEntry {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub level: i32,
    pub speed: i32,
    pub power: i32,
    pub sprint: i32,
    pub resist: i32,
}

/// All loaded asset data
#[derive(Debug, Clone)]
pub struct AssetData {
    pub spe_add_data: HashMap<i32, SpeAddEntry>,
    pub forces: HashMap<i32, ForceEntry>,
    pub kungfu_skills: HashMap<i32, KungfuEntry>,
    pub tags: HashMap<i32, TagEntry>,
    pub horses: HashMap<i32, HorseEntry>,
}

impl AssetData {
    pub fn load_from_dir(assets_dir: &Path) -> Result<Self, String> {
        Ok(AssetData {
            spe_add_data: parse_spe_add_data(&assets_dir.join("SpeAddDataBase.txt"))?,
            forces: parse_forces(&assets_dir.join("ForceData.txt"))?,
            kungfu_skills: parse_kungfu(&assets_dir.join("KungFuData.txt"))?,
            tags: parse_tags(&assets_dir.join("HeroTagData.txt"))?,
            horses: parse_horses(&assets_dir.join("HorseData.txt"))?,
        })
    }
}

fn read_csv_lines(path: &Path) -> Result<Vec<Vec<String>>, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;
    Ok(content
        .lines()
        .skip(1) // skip header
        .filter(|l| !l.trim().is_empty())
        .map(|line| line.split(',').map(|s| s.to_string()).collect())
        .collect())
}

fn parse_spe_add_data(path: &Path) -> Result<HashMap<i32, SpeAddEntry>, String> {
    let rows = read_csv_lines(path)?;
    let mut map = HashMap::new();
    for row in rows {
        if row.len() < 11 {
            continue;
        }
        let id: i32 = row[0].parse().unwrap_or(-1);
        if id < 0 {
            continue;
        }
        let is_percentage = row[5].trim() == "1";
        map.insert(id, SpeAddEntry {
            id,
            name: row[1].clone(),
            description: row[10].clone(),
            is_percentage,
        });
    }
    Ok(map)
}

fn parse_forces(path: &Path) -> Result<HashMap<i32, ForceEntry>, String> {
    let rows = read_csv_lines(path)?;
    let mut map = HashMap::new();
    for row in rows {
        if row.len() < 6 {
            continue;
        }
        let id: i32 = row[0].parse().unwrap_or(-1);
        if id < 0 {
            continue;
        }
        map.insert(id, ForceEntry {
            id,
            name: row[1].clone(),
            style: row[2].clone(),
            level: row[3].parse().unwrap_or(0),
            color: row[5].clone(),
        });
    }
    Ok(map)
}

fn parse_kungfu(path: &Path) -> Result<HashMap<i32, KungfuEntry>, String> {
    let rows = read_csv_lines(path)?;
    let mut map = HashMap::new();
    for row in rows {
        if row.len() < 5 {
            continue;
        }
        let id: i32 = row[0].parse().unwrap_or(-1);
        if id < 0 {
            continue;
        }
        map.insert(id, KungfuEntry {
            id,
            category: row[1].clone(),
            level: row[2].parse().unwrap_or(0),
            name: row[3].clone(),
            description: row[4].clone(),
        });
    }
    Ok(map)
}

fn parse_tags(path: &Path) -> Result<HashMap<i32, TagEntry>, String> {
    let rows = read_csv_lines(path)?;
    let mut map = HashMap::new();
    for row in rows {
        if row.len() < 12 {
            continue;
        }
        let id: i32 = row[0].parse().unwrap_or(-1);
        if id < 0 {
            continue;
        }
        map.insert(id, TagEntry {
            id,
            name: row[1].clone(),
            value: row[2].parse().unwrap_or(0),
            effect: row[4].clone(),
            category: row[11].clone(),
        });
    }
    Ok(map)
}

fn parse_horses(path: &Path) -> Result<HashMap<i32, HorseEntry>, String> {
    let rows = read_csv_lines(path)?;
    let mut map = HashMap::new();
    for row in rows {
        if row.len() < 9 {
            continue;
        }
        let id: i32 = row[0].parse().unwrap_or(-1);
        if id < 0 {
            continue;
        }
        map.insert(id, HorseEntry {
            id,
            name: row[1].clone(),
            description: row[2].clone(),
            level: row[3].parse().unwrap_or(0),
            speed: row[4].parse().unwrap_or(0),
            power: row[5].parse().unwrap_or(0),
            sprint: row[6].parse().unwrap_or(0),
            resist: row[7].parse().unwrap_or(0),
        });
    }
    Ok(map)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn assets_dir() -> PathBuf {
        PathBuf::from("../../assets")
    }

    #[test]
    fn test_parse_spe_add_data() {
        let path = assets_dir().join("SpeAddDataBase.txt");
        if !path.exists() { return; }
        let data = parse_spe_add_data(&path).unwrap();
        assert!(data.len() > 200);
        assert_eq!(data[&0].name, "力道");
        assert_eq!(data[&7].name, "轻功");
        assert_eq!(data[&57].name, "生命上限");
    }

    #[test]
    fn test_parse_forces() {
        let path = assets_dir().join("ForceData.txt");
        if !path.exists() { return; }
        let data = parse_forces(&path).unwrap();
        assert_eq!(data.len(), 30);
        assert_eq!(data[&0].name, "长乐帮");
        assert_eq!(data[&10].name, "少林寺");
    }

    #[test]
    fn test_parse_kungfu() {
        let path = assets_dir().join("KungFuData.txt");
        if !path.exists() { return; }
        let data = parse_kungfu(&path).unwrap();
        assert!(data.len() > 100);
        assert_eq!(data[&0].name, "吐纳法");
        assert_eq!(data[&0].category, "内功");
    }

    #[test]
    fn test_parse_tags() {
        let path = assets_dir().join("HeroTagData.txt");
        if !path.exists() { return; }
        let data = parse_tags(&path).unwrap();
        assert!(data.len() > 300);
        assert_eq!(data[&0].name, "力道");
    }

    #[test]
    fn test_parse_horses() {
        let path = assets_dir().join("HorseData.txt");
        if !path.exists() { return; }
        let data = parse_horses(&path).unwrap();
        assert!(data.len() > 40);
        assert_eq!(data[&0].name, "骡子");
    }

    #[test]
    fn test_load_all_assets() {
        let dir = assets_dir();
        if !dir.exists() { return; }
        let data = AssetData::load_from_dir(&dir).unwrap();
        assert!(data.spe_add_data.len() > 200);
        assert_eq!(data.forces.len(), 30);
        assert!(data.kungfu_skills.len() > 100);
        assert!(data.tags.len() > 300);
        assert!(data.horses.len() > 40);
    }
}
```

**Step 2: Register in lib.rs**

Add `pub mod assets;` to `lib.rs`.

**Step 3: Run tests**

```bash
cd app/src-tauri && cargo test assets -- --nocapture
```

Expected: all pass.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add asset data loader for game reference tables"
```

---

## Task 5: Save Manager - Load, Edit, Save, Undo/Redo

**Files:**
- Create: `app/src-tauri/src/save_manager.rs`
- Modify: `app/src-tauri/src/lib.rs`

**Step 1: Create the SaveManager with undo/redo**

Create `app/src-tauri/src/save_manager.rs`:

```rust
use crate::assets::AssetData;
use crate::models::hero::{Hero, HeroSummary};
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
                        Err(_) => {
                            // Keep as None if parse fails, preserve in raw
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

    /// Get a full hero by its array index
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
        // Find the hero index
        let idx = self.heroes.iter().position(|h| {
            h.as_ref().map_or(false, |hero| hero.hero_id == hero_id)
        }).ok_or_else(|| format!("Hero {} not found", hero_id))?;

        // Get the raw value and apply the change
        let raw = self.heroes_raw[idx].as_mut()
            .ok_or_else(|| format!("Hero {} raw data is null", hero_id))?;

        let old_value = get_nested_value(raw, field_path)
            .cloned()
            .unwrap_or(Value::Null);

        set_nested_value(raw, field_path, new_value.clone())?;

        // Re-parse the hero from the updated raw value
        let hero = serde_json::from_value::<Hero>(raw.clone())
            .map_err(|e| format!("Failed to re-parse hero after edit: {}", e))?;

        let description = format!(
            "修改 {} 的 {}: {} -> {}",
            hero.hero_name, field_path, old_value, new_value
        );

        self.heroes[idx] = Some(hero);

        // Push to undo stack
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
        fs::write(path, &json)
            .map_err(|e| format!("Failed to write file: {}", e))?;

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
            // Last part: set the value
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
            // Navigate deeper
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
```

**Step 2: Add `chrono` dependency to Cargo.toml**

```toml
chrono = "0.4"
```

**Step 3: Register in lib.rs**

Add `pub mod save_manager;` to `lib.rs`.

**Step 4: Run tests**

```bash
cd app/src-tauri && cargo test save_manager -- --nocapture
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SaveManager with load, edit, undo/redo, save+backup"
```

---

## Task 6: Tauri Commands (IPC Layer)

**Files:**
- Create: `app/src-tauri/src/commands.rs`
- Modify: `app/src-tauri/src/lib.rs` (register commands + state)

**Step 1: Create the Tauri commands**

Create `app/src-tauri/src/commands.rs`:

```rust
use crate::assets::{AssetData, ForceEntry, HorseEntry, KungfuEntry, SpeAddEntry, TagEntry};
use crate::models::hero::HeroSummary;
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
        // Try to find assets dir relative to the save slot
        // saves/SaveSlot1/ -> ../../assets/
        if let Some(parent) = path.parent().and_then(|p| p.parent()) {
            let assets_dir = parent.parent().map(|p| p.join("assets"))
                .unwrap_or_else(|| parent.join("assets"));
            if assets_dir.exists() {
                app.asset_data = AssetData::load_from_dir(&assets_dir).ok();
            }
        }
    }

    app.save_manager.load_hero_file(path)
}

#[tauri::command]
pub fn get_hero_list(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<HeroSummary>, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    Ok(app.save_manager.get_hero_list())
}

#[tauri::command]
pub fn get_hero(
    hero_id: i32,
    state: State<'_, Mutex<AppState>>,
) -> Result<Value, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    let hero = app.save_manager.get_hero(hero_id)
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
    app.save_manager.update_hero_field(hero_id, &field_path, value)
}

#[tauri::command]
pub fn undo(
    state: State<'_, Mutex<AppState>>,
) -> Result<Option<String>, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager.undo()
}

#[tauri::command]
pub fn redo(
    state: State<'_, Mutex<AppState>>,
) -> Result<Option<String>, String> {
    let mut app = state.lock().map_err(|e| e.to_string())?;
    app.save_manager.redo()
}

#[tauri::command]
pub fn get_edit_status(
    state: State<'_, Mutex<AppState>>,
) -> Result<EditStatus, String> {
    let app = state.lock().map_err(|e| e.to_string())?;
    Ok(app.save_manager.get_edit_status())
}

#[tauri::command]
pub fn save_file(
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
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
```

**Step 2: Update `app/src-tauri/src/lib.rs`**

```rust
mod assets;
mod commands;
mod models;
mod save_manager;

use commands::AppState;
use save_manager::SaveManager;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
```

**Step 3: Verify it compiles**

```bash
cd app/src-tauri && cargo check
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Tauri IPC commands for save loading, editing, undo/redo"
```

---

## Task 7: Frontend - TypeScript Types & API Layer

**Files:**
- Create: `app/src/types/hero.ts`
- Create: `app/src/types/assets.ts`
- Create: `app/src/api/commands.ts`

**Step 1: Create TypeScript types**

Create `app/src/types/hero.ts`:

```typescript
export interface HeroSummary {
  heroId: number;
  heroName: string;
  heroNickName: string | null;
  isFemale: boolean;
  belongForceId: number;
  dead: boolean;
  isLeader: boolean;
  age: number;
  heroForceLv: number;
}

export interface EditStatus {
  canUndo: boolean;
  canRedo: boolean;
  unsavedChanges: number;
  undoDescription: string | null;
  redoDescription: string | null;
}

// Full hero detail is received as a dynamic JSON object
// since it has ~90+ fields
export type HeroDetail = Record<string, unknown>;
```

Create `app/src/types/assets.ts`:

```typescript
export interface ForceEntry {
  id: number;
  name: string;
  style: string;
  level: number;
  color: string;
}

export interface KungfuEntry {
  id: number;
  category: string;
  level: number;
  name: string;
  description: string;
}

export interface TagEntry {
  id: number;
  name: string;
  value: number;
  effect: string;
  category: string;
}

export interface SpeAddEntry {
  id: number;
  name: string;
  description: string;
  isPercentage: boolean;
}

export interface HorseEntry {
  id: number;
  name: string;
  description: string;
  level: number;
  speed: number;
  power: number;
  sprint: number;
  resist: number;
}
```

**Step 2: Create the API commands layer**

Create `app/src/api/commands.ts`:

```typescript
import { invoke } from '@tauri-apps/api/core';
import type { HeroSummary, EditStatus, HeroDetail } from '../types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry, HorseEntry } from '../types/assets';

export async function loadSave(slotPath: string): Promise<number> {
  return invoke<number>('load_save', { slotPath });
}

export async function getHeroList(): Promise<HeroSummary[]> {
  return invoke<HeroSummary[]>('get_hero_list');
}

export async function getHero(heroId: number): Promise<HeroDetail> {
  return invoke<HeroDetail>('get_hero', { heroId });
}

export async function updateHeroField(
  heroId: number,
  fieldPath: string,
  value: unknown
): Promise<void> {
  return invoke('update_hero_field', { heroId, fieldPath, value });
}

export async function undoEdit(): Promise<string | null> {
  return invoke<string | null>('undo');
}

export async function redoEdit(): Promise<string | null> {
  return invoke<string | null>('redo');
}

export async function getEditStatus(): Promise<EditStatus> {
  return invoke<EditStatus>('get_edit_status');
}

export async function saveFile(): Promise<string> {
  return invoke<string>('save_file');
}

export async function getForceList(): Promise<Record<number, ForceEntry>> {
  return invoke<Record<number, ForceEntry>>('get_force_list');
}

export async function getSkillList(): Promise<Record<number, KungfuEntry>> {
  return invoke<Record<number, KungfuEntry>>('get_skill_list');
}

export async function getTagList(): Promise<Record<number, TagEntry>> {
  return invoke<Record<number, TagEntry>>('get_tag_list');
}

export async function getSpeAddNames(): Promise<Record<number, SpeAddEntry>> {
  return invoke<Record<number, SpeAddEntry>>('get_spe_add_names');
}

export async function getHorseList(): Promise<Record<number, HorseEntry>> {
  return invoke<Record<number, HorseEntry>>('get_horse_list');
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript types and Tauri API command wrappers"
```

---

## Task 8: Frontend - Hero List Panel

**Files:**
- Create: `app/src/components/HeroListPanel.tsx`
- Create: `app/src/components/HeroListPanel.css`

**Step 1: Build the hero list with virtualization and search**

Create `app/src/components/HeroListPanel.tsx`:

```tsx
import { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { HeroSummary } from '../types/hero';
import type { ForceEntry } from '../types/assets';
import './HeroListPanel.css';

interface Props {
  heroes: HeroSummary[];
  forces: Record<number, ForceEntry>;
  selectedHeroId: number | null;
  onSelectHero: (heroId: number) => void;
}

export function HeroListPanel({ heroes, forces, selectedHeroId, onSelectHero }: Props) {
  const [search, setSearch] = useState('');
  const [showDead, setShowDead] = useState(true);
  const [forceFilter, setForceFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return heroes.filter((h) => {
      if (!showDead && h.dead) return false;
      if (forceFilter !== null && h.belongForceId !== forceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const forceName = forces[h.belongForceId]?.name || '';
        return (
          h.heroName.toLowerCase().includes(q) ||
          (h.heroNickName?.toLowerCase().includes(q) ?? false) ||
          forceName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [heroes, search, showDead, forceFilter, forces]);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const hero = filtered[index];
      const forceName = forces[hero.belongForceId]?.name || '无门派';
      const isSelected = hero.heroId === selectedHeroId;

      return (
        <div
          style={style}
          className={`hero-row ${isSelected ? 'selected' : ''} ${hero.dead ? 'dead' : ''}`}
          onClick={() => onSelectHero(hero.heroId)}
        >
          <div className="hero-row-name">
            {hero.isLeader && <span className="leader-badge">主</span>}
            {hero.heroName}
          </div>
          <div className="hero-row-info">
            {forceName} · {hero.age}岁 · Lv{hero.heroForceLv}
          </div>
        </div>
      );
    },
    [filtered, selectedHeroId, forces, onSelectHero]
  );

  const forceOptions = useMemo(() => {
    return Object.values(forces).sort((a, b) => a.id - b.id);
  }, [forces]);

  return (
    <div className="hero-list-panel">
      <div className="hero-list-header">
        <input
          className="hero-search"
          type="text"
          placeholder="搜索侠客..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="hero-filters">
          <label>
            <input
              type="checkbox"
              checked={showDead}
              onChange={(e) => setShowDead(e.target.checked)}
            />
            显示已故
          </label>
          <select
            value={forceFilter ?? ''}
            onChange={(e) => setForceFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">全部门派</option>
            {forceOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="hero-count">{filtered.length} / {heroes.length}</div>
      </div>
      <List
        height={600}
        itemCount={filtered.length}
        itemSize={50}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
```

Create `app/src/components/HeroListPanel.css`:

```css
.hero-list-panel {
  width: 260px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.hero-list-header {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.hero-search {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 13px;
}

.hero-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.hero-filters select {
  flex: 1;
  font-size: 12px;
  padding: 2px 4px;
}

.hero-count {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

.hero-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.hero-row:hover { background: #e8f0fe; }
.hero-row.selected { background: #d2e3fc; }
.hero-row.dead { opacity: 0.5; }

.hero-row-name {
  font-size: 14px;
  font-weight: 500;
}

.hero-row-info {
  font-size: 11px;
  color: #666;
}

.leader-badge {
  display: inline-block;
  background: #f4b400;
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 4px;
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add HeroListPanel with virtualized list, search, and filters"
```

---

## Task 9: Frontend - Hero Detail Panel with Tabs

**Files:**
- Create: `app/src/components/HeroDetailPanel.tsx`
- Create: `app/src/components/tabs/IdentityTab.tsx`
- Create: `app/src/components/tabs/AttributesTab.tsx`
- Create: `app/src/components/tabs/SkillsTab.tsx`
- Create: `app/src/components/tabs/EquipmentTab.tsx`
- Create: `app/src/components/tabs/InventoryTab.tsx`
- Create: `app/src/components/tabs/RelationshipsTab.tsx`
- Create: `app/src/components/tabs/TagsTab.tsx`
- Create: `app/src/components/common/EditableField.tsx`

This is the largest task. Each tab follows the same pattern: read hero data → render form fields → call `updateHeroField()` on change.

**Step 1: Create the reusable EditableField component**

Create `app/src/components/common/EditableField.tsx`:

```tsx
import { useState, useCallback, useRef, useEffect } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function NumberField({ label, value, onChange, min, max, step = 1, disabled }: NumberFieldProps) {
  const [local, setLocal] = useState(String(value));
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const num = parseFloat(raw);
      if (!isNaN(num)) onChange(num);
    }, 300);
  }, [onChange]);

  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <input
        type="number"
        className="field-input"
        value={local}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function TextField({ label, value, onChange, disabled }: TextFieldProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(raw), 300);
  }, [onChange]);

  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <input
        type="text"
        className="field-input"
        value={local}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export function CheckboxField({ label, value, onChange }: CheckboxFieldProps) {
  return (
    <div className="field-row">
      <label className="field-label">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: number | string;
  options: { value: number | string; label: string }[];
  onChange: (val: number | string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <select
        className="field-input"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(isNaN(Number(v)) ? v : Number(v));
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
```

**Step 2: Create HeroDetailPanel with tab navigation**

Create `app/src/components/HeroDetailPanel.tsx`:

```tsx
import { useState } from 'react';
import type { HeroDetail } from '../types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from '../types/assets';
import { IdentityTab } from './tabs/IdentityTab';
import { AttributesTab } from './tabs/AttributesTab';
import { SkillsTab } from './tabs/SkillsTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { InventoryTab } from './tabs/InventoryTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { TagsTab } from './tabs/TagsTab';

const TABS = [
  { key: 'identity', label: '身份' },
  { key: 'attributes', label: '属性' },
  { key: 'skills', label: '武学' },
  { key: 'equipment', label: '装备' },
  { key: 'inventory', label: '物品' },
  { key: 'relationships', label: '关系' },
  { key: 'tags', label: '天赋' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface Props {
  hero: HeroDetail;
  heroId: number;
  forces: Record<number, ForceEntry>;
  skills: Record<number, KungfuEntry>;
  tags: Record<number, TagEntry>;
  speAddNames: Record<number, SpeAddEntry>;
  heroNames: Record<number, string>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function HeroDetailPanel({
  hero, heroId, forces, skills, tags, speAddNames, heroNames, onFieldChange
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  return (
    <div className="hero-detail-panel">
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === 'identity' && (
          <IdentityTab hero={hero} forces={forces} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'attributes' && (
          <AttributesTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab hero={hero} skills={skills} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'equipment' && (
          <EquipmentTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab hero={hero} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'relationships' && (
          <RelationshipsTab hero={hero} heroNames={heroNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'tags' && (
          <TagsTab hero={hero} tags={tags} onFieldChange={onFieldChange} />
        )}
      </div>
    </div>
  );
}
```

**Step 3: Create IdentityTab**

Create `app/src/components/tabs/IdentityTab.tsx`:

```tsx
import type { HeroDetail } from '../../types/hero';
import type { ForceEntry } from '../../types/assets';
import { TextField, NumberField, CheckboxField, SelectField } from '../common/EditableField';

interface Props {
  hero: HeroDetail;
  forces: Record<number, ForceEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function IdentityTab({ hero, forces, onFieldChange }: Props) {
  const forceOptions = Object.values(forces)
    .sort((a, b) => a.id - b.id)
    .map((f) => ({ value: f.id, label: f.name }));
  forceOptions.unshift({ value: -1, label: '无门派' });

  return (
    <div className="tab-identity">
      <h3>基本信息</h3>
      <TextField label="姓名" value={hero.heroName as string} onChange={(v) => onFieldChange('heroName', v)} />
      <TextField label="姓氏" value={hero.heroFamilyName as string} onChange={(v) => onFieldChange('heroFamilyName', v)} />
      <TextField label="称号" value={(hero.heroNickName as string) || ''} onChange={(v) => onFieldChange('heroNickName', v || null)} />
      <CheckboxField label="女性" value={hero.isFemale as boolean} onChange={(v) => onFieldChange('isFemale', v)} />
      <NumberField label="年龄" value={hero.age as number} onChange={(v) => onFieldChange('age', v)} min={1} max={200} />
      <NumberField label="代数" value={hero.generation as number} onChange={(v) => onFieldChange('generation', v)} min={0} />

      <h3>门派</h3>
      <SelectField label="所属门派" value={hero.belongForceID as number} options={forceOptions} onChange={(v) => onFieldChange('belongForceID', v)} />
      <CheckboxField label="掌门" value={hero.isLeader as boolean} onChange={(v) => onFieldChange('isLeader', v)} />
      <NumberField label="门派等级" value={hero.heroForceLv as number} onChange={(v) => onFieldChange('heroForceLv', v)} min={0} max={5} />
      <CheckboxField label="已故" value={hero.dead as boolean} onChange={(v) => onFieldChange('dead', v)} />
      <CheckboxField label="隐藏" value={hero.hide as boolean} onChange={(v) => onFieldChange('hide', v)} />

      <h3>声望</h3>
      <NumberField label="声望" value={hero.fame as number} onChange={(v) => onFieldChange('fame', v)} />
      <NumberField label="恶名" value={hero.badFame as number} onChange={(v) => onFieldChange('badFame', v)} min={0} />
      <NumberField label="忠义" value={hero.loyal as number} onChange={(v) => onFieldChange('loyal', v)} />
      <NumberField label="邪恶" value={hero.evil as number} onChange={(v) => onFieldChange('evil', v)} min={0} max={100} />
      <NumberField label="混乱" value={hero.chaos as number} onChange={(v) => onFieldChange('chaos', v)} min={0} max={100} />
    </div>
  );
}
```

**Step 4: Create AttributesTab**

Create `app/src/components/tabs/AttributesTab.tsx`:

```tsx
import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { NumberField } from '../common/EditableField';

const ATTRI_NAMES = ['力道', '灵巧', '智力', '意志', '体质', '经脉'];
const FIGHT_NAMES = ['内功', '轻功', '绝技', '拳掌', '剑法', '刀法', '长兵', '奇门', '射术'];
const LIVING_NAMES = ['医术', '毒术', '学识', '口才', '采伐', '木植', '锻造', '炼药', '烹饪'];

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

function ArrayEditor({
  label,
  names,
  baseKey,
  maxKey,
  totalKey,
  hero,
  onFieldChange,
}: {
  label: string;
  names: string[];
  baseKey: string;
  maxKey: string;
  totalKey: string;
  hero: HeroDetail;
  onFieldChange: (path: string, val: unknown) => void;
}) {
  const base = hero[baseKey] as number[];
  const max = hero[maxKey] as number[];
  const total = hero[totalKey] as number[];

  return (
    <div className="attri-section">
      <h3>{label}</h3>
      <div className="attri-header">
        <span className="attri-name-col">名称</span>
        <span className="attri-val-col">基础</span>
        <span className="attri-val-col">上限</span>
        <span className="attri-val-col">当前</span>
      </div>
      {names.map((name, i) => (
        <div key={name} className="attri-row">
          <span className="attri-name-col">{name}</span>
          <NumberField label="" value={base[i]} onChange={(v) => onFieldChange(`${baseKey}.${i}`, v)} />
          <NumberField label="" value={max[i]} onChange={(v) => onFieldChange(`${maxKey}.${i}`, v)} />
          <NumberField label="" value={total[i]} onChange={(v) => onFieldChange(`${totalKey}.${i}`, v)} />
        </div>
      ))}
    </div>
  );
}

export function AttributesTab({ hero, speAddNames, onFieldChange }: Props) {
  return (
    <div className="tab-attributes">
      <h3>生命资源</h3>
      <div className="resource-grid">
        <NumberField label="生命" value={hero.hp as number} onChange={(v) => onFieldChange('hp', v)} />
        <NumberField label="最大生命" value={hero.maxhp as number} onChange={(v) => onFieldChange('maxhp', v)} />
        <NumberField label="体力" value={hero.power as number} onChange={(v) => onFieldChange('power', v)} />
        <NumberField label="最大体力" value={hero.maxPower as number} onChange={(v) => onFieldChange('maxPower', v)} />
        <NumberField label="内力" value={hero.mana as number} onChange={(v) => onFieldChange('mana', v)} />
        <NumberField label="最大内力" value={hero.maxMana as number} onChange={(v) => onFieldChange('maxMana', v)} />
        <NumberField label="护甲" value={hero.armor as number} onChange={(v) => onFieldChange('armor', v)} />
        <NumberField label="外伤" value={hero.externalInjury as number} onChange={(v) => onFieldChange('externalInjury', v)} min={0} />
        <NumberField label="内伤" value={hero.internalInjury as number} onChange={(v) => onFieldChange('internalInjury', v)} min={0} />
        <NumberField label="中毒" value={hero.poisonInjury as number} onChange={(v) => onFieldChange('poisonInjury', v)} min={0} />
      </div>

      <ArrayEditor
        label="六维属性"
        names={ATTRI_NAMES}
        baseKey="baseAttri"
        maxKey="maxAttri"
        totalKey="totalAttri"
        hero={hero}
        onFieldChange={onFieldChange}
      />

      <ArrayEditor
        label="武学技能"
        names={FIGHT_NAMES}
        baseKey="baseFightSkill"
        maxKey="maxFightSkill"
        totalKey="totalFightSkill"
        hero={hero}
        onFieldChange={onFieldChange}
      />

      <ArrayEditor
        label="技艺"
        names={LIVING_NAMES}
        baseKey="baseLivingSkill"
        maxKey="maxLivingSkill"
        totalKey="totalLivingSkill"
        hero={hero}
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
```

**Step 5: Create stub tabs for the remaining 5 tabs**

Create each of: `SkillsTab.tsx`, `EquipmentTab.tsx`, `InventoryTab.tsx`, `RelationshipsTab.tsx`, `TagsTab.tsx` with the same pattern. Start with minimal implementations that display data, refine in later iterations.

Example `app/src/components/tabs/SkillsTab.tsx`:

```tsx
import type { HeroDetail } from '../../types/hero';
import type { KungfuEntry } from '../../types/assets';

interface Props {
  hero: HeroDetail;
  skills: Record<number, KungfuEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function SkillsTab({ hero, skills, onFieldChange }: Props) {
  const heroSkills = (hero.kungfuSkills as Array<{ skillID: number; lv: number; equiped: boolean }>) || [];

  return (
    <div className="tab-skills">
      <h3>武学 ({heroSkills.length})</h3>
      <table className="skill-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类别</th>
            <th>品级</th>
            <th>等级</th>
            <th>装备</th>
          </tr>
        </thead>
        <tbody>
          {heroSkills.map((sk, i) => {
            const info = skills[sk.skillID];
            return (
              <tr key={i}>
                <td>{info?.name ?? `技能#${sk.skillID}`}</td>
                <td>{info?.category ?? '?'}</td>
                <td>{info?.level ?? '?'}</td>
                <td>
                  <input
                    type="number"
                    value={sk.lv}
                    min={0}
                    max={10}
                    onChange={(e) => onFieldChange(`kungfuSkills.${i}.lv`, parseInt(e.target.value))}
                    style={{ width: 50 }}
                  />
                </td>
                <td>{sk.equiped ? '✓' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

Follow the same pattern for the remaining tabs (EquipmentTab, InventoryTab, RelationshipsTab, TagsTab).

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add HeroDetailPanel with 7 tabs (Identity, Attributes, Skills, Equipment, Inventory, Relationships, Tags)"
```

---

## Task 10: Frontend - Main App Layout & Integration

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/App.css`

**Step 1: Wire everything together in App.tsx**

Replace `app/src/App.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { HeroListPanel } from './components/HeroListPanel';
import { HeroDetailPanel } from './components/HeroDetailPanel';
import * as api from './api/commands';
import type { HeroSummary, HeroDetail, EditStatus } from './types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from './types/assets';
import './App.css';

function App() {
  const [heroes, setHeroes] = useState<HeroSummary[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [heroDetail, setHeroDetail] = useState<HeroDetail | null>(null);
  const [editStatus, setEditStatus] = useState<EditStatus>({ canUndo: false, canRedo: false, unsavedChanges: 0, undoDescription: null, redoDescription: null });
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Asset data
  const [forces, setForces] = useState<Record<number, ForceEntry>>({});
  const [skills, setSkills] = useState<Record<number, KungfuEntry>>({});
  const [tags, setTags] = useState<Record<number, TagEntry>>({});
  const [speAddNames, setSpeAddNames] = useState<Record<number, SpeAddEntry>>({});

  // Derived hero name map for relationship display
  const heroNames: Record<number, string> = {};
  heroes.forEach((h) => { heroNames[h.heroId] = h.heroName; });

  const loadSave = useCallback(async () => {
    // For now, hardcode the save path. Later replace with a file dialog.
    const slotPath = '../../saves/SaveSlot1';
    setLoading(true);
    try {
      const count = await api.loadSave(slotPath);
      console.log(`Loaded ${count} heroes`);

      const [heroList, forceData, skillData, tagData, speData] = await Promise.all([
        api.getHeroList(),
        api.getForceList(),
        api.getSkillList(),
        api.getTagList(),
        api.getSpeAddNames(),
      ]);

      setHeroes(heroList);
      setForces(forceData);
      setSkills(skillData);
      setTags(tagData);
      setSpeAddNames(speData);
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load save:', err);
      alert(`加载失败: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectHero = useCallback(async (heroId: number) => {
    setSelectedHeroId(heroId);
    try {
      const detail = await api.getHero(heroId);
      setHeroDetail(detail);
    } catch (err) {
      console.error('Failed to load hero:', err);
    }
  }, []);

  const handleFieldChange = useCallback(async (fieldPath: string, value: unknown) => {
    if (selectedHeroId === null) return;
    try {
      await api.updateHeroField(selectedHeroId, fieldPath, value);
      // Refresh the hero detail
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
      const status = await api.getEditStatus();
      setEditStatus(status);
    } catch (err) {
      console.error('Failed to update field:', err);
    }
  }, [selectedHeroId]);

  const handleUndo = useCallback(async () => {
    await api.undoEdit();
    if (selectedHeroId !== null) {
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
    }
    const status = await api.getEditStatus();
    setEditStatus(status);
    // Refresh hero list in case name/force changed
    const heroList = await api.getHeroList();
    setHeroes(heroList);
  }, [selectedHeroId]);

  const handleRedo = useCallback(async () => {
    await api.redoEdit();
    if (selectedHeroId !== null) {
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
    }
    const status = await api.getEditStatus();
    setEditStatus(status);
    const heroList = await api.getHeroList();
    setHeroes(heroList);
  }, [selectedHeroId]);

  const handleSave = useCallback(async () => {
    try {
      const backup = await api.saveFile();
      alert(`保存成功！备份: ${backup}`);
      const status = await api.getEditStatus();
      setEditStatus(status);
    } catch (err) {
      alert(`保存失败: ${err}`);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, handleSave]);

  if (!loaded) {
    return (
      <div className="app-loading">
        <h1>龙隐立志传 存档编辑器</h1>
        <button onClick={loadSave} disabled={loading}>
          {loading ? '加载中...' : '打开存档'}
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="toolbar">
        <button onClick={loadSave}>打开存档</button>
        <button onClick={handleSave} disabled={editStatus.unsavedChanges === 0}>
          保存 {editStatus.unsavedChanges > 0 ? `(${editStatus.unsavedChanges})` : ''}
        </button>
        <button onClick={handleUndo} disabled={!editStatus.canUndo} title={editStatus.undoDescription || ''}>
          撤销
        </button>
        <button onClick={handleRedo} disabled={!editStatus.canRedo} title={editStatus.redoDescription || ''}>
          重做
        </button>
        <span className="toolbar-title">龙隐立志传 存档编辑器</span>
      </div>
      <div className="main-content">
        <HeroListPanel
          heroes={heroes}
          forces={forces}
          selectedHeroId={selectedHeroId}
          onSelectHero={selectHero}
        />
        {heroDetail && selectedHeroId !== null ? (
          <HeroDetailPanel
            hero={heroDetail}
            heroId={selectedHeroId}
            forces={forces}
            skills={skills}
            tags={tags}
            speAddNames={speAddNames}
            heroNames={heroNames}
            onFieldChange={handleFieldChange}
          />
        ) : (
          <div className="no-hero-selected">
            <p>请从左侧列表选择一位侠客</p>
          </div>
        )}
      </div>
      <div className="status-bar">
        {editStatus.unsavedChanges > 0
          ? `${editStatus.unsavedChanges} 处未保存的修改 | Ctrl+Z 撤销 | Ctrl+S 保存`
          : '就绪'}
      </div>
    </div>
  );
}

export default App;
```

**Step 2: Create `app/src/App.css`** with the layout styles (toolbar, main-content split, status bar).

**Step 3: Verify the full app runs**

```bash
cd app && npm run tauri dev
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire up main App layout with toolbar, hero list, detail panel, undo/redo, save"
```

---

## Task 11: File Dialog for Save Slot Selection

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src-tauri/Cargo.toml` (add dialog plugin)
- Modify: `app/src-tauri/src/lib.rs`

**Step 1: Add Tauri dialog plugin**

```bash
cd app && npm install @tauri-apps/plugin-dialog
cd app/src-tauri && cargo add tauri-plugin-dialog
```

**Step 2: Register plugin in lib.rs**

Add `.plugin(tauri_plugin_dialog::init())` to the Builder chain.

**Step 3: Update App.tsx loadSave to use file dialog**

```typescript
import { open } from '@tauri-apps/plugin-dialog';

const loadSave = useCallback(async () => {
  const selected = await open({
    directory: true,
    title: '选择存档文件夹 (SaveSlot)',
  });
  if (!selected) return;
  // ... rest of load logic using selected path
}, []);
```

**Step 4: Add the dialog permission to `app/src-tauri/capabilities/default.json`**

Add `"dialog:default"` to the permissions array.

**Step 5: Test the file dialog flow**

```bash
cd app && npm run tauri dev
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add file dialog for save slot selection"
```

---

## Task 12: End-to-End Smoke Test

**Files:**
- Create: `app/src-tauri/tests/e2e_test.rs`

**Step 1: Write an E2E test that loads the real save, reads a hero, edits a field, undoes, and saves**

```rust
#[test]
fn test_full_edit_cycle() {
    let mut mgr = longyinlizhizhuan_lib::save_manager::SaveManager::new();
    let slot_dir = std::path::Path::new("../../saves/SaveSlot1");
    if !slot_dir.exists() { return; }

    // Load
    let count = mgr.load_hero_file(slot_dir).unwrap();
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

    // Undo again to restore original before any potential save
    mgr.undo().unwrap();

    println!("E2E test passed: load -> edit -> undo -> redo -> undo");
}
```

**Step 2: Run**

```bash
cd app/src-tauri && cargo test e2e -- --nocapture
```

**Step 3: Commit**

```bash
git add -A
git commit -m "test: add end-to-end smoke test for full edit cycle"
```

---

## Summary

| Task | Description | Estimated Complexity |
|------|-------------|---------------------|
| 1 | Scaffold Tauri project | Low |
| 2 | Rust data model (Hero/Item/Skill) | Medium |
| 3 | Validate model against real save | Medium (iterative) |
| 4 | Asset data loader | Medium |
| 5 | SaveManager (load/edit/undo/save) | High |
| 6 | Tauri IPC commands | Medium |
| 7 | TypeScript types + API layer | Low |
| 8 | Hero list panel (virtualized) | Medium |
| 9 | Hero detail panel (7 tabs) | High |
| 10 | Main app layout + integration | Medium |
| 11 | File dialog for save selection | Low |
| 12 | E2E smoke test | Low |
