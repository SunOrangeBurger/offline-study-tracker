use crate::models::*;
use crate::db::Database;
use rusqlite::Result as SqliteResult;

// ============================================================================
// PROGRESS CALCULATIONS
// ============================================================================

pub fn calculate_tracker_progress(
    db: &Database,
    tracker_id: &str,
) -> SqliteResult<TrackerProgress> {
    let subjects = db.get_subjects_by_tracker(tracker_id)?;
    
    let mut total_topics = 0;
    let mut completed_topics = 0;
    let mut subjects_progress = Vec::new();

    for subject in subjects {
        let units = db.get_units_by_subject(&subject.id)?;
        
        let mut subject_total = 0;
        let mut subject_completed = 0;
        let mut units_progress = Vec::new();

        for unit in units {
            let topics = db.get_topics_by_unit(&unit.id)?;
            
            let unit_total = topics.len() as i32;
            let unit_completed = topics.iter().filter(|t| t.completed).count() as i32;

            subject_total += unit_total;
            subject_completed += unit_completed;
            total_topics += unit_total;
            completed_topics += unit_completed;

            units_progress.push(UnitProgress {
                unit_id: unit.id.clone(),
                unit_name: unit.name.clone(),
                total_topics: unit_total,
                completed_topics: unit_completed,
                percentage: if unit_total > 0 {
                    (unit_completed as f64 / unit_total as f64) * 100.0
                } else {
                    0.0
                },
            });
        }

        subjects_progress.push(SubjectProgress {
            subject_id: subject.id.clone(),
            subject_name: subject.name.clone(),
            total_topics: subject_total,
            completed_topics: subject_completed,
            percentage: if subject_total > 0 {
                (subject_completed as f64 / subject_total as f64) * 100.0
            } else {
                0.0
            },
            units: units_progress,
        });
    }

    Ok(TrackerProgress {
        tracker_id: tracker_id.to_string(),
        total_topics,
        completed_topics,
        percentage: if total_topics > 0 {
            (completed_topics as f64 / total_topics as f64) * 100.0
        } else {
            0.0
        },
        subjects: subjects_progress,
    })
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

pub fn get_days_remaining(scheduled_date: i64) -> i32 {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    
    let diff_ms = scheduled_date - now;
    (diff_ms as f64 / (86400000.0)).ceil() as i32
}

pub fn format_time_remaining(scheduled_date: i64) -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    
    let diff_ms = scheduled_date - now;
    
    if diff_ms <= 0 {
        return "Test has passed".to_string();
    }

    let days = diff_ms / (86400000);
    let hours = (diff_ms % (86400000)) / (3600000);
    let minutes = (diff_ms % (3600000)) / (60000);

    format!("{}d {}h {}m", days, hours, minutes)
}

pub fn is_within_priority_window(scheduled_date: i64) -> bool {
    let days = get_days_remaining(scheduled_date);
    days > 0 && days <= 7
}

// ============================================================================
// SYLLABUS PARSING
// ============================================================================

#[derive(Debug, Clone)]
pub struct ParsedSyllabusEntry {
    pub subject_name: String,
    pub units: Vec<ParsedUnit>,
}

#[derive(Debug, Clone)]
pub struct ParsedUnit {
    pub unit_name: String,
    pub topics: Vec<String>,
}

pub fn parse_syllabus(input: &str) -> Result<Vec<ParsedSyllabusEntry>, String> {
    let mut entries = Vec::new();
    let mut current_subject: Option<String> = None;
    let mut current_units: Vec<ParsedUnit> = Vec::new();

    for line in input.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Expected format: "Subject Name >>> Unit Name >>> topic1, topic2, topic3"
        let parts: Vec<&str> = trimmed.split(">>>").map(|p| p.trim()).collect();

        if parts.len() < 2 {
            return Err("Invalid format. Expected: 'Subject Name >>> Unit Name >>> topic1, topic2, topic3'".to_string());
        }

        let subject_name = parts[0].to_string();
        let unit_name = parts[1].to_string();

        // Parse topics (optional, default to empty)
        let topics_str = if parts.len() > 2 { parts[2] } else { "" };
        let topics: Vec<String> = topics_str
            .split(',')
            .map(|t| t.trim().to_string())
            .filter(|t| !t.is_empty())
            .collect();

        // If subject changed, save previous subject
        if let Some(prev_subject) = &current_subject {
            if prev_subject != &subject_name {
                entries.push(ParsedSyllabusEntry {
                    subject_name: prev_subject.clone(),
                    units: current_units.clone(),
                });
                current_units.clear();
            }
        }

        current_subject = Some(subject_name);
        current_units.push(ParsedUnit {
            unit_name,
            topics,
        });
    }

    // Add final subject
    if let Some(subject_name) = current_subject {
        entries.push(ParsedSyllabusEntry {
            subject_name,
            units: current_units,
        });
    }

    if entries.is_empty() {
        return Err("No valid entries parsed from syllabus".to_string());
    }

    Ok(entries)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_syllabus() {
        let input = r#"
Mathematics >>> Algebra >>> linear equations, quadratic equations, polynomials
Mathematics >>> Geometry >>> triangles, circles, polygons
Physics >>> Mechanics >>> newton laws, forces, momentum
        "#;
        
        let result = parse_syllabus(input).unwrap();
        assert_eq!(result.len(), 2);
        assert_eq!(result[0].subject_name, "Mathematics");
        assert_eq!(result[0].units.len(), 2);
        assert_eq!(result[0].units[0].topics.len(), 3);
    }
}
