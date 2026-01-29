use serde::{Deserialize, Serialize};

// ============================================================================
// SEMESTER
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Semester {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============================================================================
// TRACKER
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tracker {
    pub id: String,
    pub semester_id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub total_subjects: i32,
    pub total_units: i32,
    pub total_topics: i32,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============================================================================
// SUBJECTS & UNITS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    pub id: String,
    pub tracker_id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Unit {
    pub id: String,
    pub subject_id: String,
    pub name: String,
    pub order: i32,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Topic {
    pub id: String,
    pub unit_id: String,
    pub name: String,
    pub completed: bool,
    pub order: i32,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============================================================================
// TESTS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TestType {
    LabPractical,
    ClassTest,
    ISA,
    ESA,
}

impl TestType {
    pub fn as_str(&self) -> &str {
        match self {
            TestType::LabPractical => "lab_practical",
            TestType::ClassTest => "class_test",
            TestType::ISA => "isa",
            TestType::ESA => "esa",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "lab_practical" => Some(TestType::LabPractical),
            "class_test" => Some(TestType::ClassTest),
            "isa" => Some(TestType::ISA),
            "esa" => Some(TestType::ESA),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Test {
    pub id: String,
    pub tracker_id: String,
    pub name: String,
    pub test_type: TestType,
    pub scheduled_date: i64, // timestamp in ms
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCoverage {
    pub id: String,
    pub test_id: String,
    pub unit_id: Option<String>,
    pub topic_id: Option<String>,
}

// ============================================================================
// PROGRESS (DERIVED)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitProgress {
    pub unit_id: String,
    pub unit_name: String,
    pub total_topics: i32,
    pub completed_topics: i32,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectProgress {
    pub subject_id: String,
    pub subject_name: String,
    pub total_topics: i32,
    pub completed_topics: i32,
    pub percentage: f64,
    pub units: Vec<UnitProgress>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackerProgress {
    pub tracker_id: String,
    pub total_topics: i32,
    pub completed_topics: i32,
    pub percentage: f64,
    pub subjects: Vec<SubjectProgress>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriorityTest {
    pub test: Test,
    pub coverage: Vec<TestCoverage>,
    pub days_remaining: i32,
    pub time_remaining: String,
    pub covered_topics: Vec<String>,
}
