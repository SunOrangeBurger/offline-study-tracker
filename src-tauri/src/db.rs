use rusqlite::{Connection, Result as SqliteResult, params};
use std::path::PathBuf;
use crate::models::*;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> SqliteResult<Self> {
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA foreign_keys = ON")?;
        let db = Database { conn };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> SqliteResult<()> {
        // First, handle trackers table migration/creation
        self.migrate_trackers_table()?;
        
        // Then create other tables with IF NOT EXISTS
        self.conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS semesters (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS subjects (
                id TEXT PRIMARY KEY,
                tracker_id TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS units (
                id TEXT PRIMARY KEY,
                subject_id TEXT NOT NULL,
                name TEXT NOT NULL,
                "order" INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS topics (
                id TEXT PRIMARY KEY,
                unit_id TEXT NOT NULL,
                name TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                "order" INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tests (
                id TEXT PRIMARY KEY,
                tracker_id TEXT NOT NULL,
                name TEXT NOT NULL,
                test_type TEXT NOT NULL,
                scheduled_date INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS test_coverage (
                id TEXT PRIMARY KEY,
                test_id TEXT NOT NULL,
                unit_id TEXT,
                topic_id TEXT,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
                FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
                FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS theme_preference (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_trackers_semester ON trackers(semester_id);
            CREATE INDEX IF NOT EXISTS idx_subjects_tracker ON subjects(tracker_id);
            CREATE INDEX IF NOT EXISTS idx_units_subject ON units(subject_id);
            CREATE INDEX IF NOT EXISTS idx_topics_unit ON topics(unit_id);
            CREATE INDEX IF NOT EXISTS idx_tests_tracker ON tests(tracker_id);
            CREATE INDEX IF NOT EXISTS idx_test_coverage_test ON test_coverage(test_id);
            "#,
        )?;
        
        Ok(())
    }

    fn migrate_trackers_table(&self) -> SqliteResult<()> {
        // Check if trackers table exists and what columns it has
        let mut stmt = self.conn.prepare("PRAGMA table_info(trackers)")?;
        let column_info: Vec<String> = stmt.query_map([], |row| {
            Ok(row.get::<_, String>(1)?) // column name is at index 1
        })?.collect::<Result<Vec<_>, _>>()?;

        if column_info.is_empty() {
            // Table doesn't exist, create it with all columns
            self.conn.execute(
                r#"
                CREATE TABLE trackers (
                    id TEXT PRIMARY KEY,
                    semester_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    color TEXT,
                    total_subjects INTEGER DEFAULT 0,
                    total_units INTEGER DEFAULT 0,
                    total_topics INTEGER DEFAULT 0,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
                )
                "#,
                [],
            )?;
        } else {
            // Table exists, add missing columns
            if !column_info.contains(&"description".to_string()) {
                self.conn.execute("ALTER TABLE trackers ADD COLUMN description TEXT", [])?;
            }
            if !column_info.contains(&"color".to_string()) {
                self.conn.execute("ALTER TABLE trackers ADD COLUMN color TEXT", [])?;
            }
            if !column_info.contains(&"total_subjects".to_string()) {
                self.conn.execute("ALTER TABLE trackers ADD COLUMN total_subjects INTEGER DEFAULT 0", [])?;
            }
            if !column_info.contains(&"total_units".to_string()) {
                self.conn.execute("ALTER TABLE trackers ADD COLUMN total_units INTEGER DEFAULT 0", [])?;
            }
            if !column_info.contains(&"total_topics".to_string()) {
                self.conn.execute("ALTER TABLE trackers ADD COLUMN total_topics INTEGER DEFAULT 0", [])?;
            }
        }

        Ok(())
    }

    // ========================================================================
    // SEMESTER OPERATIONS
    // ========================================================================

    pub fn create_semester(&self, id: String, name: String, now: i64) -> SqliteResult<Semester> {
        self.conn.execute(
            "INSERT INTO semesters (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            params![&id, &name, now, now],
        )?;
        Ok(Semester {
            id,
            name,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_all_semesters(&self) -> SqliteResult<Vec<Semester>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, created_at, updated_at FROM semesters ORDER BY created_at DESC")?;
        let semesters = stmt.query_map([], |row| {
            Ok(Semester {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })?;
        semesters.collect()
    }

    pub fn delete_semester(&self, id: &str) -> SqliteResult<()> {
        self.conn
            .execute("DELETE FROM semesters WHERE id = ?1", params![id])?;
        Ok(())
    }

    // ========================================================================
    // TRACKER OPERATIONS
    // ========================================================================

    pub fn create_tracker(&self, id: String, semester_id: String, name: String, description: Option<String>, color: Option<String>, now: i64) -> SqliteResult<Tracker> {
        self.conn.execute(
            "INSERT INTO trackers (id, semester_id, name, description, color, total_subjects, total_units, total_topics, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 0, 0, 0, ?6, ?7)",
            params![&id, &semester_id, &name, &description, &color, now, now],
        )?;
        Ok(Tracker {
            id,
            semester_id,
            name,
            description,
            color,
            total_subjects: 0,
            total_units: 0,
            total_topics: 0,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_trackers_by_semester(&self, semester_id: &str) -> SqliteResult<Vec<Tracker>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, semester_id, name, description, color, total_subjects, total_units, total_topics, created_at, updated_at FROM trackers WHERE semester_id = ?1 ORDER BY created_at DESC"
        )?;
        let trackers = stmt.query_map(params![semester_id], |row| {
            Ok(Tracker {
                id: row.get(0)?,
                semester_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                total_subjects: row.get(5)?,
                total_units: row.get(6)?,
                total_topics: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })?;
        trackers.collect()
    }

    pub fn get_tracker(&self, id: &str) -> SqliteResult<Option<Tracker>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, semester_id, name, description, color, total_subjects, total_units, total_topics, created_at, updated_at FROM trackers WHERE id = ?1")?;
        let tracker = stmt.query_row(params![id], |row| {
            Ok(Tracker {
                id: row.get(0)?,
                semester_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                total_subjects: row.get(5)?,
                total_units: row.get(6)?,
                total_topics: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        });

        match tracker {
            Ok(t) => Ok(Some(t)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    // ========================================================================
    // SUBJECT OPERATIONS
    // ========================================================================

    pub fn create_subject(&self, id: String, tracker_id: String, name: String, now: i64) -> SqliteResult<Subject> {
        self.conn.execute(
            "INSERT INTO subjects (id, tracker_id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![&id, &tracker_id, &name, now, now],
        )?;
        Ok(Subject {
            id,
            tracker_id,
            name,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_subjects_by_tracker(&self, tracker_id: &str) -> SqliteResult<Vec<Subject>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, tracker_id, name, created_at, updated_at FROM subjects WHERE tracker_id = ?1 ORDER BY created_at ASC"
        )?;
        let subjects = stmt.query_map(params![tracker_id], |row| {
            Ok(Subject {
                id: row.get(0)?,
                tracker_id: row.get(1)?,
                name: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;
        subjects.collect()
    }

    pub fn update_subject(&self, id: &str, name: &str, now: i64) -> SqliteResult<()> {
        self.conn.execute(
            "UPDATE subjects SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![name, now, id],
        )?;
        Ok(())
    }

    pub fn delete_subject(&self, id: &str) -> SqliteResult<()> {
        self.conn.execute(
            "DELETE FROM subjects WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    // ========================================================================
    // UNIT OPERATIONS
    // ========================================================================

    pub fn create_unit(&self, id: String, subject_id: String, name: String, order: i32, now: i64) -> SqliteResult<Unit> {
        self.conn.execute(
            "INSERT INTO units (id, subject_id, name, \"order\", created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![&id, &subject_id, &name, order, now, now],
        )?;
        Ok(Unit {
            id,
            subject_id,
            name,
            order,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_units_by_subject(&self, subject_id: &str) -> SqliteResult<Vec<Unit>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, subject_id, name, \"order\", created_at, updated_at FROM units WHERE subject_id = ?1 ORDER BY \"order\" ASC"
        )?;
        let units = stmt.query_map(params![subject_id], |row| {
            Ok(Unit {
                id: row.get(0)?,
                subject_id: row.get(1)?,
                name: row.get(2)?,
                order: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;
        units.collect()
    }

    // ========================================================================
    // TOPIC OPERATIONS
    // ========================================================================

    pub fn create_topic(&self, id: String, unit_id: String, name: String, order: i32, now: i64) -> SqliteResult<Topic> {
        self.conn.execute(
            "INSERT INTO topics (id, unit_id, name, completed, \"order\", created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![&id, &unit_id, &name, 0, order, now, now],
        )?;
        Ok(Topic {
            id,
            unit_id,
            name,
            completed: false,
            order,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_topics_by_unit(&self, unit_id: &str) -> SqliteResult<Vec<Topic>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, unit_id, name, completed, \"order\", created_at, updated_at FROM topics WHERE unit_id = ?1 ORDER BY \"order\" ASC"
        )?;
        let topics = stmt.query_map(params![unit_id], |row| {
            Ok(Topic {
                id: row.get(0)?,
                unit_id: row.get(1)?,
                name: row.get(2)?,
                completed: row.get::<_, i32>(3)? != 0,
                order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;
        topics.collect()
    }

    pub fn get_topic(&self, id: &str) -> SqliteResult<Option<Topic>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, unit_id, name, completed, \"order\", created_at, updated_at FROM topics WHERE id = ?1"
        )?;
        let topic = stmt.query_row(params![id], |row| {
            Ok(Topic {
                id: row.get(0)?,
                unit_id: row.get(1)?,
                name: row.get(2)?,
                completed: row.get::<_, i32>(3)? != 0,
                order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        });

        match topic {
            Ok(t) => Ok(Some(t)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn toggle_topic_completion(&self, topic_id: &str, now: i64) -> SqliteResult<Option<Topic>> {
        let topic = self.get_topic(topic_id)?;
        if let Some(mut t) = topic {
            let new_completed = !t.completed;
            self.conn.execute(
                "UPDATE topics SET completed = ?1, updated_at = ?2 WHERE id = ?3",
                params![if new_completed { 1 } else { 0 }, now, topic_id],
            )?;
            t.completed = new_completed;
            t.updated_at = now;
            Ok(Some(t))
        } else {
            Ok(None)
        }
    }

    pub fn update_topic(&self, id: &str, name: &str, now: i64) -> SqliteResult<()> {
        self.conn.execute(
            "UPDATE topics SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![name, now, id],
        )?;
        Ok(())
    }

    pub fn delete_topic(&self, id: &str) -> SqliteResult<()> {
        self.conn.execute(
            "DELETE FROM topics WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    // ========================================================================
    // TEST OPERATIONS
    // ========================================================================

    pub fn create_test(
        &self,
        id: String,
        tracker_id: String,
        name: String,
        test_type: &TestType,
        scheduled_date: i64,
        now: i64,
    ) -> SqliteResult<Test> {
        self.conn.execute(
            "INSERT INTO tests (id, tracker_id, name, test_type, scheduled_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![&id, &tracker_id, &name, test_type.as_str(), scheduled_date, now, now],
        )?;
        Ok(Test {
            id,
            tracker_id,
            name,
            test_type: test_type.clone(),
            scheduled_date,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_tests_by_tracker(&self, tracker_id: &str) -> SqliteResult<Vec<Test>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, tracker_id, name, test_type, scheduled_date, created_at, updated_at FROM tests WHERE tracker_id = ?1 ORDER BY scheduled_date ASC"
        )?;
        let tests = stmt.query_map(params![tracker_id], |row| {
            let test_type_str: String = row.get(3)?;
            Ok(Test {
                id: row.get(0)?,
                tracker_id: row.get(1)?,
                name: row.get(2)?,
                test_type: TestType::from_str(&test_type_str).unwrap_or(TestType::ClassTest),
                scheduled_date: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;
        tests.collect()
    }

    pub fn get_test(&self, id: &str) -> SqliteResult<Option<Test>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, tracker_id, name, test_type, scheduled_date, created_at, updated_at FROM tests WHERE id = ?1"
        )?;
        let test = stmt.query_row(params![id], |row| {
            let test_type_str: String = row.get(3)?;
            Ok(Test {
                id: row.get(0)?,
                tracker_id: row.get(1)?,
                name: row.get(2)?,
                test_type: TestType::from_str(&test_type_str).unwrap_or(TestType::ClassTest),
                scheduled_date: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        });

        match test {
            Ok(t) => Ok(Some(t)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    // ========================================================================
    // TEST COVERAGE OPERATIONS
    // ========================================================================

    pub fn create_test_coverage(
        &self,
        id: String,
        test_id: String,
        unit_id: Option<String>,
        topic_id: Option<String>,
    ) -> SqliteResult<TestCoverage> {
        self.conn.execute(
            "INSERT INTO test_coverage (id, test_id, unit_id, topic_id) VALUES (?1, ?2, ?3, ?4)",
            params![&id, &test_id, &unit_id, &topic_id],
        )?;
        Ok(TestCoverage {
            id,
            test_id,
            unit_id,
            topic_id,
        })
    }

    pub fn get_test_coverage(&self, test_id: &str) -> SqliteResult<Vec<TestCoverage>> {
        let mut stmt = self.conn
            .prepare("SELECT id, test_id, unit_id, topic_id FROM test_coverage WHERE test_id = ?1")?;
        let coverage = stmt.query_map(params![test_id], |row| {
            Ok(TestCoverage {
                id: row.get(0)?,
                test_id: row.get(1)?,
                unit_id: row.get(2)?,
                topic_id: row.get(3)?,
            })
        })?;
        coverage.collect()
    }

    // ========================================================================
    // THEME PREFERENCE
    // ========================================================================

    pub fn get_theme_preference(&self) -> SqliteResult<String> {
        let mut stmt = self.conn
            .prepare("SELECT value FROM theme_preference WHERE key = 'theme'")?;
        let theme = stmt.query_row([], |row| row.get(0));

        match theme {
            Ok(t) => Ok(t),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok("light".to_string()),
            Err(e) => Err(e),
        }
    }

    pub fn set_theme_preference(&self, theme: &str) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO theme_preference (key, value) VALUES ('theme', ?1)",
            params![theme],
        )?;
        Ok(())
    }

    // ========================================================================
    // TRACKER STATISTICS UPDATE
    // ========================================================================

    pub fn update_tracker_statistics(&self, tracker_id: &str, now: i64) -> SqliteResult<()> {
        // Count subjects
        let subject_count: i32 = self.conn.query_row(
            "SELECT COUNT(*) FROM subjects WHERE tracker_id = ?1",
            params![tracker_id],
            |row| row.get(0),
        )?;

        // Count units
        let unit_count: i32 = self.conn.query_row(
            "SELECT COUNT(*) FROM units u JOIN subjects s ON u.subject_id = s.id WHERE s.tracker_id = ?1",
            params![tracker_id],
            |row| row.get(0),
        )?;

        // Count topics
        let topic_count: i32 = self.conn.query_row(
            "SELECT COUNT(*) FROM topics t JOIN units u ON t.unit_id = u.id JOIN subjects s ON u.subject_id = s.id WHERE s.tracker_id = ?1",
            params![tracker_id],
            |row| row.get(0),
        )?;

        // Update tracker
        self.conn.execute(
            "UPDATE trackers SET total_subjects = ?1, total_units = ?2, total_topics = ?3, updated_at = ?4 WHERE id = ?5",
            params![subject_count, unit_count, topic_count, now, tracker_id],
        )?;

        Ok(())
    }
}
