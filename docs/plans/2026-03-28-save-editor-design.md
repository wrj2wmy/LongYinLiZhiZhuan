# 龙隐立志传 Save Editor - Design Document

## Overview

A Tauri desktop application for editing save files of 龙隐立志传 (LongYinLiZhiZhuan), a Unity IL2CPP wuxia sandbox RPG. Phase 1 focuses on Hero file editing with the architecture designed for future expansion to Save/world state editing.

## Save File Structure

Each save slot (SaveSlot0-10) contains:

| File | Size | Format | Contents |
|------|------|--------|----------|
| `Info` | 164B | JSON | Save metadata: character name, date, chapter |
| `Hero` | ~37MB | JSON (single-line, no terminators) | Array of ~864 hero objects (sparse, null entries for gaps) |
| `Save` | ~11MB | JSON (single-line) | World state: 69 areas, 30 factions, buildings, events |
| `TempHero` | ~5MB | JSON | Temporary hero data |
| `steam_autocloud.vdf` | 52B | Valve format | Steam cloud sync metadata |

## Tech Stack

- **Desktop framework**: Tauri v2
- **Backend**: Rust (serde for JSON, tauri commands for IPC)
- **Frontend**: React + TypeScript
- **UI language**: Chinese
- **Styling**: TBD (Ant Design / custom)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Application                     │
│                                                         │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │    Rust Backend      │   │   React Frontend         │ │
│  │                      │   │                          │ │
│  │  SaveManager         │   │  SaveSlotPicker          │ │
│  │  ├─ load_save()      │◄─►│  HeroListPanel           │ │
│  │  ├─ get_hero_list()  │IPC│  ├─ search/filter        │ │
│  │  ├─ get_hero(id)     │   │  ├─ sort by name/force   │ │
│  │  ├─ update_hero(id,  │   │  HeroDetailPanel         │ │
│  │  │   field, value)   │   │  ├─ IdentityTab          │ │
│  │  ├─ undo() / redo()  │   │  ├─ AttributesTab        │ │
│  │  ├─ save_file()      │   │  ├─ SkillsTab            │ │
│  │  └─ backup_save()    │   │  ├─ EquipmentTab         │ │
│  │                      │   │  ├─ InventoryTab         │ │
│  │  AssetDataLoader     │   │  ├─ RelationshipsTab     │ │
│  │  ├─ forces           │   │  └─ TagsTab              │ │
│  │  ├─ kungfu_skills    │   │                          │ │
│  │  ├─ spe_add_data     │   │  StatusBar               │ │
│  │  ├─ hero_tags        │   │  ├─ unsaved changes      │ │
│  │  └─ horses           │   │  └─ undo/redo status     │ │
│  └─────────────────────┘   └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Rust owns all data** - The full Hero array lives in Rust memory. Frontend only receives what it needs.
2. **Lazy hero loading** - Hero list sends summaries only. Full hero data sent on demand.
3. **Field-level updates** - Single IPC call per field change, no full-hero round-trips.
4. **Auto-backup** - Timestamped backup before every write.
5. **Undo/Redo** - Command-stack pattern in Rust, Ctrl+Z/Ctrl+Y.
6. **Forward compatible** - Hybrid data model preserves unknown fields from future game updates.

## Rust Data Model (Hybrid Approach)

Typed structs for known fields + `#[serde(flatten)]` for unknown fields.

### Core Hero Struct

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Hero {
    // Identity
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
    pub belong_force_id: i32,
    pub skill_force_id: i32,
    pub outside_force: bool,
    pub is_leader: bool,
    pub hero_force_lv: i32,
    pub hero_strength_lv: f64,
    pub force_job_type: i32,
    pub force_job_id: i32,

    // Location
    pub at_area_id: i32,
    pub big_map_pos: Position,
    pub in_safe_area: bool,
    pub in_prison: bool,

    // Appearance
    pub voice_pitch: f64,
    pub face_data: FaceData,
    pub skin_color_dark: f64,
    pub skin_id: i32,
    pub skin_lv: i32,

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
    pub salary: i32,
    pub population: i32,

    // Equipment
    pub now_equipment: Equipment,
    pub horse_save_record: i32,
    pub horse_armor_save_record: i32,

    // Inventory
    pub item_list_data: ItemListData,
    pub self_storage: Option<ItemListData>,

    // Skills
    pub kungfu_skills: Vec<KungfuSkill>,
    pub kungfu_skill_focus: Vec<i32>,
    pub living_skill_focus: Vec<i32>,

    // Relationships
    pub teacher: i32,
    pub students: Vec<i32>,
    pub lover: i32,
    pub pre_lovers: Vec<i32>,
    pub relatives: Vec<i32>,
    pub brothers: Vec<i32>,
    pub friends: Vec<i32>,
    pub haters: Vec<i32>,

    // Tags
    pub hero_tag_data: Vec<HeroTag>,
    pub hero_tag_point: f64,

    // Team
    pub in_team: bool,
    pub team_leader: i32,
    pub team_mates: Vec<i32>,

    // Catch-all for unknown/new fields
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}
```

### Sub-structs

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position { pub x: f64, pub y: f64 }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FaceData { pub face_id: Vec<i32> }

#[derive(Debug, Clone, Serialize, Deserialize)]
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
pub struct ItemListData {
    pub hero_id: i32,
    pub force_id: i32,
    pub money: i64,
    pub weight: f64,
    pub max_weight: f64,
    pub all_item: Vec<Item>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub item_id: i32,
    #[serde(rename = "type")]
    pub item_type: i32,  // 0=equip, 1=med, 2=food, 3=book, 4=treasure, 5=material, 6=horse
    pub sub_type: i32,
    pub name: String,
    pub value: i32,
    pub item_lv: i32,
    pub rare_lv: i32,
    pub weight: f64,
    pub equipment_data: Option<serde_json::Value>,
    pub med_food_data: Option<serde_json::Value>,
    pub book_data: Option<serde_json::Value>,
    pub treasure_data: Option<serde_json::Value>,
    pub material_data: Option<serde_json::Value>,
    pub horse_data: Option<serde_json::Value>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KungfuSkill {
    pub skill_id: i32,
    pub lv: i32,
    pub fight_exp: f64,
    pub book_exp: f64,
    pub equiped: bool,
    pub belong_hero_id: i32,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeroTag {
    pub tag_id: i32,
    pub left_time: f64,
    pub source_hero: Option<i32>,
}
```

## Undo/Redo System

```rust
#[derive(Debug, Clone)]
pub enum EditCommand {
    SetField {
        hero_id: i32,
        field_path: String,     // e.g. "heroName", "baseAttri.0", "itemListData.money"
        old_value: Value,
        new_value: Value,
    },
    AddItem {
        hero_id: i32,
        storage: String,        // "inventory" or "selfStorage"
        item: Item,
    },
    RemoveItem {
        hero_id: i32,
        storage: String,
        index: usize,
        item: Item,             // stored for undo
    },
}

pub struct EditHistory {
    undo_stack: Vec<EditCommand>,
    redo_stack: Vec<EditCommand>,
    max_history: usize,         // default 100
}
```

## Tauri Commands (IPC API)

```rust
// Save slot management
#[tauri::command] fn list_save_slots() -> Vec<SaveSlotInfo>;
#[tauri::command] fn load_save(slot_path: String) -> Result<SaveInfo, String>;
#[tauri::command] fn save_file() -> Result<(), String>;

// Hero list
#[tauri::command] fn get_hero_list() -> Vec<HeroSummary>;
// HeroSummary = { heroId, name, nickName, forceName, dead, isLeader, isFemale, age, fightScore }

// Hero detail
#[tauri::command] fn get_hero(hero_id: i32) -> Result<HeroDetail, String>;
#[tauri::command] fn update_hero_field(hero_id: i32, field_path: String, value: Value) -> Result<(), String>;

// Undo/Redo
#[tauri::command] fn undo() -> Result<UndoResult, String>;
#[tauri::command] fn redo() -> Result<UndoResult, String>;
#[tauri::command] fn get_edit_status() -> EditStatus;
// EditStatus = { canUndo, canRedo, unsavedChanges, undoDescription, redoDescription }

// Asset data (for dropdowns/lookups)
#[tauri::command] fn get_force_list() -> Vec<ForceInfo>;
#[tauri::command] fn get_skill_list() -> Vec<SkillInfo>;
#[tauri::command] fn get_tag_list() -> Vec<TagInfo>;
#[tauri::command] fn get_spe_add_names() -> HashMap<i32, String>;
#[tauri::command] fn get_horse_list() -> Vec<HorseInfo>;
```

## Frontend UI Design

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Open Save] [Save] [Undo] [Redo]     龙隐立志传存档编辑器 │
├──────────────┬──────────────────────────────────────────┤
│  Hero List   │  Hero Detail                             │
│  ┌──────────┐│  ┌──────────────────────────────────────┐│
│  │[Search__]││  │[身份][属性][武学][装备][物品][关系][天赋]││
│  │Filter: ▼ ││  │                                      ││
│  ├──────────┤│  │  (Active tab content)                 ││
│  │★ 李逍遥  ││  │                                      ││
│  │  仙霞派👑 ││  │                                      ││
│  │  车宛形   ││  │                                      ││
│  │  无门派   ││  │                                      ││
│  │  林云裳   ││  │                                      ││
│  │  ...      ││  │                                      ││
│  │           ││  │                                      ││
│  │           ││  │                                      ││
│  └──────────┘│  └──────────────────────────────────────┘│
├──────────────┴──────────────────────────────────────────┤
│  Status: 3 unsaved changes | Ctrl+Z to undo             │
└─────────────────────────────────────────────────────────┘
```

### Tab Details

#### 身份 (Identity)
- Hero name, family name, nickname (text inputs)
- Gender toggle, age (number input)
- Force (dropdown from ForceData.txt), leader checkbox
- Job type/ID, force level
- Fame, bad fame, loyalty (number inputs)
- Evil/chaos alignment (sliders 0-100)
- Nature (dropdown: 0-6), talent (dropdown)
- Hobby list (tag picker from HeroTagData.txt hobby section)

#### 属性 (Attributes)
- 3-column table layout for base/max/total
- 6 core attributes with Chinese labels from SpeAddDataBase.txt (indices 0-5)
- 9 combat skills with Chinese labels (indices 6-14)
- 9 living skills with Chinese labels (indices 24-32) + exp column
- HP/Power/Mana section with current/max/realMax
- "Max All" quick button to set all current values to their max

#### 武学 (Martial Skills)
- Table: skill name (from KungFuData.txt), category, level, exp, equipped
- Equipped skill slots display
- Add skill button (searchable skill picker)
- Edit level/exp inline

#### 装备 (Equipment)
- Equipment slots visualization (weapon/armor/helmet/shoes/decorations)
- Each slot shows item from inventory by index
- Horse + horse armor display
- Item details panel showing stat bonuses (SpeAddDataBase.txt resolves numeric IDs)

#### 物品 (Inventory)
- Money display (editable)
- Two sub-tabs: 随身 (carried) and 仓库 (personal storage)
- Sortable/filterable item table
- Item type filter (equipment/medicine/food/book/treasure/material/horse)
- Add/remove items, edit item properties

#### 关系 (Relationships)
- Teacher/Students section with hero name resolution
- Lover/Previous lovers
- Relatives, sworn brothers, friends, enemies
- Hero picker for adding relationships
- Team info display

#### 天赋 (Tags/Talents)
- Tag list with name/effect from HeroTagData.txt
- Category grouping (武学/技艺/天生/志向/喜好/战法/高级/特效)
- Add tag picker, remove tag button
- Edit tag duration

## Asset Data Loading

Parse the CSV-like `.txt` files at startup into lookup maps:

| File | Key | Resolved Data |
|------|-----|---------------|
| `SpeAddDataBase.txt` | stat ID (0-214+) | Chinese name, description |
| `ForceData.txt` | force ID (0-29) | Force name, style, color |
| `KungFuData.txt` | skill ID | Name, category, level, description |
| `SpeHeroData.txt` | hero row | Predefined hero data |
| `HeroTagData.txt` | tag ID (0-390+) | Name, effect, category |
| `HorseData.txt` | horse ID (0-47) | Name, stats |

## Data Flow

### Loading
1. User selects save slot (auto-detect Steam save path or manual folder pick)
2. Rust reads Info (164B) → show save metadata
3. Rust reads Hero (37MB) → serde parse into `Vec<Option<Hero>>` (~1-2s)
4. Rust parses asset .txt files into lookup HashMaps
5. Frontend receives hero summary list (~864 entries, ~50KB)
6. User clicks hero → frontend requests full hero data (~40KB)

### Editing
1. User modifies field in form
2. React debounces (300ms) → calls `update_hero_field(heroId, path, value)`
3. Rust creates EditCommand (stores old+new value), pushes to undo stack
4. Rust applies change to in-memory hero
5. Frontend updates "unsaved changes" counter

### Saving
1. User clicks Save (or Ctrl+S)
2. Rust creates backup: `Hero.bak.{timestamp}`
3. Rust serializes full hero array → writes to disk
4. Confirm dialog, clear unsaved-changes indicator

### Undo/Redo
- Ctrl+Z: pop undo stack → restore old value → push to redo stack → notify frontend
- Ctrl+Y: pop redo stack → restore new value → push to undo stack → notify frontend

## Error Handling

- JSON parse failures: show error dialog with file path and serde error message
- Save failures: show error, keep in-memory state intact, suggest backup path
- Corrupted/unexpected null heroes: skip nulls gracefully, show count of loaded vs skipped
- Field validation: prevent invalid types (e.g., negative age, string where number expected)

## Future Expansion (Phase 2+)

- Save file editing (world state, factions, areas, buildings)
- TempHero file editing
- Batch hero editing (select multiple, apply changes)
- Hero comparison view
- Save file diff viewer
- Import/export individual heroes
- Game version detection and schema migration
