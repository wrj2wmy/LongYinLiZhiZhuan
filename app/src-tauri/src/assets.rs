use serde::Serialize;
use std::collections::HashMap;
use std::path::Path;

// ---------------------------------------------------------------------------
// Entry structs
// ---------------------------------------------------------------------------

/// Stat‐effect definition from SpeAddDataBase.txt
#[derive(Debug, Clone, Serialize)]
pub struct SpeAddEntry {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub is_percentage: bool,
}

/// Faction / sect from ForceData.txt
#[derive(Debug, Clone, Serialize)]
pub struct ForceEntry {
    pub id: i32,
    pub name: String,
    pub style: String,
    pub level: i32,
    pub color: String,
}

/// Martial‐arts skill from KungFuData.txt
#[derive(Debug, Clone, Serialize)]
pub struct KungfuEntry {
    pub id: i32,
    pub category: String,
    pub level: i32,
    pub name: String,
    pub description: String,
}

/// Talent / trait from HeroTagData.txt
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

// ---------------------------------------------------------------------------
// Aggregate container
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
pub struct AssetData {
    pub spe_add_data: HashMap<i32, SpeAddEntry>,
    pub forces: HashMap<i32, ForceEntry>,
    pub kungfu_skills: HashMap<i32, KungfuEntry>,
    pub tags: HashMap<i32, TagEntry>,
    pub horses: HashMap<i32, HorseEntry>,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Strip the UTF-8 BOM if present.
fn strip_bom(s: &str) -> &str {
    s.strip_prefix('\u{FEFF}').unwrap_or(s)
}

/// Read a file to string, strip BOM, and return non-empty data lines
/// (skipping the header row).
fn read_data_lines(path: &Path) -> Result<Vec<String>, String> {
    let raw = std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;
    let content = strip_bom(&raw);
    let lines: Vec<String> = content
        .lines()
        .skip(1) // skip header
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.to_string())
        .collect();
    Ok(lines)
}

/// Parse a field as i32, returning a descriptive error on failure.
fn parse_i32(field: &str, col_name: &str, line_num: usize, file: &str) -> Result<i32, String> {
    field.trim().parse::<i32>().map_err(|e| {
        format!(
            "{}:{}: failed to parse '{}' as i32 for column '{}': {}",
            file, line_num, field, col_name, e
        )
    })
}

// ---------------------------------------------------------------------------
// Individual file parsers
// ---------------------------------------------------------------------------

fn parse_spe_add(path: &Path) -> Result<HashMap<i32, SpeAddEntry>, String> {
    let lines = read_data_lines(path)?;
    let file = path.display().to_string();
    let mut map = HashMap::new();
    for (i, line) in lines.iter().enumerate() {
        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() < 11 {
            return Err(format!("{}:{}: expected >=11 columns, got {}", file, i + 2, cols.len()));
        }
        let id = parse_i32(cols[0], "id", i + 2, &file)?;
        let is_pct_val = parse_i32(cols[5], "is_percentage", i + 2, &file)?;
        map.insert(
            id,
            SpeAddEntry {
                id,
                name: cols[1].to_string(),
                description: cols[10].to_string(),
                is_percentage: is_pct_val != 0,
            },
        );
    }
    Ok(map)
}

fn parse_forces(path: &Path) -> Result<HashMap<i32, ForceEntry>, String> {
    let lines = read_data_lines(path)?;
    let file = path.display().to_string();
    let mut map = HashMap::new();
    for (i, line) in lines.iter().enumerate() {
        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() < 6 {
            return Err(format!("{}:{}: expected >=6 columns, got {}", file, i + 2, cols.len()));
        }
        let id = parse_i32(cols[0], "id", i + 2, &file)?;
        let level = parse_i32(cols[3], "level", i + 2, &file)?;
        map.insert(
            id,
            ForceEntry {
                id,
                name: cols[1].to_string(),
                style: cols[2].to_string(),
                level,
                color: cols[5].to_string(),
            },
        );
    }
    Ok(map)
}

fn parse_kungfu(path: &Path) -> Result<HashMap<i32, KungfuEntry>, String> {
    let lines = read_data_lines(path)?;
    let file = path.display().to_string();
    let mut map = HashMap::new();
    for (i, line) in lines.iter().enumerate() {
        let cols: Vec<&str> = line.split(',').collect();
        // Header has 29 columns; description is column index 4 and may
        // theoretically contain ASCII commas (though in practice the data
        // uses Chinese commas).  We require at least 5 columns.
        if cols.len() < 5 {
            return Err(format!("{}:{}: expected >=5 columns, got {}", file, i + 2, cols.len()));
        }
        let id = parse_i32(cols[0], "id", i + 2, &file)?;
        let level = parse_i32(cols[2], "level", i + 2, &file)?;
        // If there are extra columns beyond 29, the description spanned
        // commas.  Re-join cols[4..end-24] to reconstruct the description,
        // since there are 24 columns after the description (indices 5..28).
        let expected_total = 29;
        let description = if cols.len() > expected_total {
            // Extra commas in description: join the overflow back together
            let desc_end = cols.len() - (expected_total - 5);
            cols[4..desc_end].join(",")
        } else {
            cols[4].to_string()
        };
        map.insert(
            id,
            KungfuEntry {
                id,
                category: cols[1].to_string(),
                level,
                name: cols[3].to_string(),
                description,
            },
        );
    }
    Ok(map)
}

fn parse_tags(path: &Path) -> Result<HashMap<i32, TagEntry>, String> {
    let lines = read_data_lines(path)?;
    let file = path.display().to_string();
    let mut map = HashMap::new();
    for (i, line) in lines.iter().enumerate() {
        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() < 12 {
            return Err(format!("{}:{}: expected >=12 columns, got {}", file, i + 2, cols.len()));
        }
        let id = parse_i32(cols[0], "id", i + 2, &file)?;
        let value = parse_i32(cols[2], "value", i + 2, &file)?;
        map.insert(
            id,
            TagEntry {
                id,
                name: cols[1].to_string(),
                value,
                effect: cols[4].to_string(),
                category: cols[11].to_string(),
            },
        );
    }
    Ok(map)
}

fn parse_horses(path: &Path) -> Result<HashMap<i32, HorseEntry>, String> {
    let lines = read_data_lines(path)?;
    let file = path.display().to_string();
    let mut map = HashMap::new();
    for (i, line) in lines.iter().enumerate() {
        let cols: Vec<&str> = line.split(',').collect();
        // Header has 9 columns. Description (col 2) may contain ASCII
        // commas.  Columns after description: level(3), speed(4),
        // power(5), sprint(6), resist(7), value(8) = 6 trailing columns.
        if cols.len() < 9 {
            return Err(format!("{}:{}: expected >=9 columns, got {}", file, i + 2, cols.len()));
        }
        let id = parse_i32(cols[0], "id", i + 2, &file)?;
        let expected_total = 9;
        let (description, tail_start) = if cols.len() > expected_total {
            let desc_end = cols.len() - (expected_total - 3);
            (cols[2..desc_end].join(","), desc_end)
        } else {
            (cols[2].to_string(), 3)
        };
        let level = parse_i32(cols[tail_start], "level", i + 2, &file)?;
        let speed = parse_i32(cols[tail_start + 1], "speed", i + 2, &file)?;
        let power = parse_i32(cols[tail_start + 2], "power", i + 2, &file)?;
        let sprint = parse_i32(cols[tail_start + 3], "sprint", i + 2, &file)?;
        let resist = parse_i32(cols[tail_start + 4], "resist", i + 2, &file)?;
        map.insert(
            id,
            HorseEntry {
                id,
                name: cols[1].to_string(),
                description,
                level,
                speed,
                power,
                sprint,
                resist,
            },
        );
    }
    Ok(map)
}

// ---------------------------------------------------------------------------
// AssetData
// ---------------------------------------------------------------------------

impl AssetData {
    /// Load all asset lookup tables from the given directory.
    ///
    /// `assets_dir` should point to the directory containing the `.txt` files
    /// (e.g. `<project_root>/assets/`).
    pub fn load_from_dir(assets_dir: &Path) -> Result<Self, String> {
        let spe_add_data = parse_spe_add(&assets_dir.join("SpeAddDataBase.txt"))?;
        let forces = parse_forces(&assets_dir.join("ForceData.txt"))?;
        let kungfu_skills = parse_kungfu(&assets_dir.join("KungFuData.txt"))?;
        let tags = parse_tags(&assets_dir.join("HeroTagData.txt"))?;
        let horses = parse_horses(&assets_dir.join("HorseData.txt"))?;
        Ok(Self {
            spe_add_data,
            forces,
            kungfu_skills,
            tags,
            horses,
        })
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    /// Resolve the project‐level `assets/` directory.
    fn assets_dir() -> PathBuf {
        let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("..")
            .join("assets");
        assert!(dir.exists(), "assets directory not found at {}", dir.display());
        dir
    }

    #[test]
    fn test_load_all() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");

        // SpeAddDataBase: >200 entries
        assert!(
            data.spe_add_data.len() > 200,
            "expected >200 spe_add entries, got {}",
            data.spe_add_data.len()
        );
        assert_eq!(data.spe_add_data[&0].name, "力道");
        assert_eq!(data.spe_add_data[&7].name, "轻功");

        // Forces: exactly 30 entries
        assert_eq!(
            data.forces.len(),
            30,
            "expected 30 force entries, got {}",
            data.forces.len()
        );
        assert_eq!(data.forces[&0].name, "长乐帮");
        assert_eq!(data.forces[&10].name, "少林寺");

        // KungFu: >100 entries
        assert!(
            data.kungfu_skills.len() > 100,
            "expected >100 kungfu entries, got {}",
            data.kungfu_skills.len()
        );
        assert_eq!(data.kungfu_skills[&0].name, "吐纳法");
        assert_eq!(data.kungfu_skills[&0].category, "内功");

        // Tags: >300 entries
        assert!(
            data.tags.len() > 300,
            "expected >300 tag entries, got {}",
            data.tags.len()
        );
        assert_eq!(data.tags[&0].name, "力道");

        // Horses: >40 entries
        assert!(
            data.horses.len() > 40,
            "expected >40 horse entries, got {}",
            data.horses.len()
        );
        assert_eq!(data.horses[&0].name, "骡子");
    }

    #[test]
    fn test_spe_add_details() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");
        let entry = &data.spe_add_data[&0];
        assert_eq!(entry.name, "力道");
        // Description should contain the newline-escaped text
        assert!(entry.description.contains("暴击"), "description should mention 暴击");
        assert!(!entry.is_percentage, "力道 should not be percentage");
    }

    #[test]
    fn test_force_details() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");
        let entry = &data.forces[&0];
        assert_eq!(entry.style, "中庸");
        assert_eq!(entry.level, 3);
        assert_eq!(entry.color, "53defd");
    }

    #[test]
    fn test_kungfu_details() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");
        let entry = &data.kungfu_skills[&0];
        assert_eq!(entry.level, 0);
        assert!(
            entry.description.contains("浊气"),
            "description should mention 浊气, got: {}",
            entry.description
        );
    }

    #[test]
    fn test_horse_details() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");
        let entry = &data.horses[&0];
        assert_eq!(entry.name, "骡子");
        assert_eq!(entry.level, 0);
        assert_eq!(entry.speed, 10);
        assert_eq!(entry.power, 15);
        assert_eq!(entry.sprint, 10);
        assert_eq!(entry.resist, 15);
    }

    #[test]
    fn test_tag_details() {
        let data = AssetData::load_from_dir(&assets_dir()).expect("failed to load asset data");
        let entry = &data.tags[&0];
        assert_eq!(entry.name, "力道");
        assert_eq!(entry.value, 1);
        assert!(entry.effect.contains("力道"), "effect should mention 力道");
        assert_eq!(entry.category, "武学");
    }
}
