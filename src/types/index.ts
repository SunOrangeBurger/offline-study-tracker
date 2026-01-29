/**
 * Core Type Definitions for Study Tracker App
 * Shared between Rust backend and React frontend
 */

// ============================================================================
// SEMESTER
// ============================================================================

export interface Semester {
  id: string; // UUID
  name: string;
  created_at: number; // timestamp in ms
  updated_at: number;
}

// ============================================================================
// TRACKER (per semester)
// ============================================================================

export interface Tracker {
  id: string;
  semester_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  total_subjects?: number;
  total_units?: number;
  total_topics?: number;
  created_at: number;
  updated_at: number;
}

// ============================================================================
// SUBJECTS & UNITS
// ============================================================================

export interface Subject {
  id: string;
  tracker_id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface Unit {
  id: string;
  subject_id: string;
  name: string;
  order: number; // For maintaining unit order within subject
  created_at: number;
  updated_at: number;
}

export interface Topic {
  id: string;
  unit_id: string;
  name: string;
  completed: boolean;
  order: number; // For maintaining topic order within unit
  created_at: number;
  updated_at: number;
}

// ============================================================================
// TESTS
// ============================================================================

export enum TestType {
  LabPractical = "lab_practical",
  ClassTest = "class_test",
  ISA = "isa",
  ESA = "esa",
}

export interface Test {
  id: string;
  tracker_id: string;
  name: string;
  test_type: string;
  scheduled_date: number; // timestamp in ms (date only, time is 8 PM)
  created_at: number;
  updated_at: number;
}

/**
 * Maps topics (and optionally units) to a test
 * If unit_id is set, all topics in that unit are covered
 * If specific topic_ids are set, only those topics are covered
 */
export interface TestCoverage {
  id: string;
  test_id: string;
  unit_id: string | null; // null if specific topics selected
  topic_id: string | null; // null if entire unit covered
}

// ============================================================================
// PRIORITY TESTS (derived, not persisted)
// ============================================================================

export interface PriorityTest {
  test: Test;
  coverage: TestCoverage[];
  daysRemaining: number;
  timeRemaining: string; // "2d 5h 30m"
}

// ============================================================================
// PARSED SYLLABUS (for UI input)
// ============================================================================

export interface ParsedSyllabusEntry {
  subjectName: string;
  units: {
    unitName: string;
    topics: string[];
  }[];
}

// ============================================================================
// PROGRESS DATA (derived, not persisted)
// ============================================================================

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  percentage: number;
  units: UnitProgress[];
}

export interface UnitProgress {
  unitId: string;
  unitName: string;
  totalTopics: number;
  completedTopics: number;
  percentage: number;
}

export interface TrackerProgress {
  trackerId: string;
  totalTopics: number;
  completedTopics: number;
  percentage: number;
  subjects: SubjectProgress[];
}

// ============================================================================
// THEME
// ============================================================================

export type Theme = "light" | "dark";
