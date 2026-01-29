import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { api } from "../api/client";
import { Tracker } from "../types";
import { ChevronDown } from "lucide-react";
import { NeonCheckbox } from "./NeonCheckbox";

interface SubjectData {
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
    topics: Array<{
      id: string;
      unit_id: string;
      name: string;
      completed: boolean;
      order: number;
      created_at: number;
      updated_at: number;
    }>;
  }>;
}

interface TestScheduleFormProps {
  tracker: Tracker;
  subjects: SubjectData[];
  onTestScheduled: () => void;
  onCancel: () => void;
}

export const TestScheduleForm: React.FC<TestScheduleFormProps> = ({
  tracker,
  subjects,
  onTestScheduled,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState("class_test");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [coverageType, setCoverageType] = useState<"entire-unit" | "specific-topics">(
    "entire-unit"
  );
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredSubjects = subjects.filter(s => 
    selectedSubjects.size === 0 || selectedSubjects.has(s.subject.id)
  );

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const handleToggleUnit = (unitId: string) => {
    if (coverageType === "entire-unit") {
      setSelectedUnits((prev) => {
        const next = new Set(prev);
        if (next.has(unitId)) {
          next.delete(unitId);
        } else {
          next.add(unitId);
        }
        return next;
      });
    }
  };

  const handleToggleTopic = (topicId: string) => {
    if (coverageType === "specific-topics") {
      setSelectedTopics((prev) => {
        const next = new Set(prev);
        if (next.has(topicId)) {
          next.delete(topicId);
        } else {
          next.add(topicId);
        }
        return next;
      });
    }
  };

  const handleToggleUnitExpand = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!testName.trim() || !scheduledDate) {
      setError("Please fill in test name and date");
      return;
    }

    if (coverageType === "entire-unit" && selectedUnits.size === 0) {
      setError("Please select at least one unit");
      return;
    }

    if (coverageType === "specific-topics" && selectedTopics.size === 0) {
      setError("Please select at least one topic");
      return;
    }

    setIsSubmitting(true);

    try {
      const date = new Date(scheduledDate);
      date.setHours(20, 0, 0, 0); // 8 PM
      const timestamp = date.getTime();

      const coverage_data: Array<{ unit_id: string | null; topic_id: string | null }> = [];

      if (coverageType === "entire-unit") {
        for (const unitId of selectedUnits) {
          coverage_data.push({
            unit_id: unitId,
            topic_id: null,
          });
        }
      } else {
        for (const topicId of selectedTopics) {
          coverage_data.push({
            unit_id: null,
            topic_id: topicId,
          });
        }
      }

      await api.test.schedule(
        tracker.id,
        testName,
        testType,
        timestamp,
        coverage_data
      );

      onTestScheduled();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            borderRadius: "0.375rem",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      <label>
        <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>Test Name</p>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder=""
          style={{
            width: "100%",
            padding: "0.75rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            backgroundColor: colors.secondary,
            color: colors.fg,
            boxSizing: "border-box",
          }}
        />
      </label>

      <label>
        <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>Test Type</p>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            backgroundColor: colors.secondary,
            color: colors.fg,
            boxSizing: "border-box",
          }}
        >
          <option value="lab_practical">Lab Practical</option>
          <option value="class_test">Class Test</option>
          <option value="isa">ISA</option>
          <option value="esa">ESA</option>
        </select>
      </label>

      <label>
        <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>Date (8:00 PM)</p>
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            backgroundColor: colors.secondary,
            color: colors.fg,
            boxSizing: "border-box",
          }}
        />
      </label>

      {/* Subject Filter */}
      <div>
        <p style={{ margin: "0 0 0.75rem 0", fontWeight: 500 }}>Select Subjects (optional filter)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {subjects.map((subjectData) => (
            <button
              key={subjectData.subject.id}
              onClick={() => handleToggleSubject(subjectData.subject.id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: selectedSubjects.has(subjectData.subject.id) 
                  ? colors.accent 
                  : colors.secondary,
                color: selectedSubjects.has(subjectData.subject.id) 
                  ? colors.bg 
                  : colors.fg,
                border: `1px solid ${colors.border}`,
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              {subjectData.subject.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 0.75rem 0", fontWeight: 500 }}>Coverage</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              checked={coverageType === "entire-unit"}
              onChange={() => {
                setCoverageType("entire-unit");
                setSelectedTopics(new Set());
              }}
            />
            Entire Units
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              checked={coverageType === "specific-topics"}
              onChange={() => {
                setCoverageType("specific-topics");
                setSelectedUnits(new Set());
              }}
            />
            Specific Topics
          </label>
        </div>
      </div>

      {/* Unit/Topic Selection */}
      <div style={{ 
        maxHeight: "300px", 
        overflowY: "auto",
        border: `1px solid ${colors.border}`,
        borderRadius: "0.5rem",
        padding: "1rem",
        backgroundColor: colors.bg,
      }}>
        {filteredSubjects.length === 0 ? (
          <p style={{ textAlign: "center", color: colors.fg, opacity: 0.7 }}>
            {selectedSubjects.size > 0 ? "No subjects selected" : "Select subjects above to filter"}
          </p>
        ) : (
          filteredSubjects.map((subjectData) => (
            <div key={subjectData.subject.id} style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                margin: "0 0 0.75rem 0", 
                color: colors.accent,
                fontSize: "1rem",
                fontWeight: 600,
              }}>
                {subjectData.subject.name}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {subjectData.units.map((unitData) => (
                  <div key={unitData.unit.id}>
                    {coverageType === "entire-unit" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem",
                          backgroundColor: colors.secondary,
                          borderRadius: "0.5rem",
                          border: `1px solid ${colors.border}`,
                          width: "100%",
                        }}
                      >
                        <NeonCheckbox
                          checked={selectedUnits.has(unitData.unit.id)}
                          onChange={() => handleToggleUnit(unitData.unit.id)}
                          label={unitData.unit.name}
                        />
                      </div>
                    ) : (
                      <div style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        marginBottom: "0.5rem",
                      }}>
                        <button
                          onClick={() => handleToggleUnitExpand(unitData.unit.id)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: colors.secondary,
                            border: "none",
                            cursor: "pointer",
                            padding: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: colors.fg,
                            fontWeight: 500,
                          }}
                        >
                          <ChevronDown
                            size={16}
                            style={{
                              transform: expandedUnits.has(unitData.unit.id)
                                ? "rotate(0)"
                                : "rotate(-90deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                          {unitData.unit.name}
                        </button>
                        {expandedUnits.has(unitData.unit.id) && (
                          <div
                            style={{
                              padding: "0.5rem",
                              backgroundColor: colors.bg,
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                            }}
                          >
                            {unitData.topics.map((topic) => (
                              <div
                                key={topic.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0.5rem",
                                  backgroundColor: colors.secondary,
                                  borderRadius: "0.375rem",
                                  width: "100%",
                                }}
                              >
                                <NeonCheckbox
                                  checked={selectedTopics.has(topic.id)}
                                  onChange={() => handleToggleTopic(topic.id)}
                                  label={topic.name}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: colors.secondary,
            color: colors.fg,
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: colors.accent,
            color: colors.bg,
            border: "none",
            borderRadius: "0.375rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Scheduling..." : "Schedule Test"}
        </button>
      </div>
    </div>
  );
};
