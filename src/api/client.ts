import { invoke } from "@tauri-apps/api/core";
import {
  Semester,
  Tracker,
  Topic,
  Test,
  TrackerProgress,
  Theme,
} from "../types";

export interface TrackerDataResponse {
  subjects: Array<{
    subject: {
      id: string;
      tracker_id: string;
      name: string;
      created_at: number;
      updated_at: number;
    };
    units: Array<{
      unit: {
        id: string;
        subject_id: string;
        name: string;
        order: number;
        created_at: number;
        updated_at: number;
      };
      topics: Topic[];
    }>;
  }>;
  progress: TrackerProgress;
  all_tests: Array<{
    id: string;
    tracker_id: string;
    name: string;
    test_type: string;
    scheduled_date: number;
    created_at: number;
    updated_at: number;
  }>;
  priority_tests: Array<{
    test: {
      id: string;
      tracker_id: string;
      name: string;
      test_type: string;
      scheduled_date: number;
      created_at: number;
      updated_at: number;
    };
    coverage: Array<{
      id: string;
      test_id: string;
      unit_id: string | null;
      topic_id: string | null;
    }>;
    days_remaining: number;
    time_remaining: string;
    covered_topics: string[];
  }>;
}

// SEMESTER COMMANDS
export const api = {
  semester: {
    create: (name: string) =>
      invoke<Semester>("create_semester", { name }),

    getAll: () =>
      invoke<Semester[]>("get_all_semesters"),

    delete: (id: string) =>
      invoke<void>("delete_semester", { id }),
  },

  tracker: {
    create: (semester_id: string, name: string, syllabus_text: string) =>
      invoke<Tracker>("create_new_tracker", {
        semesterId: semester_id,
        name: name,
        syllabusText: syllabus_text,
      }),

    getBysemester: (semester_id: string) =>
      invoke<Tracker[]>("get_trackers_by_semester", { 
        semesterId: semester_id 
      }),

    get: (id: string) =>
      invoke<Tracker | null>("get_tracker", { id }),

    getData: (tracker_id: string) =>
      invoke<TrackerDataResponse>("get_tracker_data", { 
        trackerId: tracker_id 
      }),
  },

  subject: {
    create: (tracker_id: string, name: string) =>
      invoke<{
        id: string;
        tracker_id: string;
        name: string;
        created_at: number;
        updated_at: number;
      }>("create_subject", {
        trackerId: tracker_id,
        name: name,
      }),

    update: (subject_id: string, name: string) =>
      invoke<void>("update_subject", {
        subjectId: subject_id,
        name: name,
      }),

    delete: (subject_id: string) =>
      invoke<void>("delete_subject", {
        subjectId: subject_id,
      }),
  },

  topic: {
    toggle: (topic_id: string) =>
      invoke<Topic | null>("toggle_topic", { topicId: topic_id }),

    create: (unit_id: string, name: string) =>
      invoke<Topic>("create_topic", {
        unitId: unit_id,
        name: name,
      }),

    update: (topic_id: string, name: string) =>
      invoke<void>("update_topic", {
        topicId: topic_id,
        name: name,
      }),

    delete: (topic_id: string) =>
      invoke<void>("delete_topic", {
        topicId: topic_id,
      }),
  },

  test: {
    schedule: (
      tracker_id: string,
      name: string,
      test_type: string,
      scheduled_date: number,
      coverage_data: Array<{ unit_id: string | null; topic_id: string | null }>
    ) =>
      invoke<Test>("schedule_test", {
        trackerId: tracker_id,
        name: name,
        testType: test_type,
        scheduledDate: scheduled_date,
        coverageData: coverage_data,
      }),

    getByTracker: (tracker_id: string) =>
      invoke<Test[]>("get_tests_by_tracker", { 
        trackerId: tracker_id 
      }),

    getDetails: (test_id: string) =>
      invoke<{
        test: Test;
        coverage: Array<{ id: string; test_id: string; unit_id: string | null; topic_id: string | null }>;
        covered_topics: string[];
        days_remaining: number;
        time_remaining: string;
      } | null>("get_test_details", { 
        testId: test_id 
      }),
  },

  theme: {
    get: () =>
      invoke<Theme>("get_theme"),

    set: (theme: Theme) =>
      invoke<Theme>("set_theme", { theme }),
  },

  syllabus: {
    export: (tracker_id: string) =>
      invoke<{
        name: string;
        description?: string;
        color?: string;
        version: string;
        subjects: Array<{
          name: string;
          units: Array<{
            name: string;
            topics: string[];
          }>;
        }>;
      }>("export_syllabus", { trackerId: tracker_id }),

    import: (semester_id: string, syllabus: any) =>
      invoke<Tracker>("import_syllabus", {
        semesterId: semester_id,
        syllabus: syllabus,
      }),
  },
};
