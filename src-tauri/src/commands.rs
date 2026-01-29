use crate::models::*;
use crate::db::Database;
use crate::utils::{parse_syllabus, calculate_tracker_progress, get_days_remaining, format_time_remaining, is_within_priority_window};
use uuid::Uuid;
use std::sync::Mutex;
use std::time::SystemTime;

pub struct AppState {
    pub db: Mutex<Database>,
}

fn get_current_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64
}

// ============================================================================
// SEMESTER COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_semester(state: tauri::State<AppState>, name: String) -> Result<Semester, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = get_current_timestamp();
    db.create_semester(id, name, now)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_semesters(state: tauri::State<AppState>) -> Result<Vec<Semester>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_semesters().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_semester(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_semester(&id).map_err(|e| e.to_string())
}

// ============================================================================
// TRACKER COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_new_tracker(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    semesterId: String,
    name: String,
    #[allow(non_snake_case)]
    syllabusText: String,
) -> Result<Tracker, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Parse syllabus
    let parsed_entries = parse_syllabus(&syllabusText)?;

    // Create tracker
    let tracker_id = Uuid::new_v4().to_string();
    let now = get_current_timestamp();
    let _tracker = db
        .create_tracker(tracker_id.clone(), semesterId, name, None, None, now)
        .map_err(|e| e.to_string())?;

    // Create subjects, units, and topics
    for (_subject_idx, entry) in parsed_entries.iter().enumerate() {
        let subject_id = Uuid::new_v4().to_string();
        db.create_subject(subject_id.clone(), tracker_id.clone(), entry.subject_name.clone(), now)
            .map_err(|e| e.to_string())?;

        for (unit_idx, unit) in entry.units.iter().enumerate() {
            let unit_id = Uuid::new_v4().to_string();
            db.create_unit(
                unit_id.clone(),
                subject_id.clone(),
                unit.unit_name.clone(),
                unit_idx as i32,
                now,
            )
            .map_err(|e| e.to_string())?;

            for (topic_idx, topic) in unit.topics.iter().enumerate() {
                let topic_id = Uuid::new_v4().to_string();
                db.create_topic(topic_id, unit_id.clone(), topic.clone(), topic_idx as i32, now)
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    // Update tracker statistics
    db.update_tracker_statistics(&tracker_id, now)
        .map_err(|e| e.to_string())?;

    // Return updated tracker
    db.get_tracker(&tracker_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Failed to retrieve created tracker".to_string())
}

#[tauri::command]
pub fn get_trackers_by_semester(
    state: tauri::State<AppState>, 
    #[allow(non_snake_case)]
    semesterId: String
) -> Result<Vec<Tracker>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_trackers_by_semester(&semesterId)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_tracker(state: tauri::State<AppState>, id: String) -> Result<Option<Tracker>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_tracker(&id).map_err(|e| e.to_string())
}

// ============================================================================
// TRACKER DATA COMMANDS
// ============================================================================

#[tauri::command]
pub fn get_tracker_data(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    trackerId: String,
) -> Result<TrackerData, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let subjects = db.get_subjects_by_tracker(&trackerId)
        .map_err(|e| e.to_string())?;

    let mut subjects_data = Vec::new();
    for subject in subjects {
        let units = db.get_units_by_subject(&subject.id)
            .map_err(|e| e.to_string())?;

        let mut units_data = Vec::new();
        for unit in units {
            let topics = db.get_topics_by_unit(&unit.id)
                .map_err(|e| e.to_string())?;

            units_data.push(UnitData {
                unit: unit.clone(),
                topics,
            });
        }

        subjects_data.push(SubjectData {
            subject: subject.clone(),
            units: units_data,
        });
    }

    let progress = calculate_tracker_progress(&db, &trackerId)
        .map_err(|e| e.to_string())?;

    let tests = db.get_tests_by_tracker(&trackerId)
        .map_err(|e| e.to_string())?;

    let mut priority_tests = Vec::new();
    for test in tests.iter() {
        if is_within_priority_window(test.scheduled_date) {
            let coverage = db.get_test_coverage(&test.id)
                .map_err(|e| e.to_string())?;

            // Collect all topics covered by this test
            let mut covered_topics = Vec::new();
            for cov in coverage.iter() {
                if let Some(unit_id) = &cov.unit_id {
                    // Entire unit covered
                    let unit_topics = db.get_topics_by_unit(unit_id)
                        .map_err(|e| e.to_string())?;
                    covered_topics.extend(unit_topics.iter().map(|t| t.name.clone()));
                } else if let Some(topic_id) = &cov.topic_id {
                    // Specific topic covered
                    if let Some(topic) = db.get_topic(topic_id)
                        .map_err(|e| e.to_string())? {
                        covered_topics.push(topic.name);
                    }
                }
            }

            priority_tests.push(PriorityTest {
                test: test.clone(),
                coverage: coverage.clone(),
                days_remaining: get_days_remaining(test.scheduled_date),
                time_remaining: format_time_remaining(test.scheduled_date),
                covered_topics,
            });
        }
    }

    // Sort by days remaining (closer tests first)
    priority_tests.sort_by_key(|t| t.days_remaining);

    Ok(TrackerData {
        subjects: subjects_data,
        progress,
        all_tests: tests,
        priority_tests,
    })
}

// ============================================================================
// TOPIC COMMANDS
// ============================================================================

#[tauri::command]
pub fn toggle_topic(
    state: tauri::State<AppState>, 
    #[allow(non_snake_case)]
    topicId: String
) -> Result<Option<Topic>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = get_current_timestamp();
    db.toggle_topic_completion(&topicId, now)
        .map_err(|e| e.to_string())
}

// ============================================================================
// TEST COMMANDS
// ============================================================================

#[tauri::command]
pub fn schedule_test(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    trackerId: String,
    name: String,
    #[allow(non_snake_case)]
    testType: String,
    #[allow(non_snake_case)]
    scheduledDate: i64,
    #[allow(non_snake_case)]
    coverageData: Vec<TestCoverageInput>,
) -> Result<Test, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let test_type_enum = TestType::from_str(&testType)
        .ok_or_else(|| "Invalid test type".to_string())?;

    let test_id = Uuid::new_v4().to_string();
    let now = get_current_timestamp();

    let test = db.create_test(
        test_id.clone(),
        trackerId,
        name,
        &test_type_enum,
        scheduledDate,
        now,
    )
    .map_err(|e| e.to_string())?;

    // Create coverage entries
    for cov_input in coverageData {
        let cov_id = Uuid::new_v4().to_string();
        db.create_test_coverage(cov_id, test_id.clone(), cov_input.unit_id, cov_input.topic_id)
            .map_err(|e| e.to_string())?;
    }

    Ok(test)
}

#[tauri::command]
pub fn get_tests_by_tracker(
    state: tauri::State<AppState>, 
    #[allow(non_snake_case)]
    trackerId: String
) -> Result<Vec<Test>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_tests_by_tracker(&trackerId)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_test_details(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    testId: String,
) -> Result<Option<TestDetails>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    if let Some(test) = db.get_test(&testId).map_err(|e| e.to_string())? {
        let coverage = db.get_test_coverage(&testId)
            .map_err(|e| e.to_string())?;

        let mut covered_topics = Vec::new();
        for cov in coverage.iter() {
            if let Some(unit_id) = &cov.unit_id {
                let unit_topics = db.get_topics_by_unit(unit_id)
                    .map_err(|e| e.to_string())?;
                covered_topics.extend(unit_topics.iter().map(|t| t.name.clone()));
            } else if let Some(topic_id) = &cov.topic_id {
                if let Some(topic) = db.get_topic(topic_id)
                    .map_err(|e| e.to_string())? {
                    covered_topics.push(topic.name);
                }
            }
        }

        Ok(Some(TestDetails {
            days_remaining: get_days_remaining(test.scheduled_date),
            time_remaining: format_time_remaining(test.scheduled_date),
            test,
            coverage,
            covered_topics,
        }))
    } else {
        Ok(None)
    }
}

// ============================================================================
// THEME COMMANDS
// ============================================================================

#[tauri::command]
pub fn get_theme(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_theme_preference().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_theme(state: tauri::State<AppState>, theme: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.set_theme_preference(&theme)
        .map_err(|e| e.to_string())?;
    Ok(theme)
}

// ============================================================================
// SUBJECT COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_subject(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    trackerId: String,
    name: String,
) -> Result<Subject, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = get_current_timestamp();
    db.create_subject(id, trackerId, name, now)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_subject(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    subjectId: String,
    name: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = get_current_timestamp();
    db.update_subject(&subjectId, &name, now)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_subject(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    subjectId: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_subject(&subjectId)
        .map_err(|e| e.to_string())
}

// ============================================================================
// TOPIC COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_topic(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    unitId: String,
    name: String,
) -> Result<Topic, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = get_current_timestamp();
    
    // Get the max order for this unit
    let topics = db.get_topics_by_unit(&unitId).map_err(|e| e.to_string())?;
    let order = topics.iter().map(|t| t.order).max().unwrap_or(-1) + 1;
    
    db.create_topic(id, unitId, name, order, now)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_topic(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    topicId: String,
    name: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = get_current_timestamp();
    db.update_topic(&topicId, &name, now)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_topic(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    topicId: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_topic(&topicId)
        .map_err(|e| e.to_string())
}

// ============================================================================
// SYLLABUS EXPORT/IMPORT COMMANDS
// ============================================================================

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SyllabusExport {
    name: String,
    description: Option<String>,
    color: Option<String>,
    version: String,
    subjects: Vec<SyllabusSubject>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SyllabusSubject {
    name: String,
    units: Vec<SyllabusUnit>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SyllabusUnit {
    name: String,
    topics: Vec<String>,
}

#[tauri::command]
pub fn export_syllabus(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    trackerId: String,
) -> Result<SyllabusExport, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    // Get tracker info
    let tracker = db.get_tracker(&trackerId)
        .map_err(|e| e.to_string())?
        .ok_or("Tracker not found")?;
    
    // Get all subjects
    let subjects = db.get_subjects_by_tracker(&trackerId)
        .map_err(|e| e.to_string())?;
    
    let mut syllabus_subjects = Vec::new();
    
    for subject in subjects {
        let units = db.get_units_by_subject(&subject.id)
            .map_err(|e| e.to_string())?;
        
        let mut syllabus_units = Vec::new();
        
        for unit in units {
            let topics = db.get_topics_by_unit(&unit.id)
                .map_err(|e| e.to_string())?;
            
            let topic_names: Vec<String> = topics.iter()
                .map(|t| t.name.clone())
                .collect();
            
            syllabus_units.push(SyllabusUnit {
                name: unit.name,
                topics: topic_names,
            });
        }
        
        syllabus_subjects.push(SyllabusSubject {
            name: subject.name,
            units: syllabus_units,
        });
    }
    
    Ok(SyllabusExport {
        name: tracker.name,
        description: tracker.description,
        color: tracker.color,
        version: "1.0".to_string(),
        subjects: syllabus_subjects,
    })
}

#[tauri::command]
pub fn import_syllabus(
    state: tauri::State<AppState>,
    #[allow(non_snake_case)]
    semesterId: String,
    syllabus: SyllabusExport,
) -> Result<Tracker, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = get_current_timestamp();
    
    // Create tracker
    let tracker_id = Uuid::new_v4().to_string();
    let tracker = db.create_tracker(
        tracker_id.clone(),
        semesterId,
        syllabus.name,
        syllabus.description,
        syllabus.color,
        now,
    ).map_err(|e| e.to_string())?;
    
    // Create subjects, units, and topics
    for subject_data in syllabus.subjects {
        let subject_id = Uuid::new_v4().to_string();
        db.create_subject(subject_id.clone(), tracker_id.clone(), subject_data.name, now)
            .map_err(|e| e.to_string())?;
        
        for (unit_order, unit_data) in subject_data.units.iter().enumerate() {
            let unit_id = Uuid::new_v4().to_string();
            db.create_unit(
                unit_id.clone(),
                subject_id.clone(),
                unit_data.name.clone(),
                unit_order as i32,
                now,
            ).map_err(|e| e.to_string())?;
            
            for (topic_order, topic_name) in unit_data.topics.iter().enumerate() {
                let topic_id = Uuid::new_v4().to_string();
                db.create_topic(
                    topic_id,
                    unit_id.clone(),
                    topic_name.clone(),
                    topic_order as i32,
                    now,
                ).map_err(|e| e.to_string())?;
            }
        }
    }
    
    // Update tracker statistics
    db.update_tracker_statistics(&tracker_id, now)
        .map_err(|e| e.to_string())?;
    
    Ok(tracker)
}

// ============================================================================
// HELPER STRUCTS (for API responses)
// ============================================================================

#[derive(serde::Serialize)]
pub struct SubjectData {
    pub subject: Subject,
    pub units: Vec<UnitData>,
}

#[derive(serde::Serialize)]
pub struct UnitData {
    pub unit: Unit,
    pub topics: Vec<Topic>,
}

#[derive(serde::Serialize)]
pub struct TrackerData {
    pub subjects: Vec<SubjectData>,
    pub progress: TrackerProgress,
    pub all_tests: Vec<Test>,
    pub priority_tests: Vec<PriorityTest>,
}

#[derive(serde::Serialize)]
pub struct TestDetails {
    pub test: Test,
    pub coverage: Vec<TestCoverage>,
    pub covered_topics: Vec<String>,
    pub days_remaining: i32,
    pub time_remaining: String,
}

#[derive(serde::Deserialize)]
pub struct TestCoverageInput {
    pub unit_id: Option<String>,
    pub topic_id: Option<String>,
}
