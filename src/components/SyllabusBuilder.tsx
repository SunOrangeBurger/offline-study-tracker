import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Topic {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  topics: Topic[];
  expanded: boolean;
}

interface Subject {
  id: string;
  name: string;
  units: Unit[];
  expanded: boolean;
}

interface SyllabusBuilderProps {
  onSyllabusChange: (syllabus: string) => void;
  initialSyllabus?: string;
}

export const SyllabusBuilder: React.FC<SyllabusBuilderProps> = ({
  onSyllabusChange,
  initialSyllabus = "",
}) => {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (initialSyllabus) {
      return parseSyllabusToStructure(initialSyllabus);
    }
    return [];
  });
  const [mode, setMode] = useState<"builder" | "text">("builder");
  const [textInput, setTextInput] = useState(initialSyllabus);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addSubject = () => {
    const newSubject: Subject = {
      id: generateId(),
      name: "",
      units: [],
      expanded: true,
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (subjectId: string, name: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, name } : s
    ));
    updateSyllabusText();
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    updateSyllabusText();
  };

  const toggleSubjectExpanded = (subjectId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, expanded: !s.expanded } : s
    ));
  };

  const addUnit = (subjectId: string) => {
    const newUnit: Unit = {
      id: generateId(),
      name: "",
      topics: [],
      expanded: true,
    };
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, units: [...s.units, newUnit] } : s
    ));
  };

  const updateUnit = (subjectId: string, unitId: string, name: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.map(u => 
          u.id === unitId ? { ...u, name } : u
        )
      } : s
    ));
    updateSyllabusText();
  };

  const deleteUnit = (subjectId: string, unitId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.filter(u => u.id !== unitId)
      } : s
    ));
    updateSyllabusText();
  };

  const toggleUnitExpanded = (subjectId: string, unitId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.map(u => 
          u.id === unitId ? { ...u, expanded: !u.expanded } : u
        )
      } : s
    ));
  };

  const addTopic = (subjectId: string, unitId: string) => {
    const newTopic: Topic = {
      id: generateId(),
      name: "",
    };
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.map(u => 
          u.id === unitId ? { ...u, topics: [...u.topics, newTopic] } : u
        )
      } : s
    ));
  };

  const updateTopic = (subjectId: string, unitId: string, topicId: string, name: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.map(u => 
          u.id === unitId ? {
            ...u,
            topics: u.topics.map(t => 
              t.id === topicId ? { ...t, name } : t
            )
          } : u
        )
      } : s
    ));
    updateSyllabusText();
  };

  const deleteTopic = (subjectId: string, unitId: string, topicId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? {
        ...s,
        units: s.units.map(u => 
          u.id === unitId ? {
            ...u,
            topics: u.topics.filter(t => t.id !== topicId)
          } : u
        )
      } : s
    ));
    updateSyllabusText();
  };

  const updateSyllabusText = () => {
    const syllabusText = subjects
      .filter(s => s.name.trim())
      .map(subject => 
        subject.units
          .filter(u => u.name.trim())
          .map(unit => {
            const topics = unit.topics
              .filter(t => t.name.trim())
              .map(t => t.name.trim())
              .join(", ");
            return `${subject.name.trim()} >>> ${unit.name.trim()}${topics ? ` >>> ${topics}` : ""}`;
          })
          .join("\n")
      )
      .join("\n");
    
    setTextInput(syllabusText);
    onSyllabusChange(syllabusText);
  };

  const handleTextInputChange = (value: string) => {
    setTextInput(value);
    onSyllabusChange(value);
    // Parse text back to structure when switching modes
    if (mode === "text") {
      setSubjects(parseSyllabusToStructure(value));
    }
  };

  const switchMode = (newMode: "builder" | "text") => {
    if (mode === "text" && newMode === "builder") {
      setSubjects(parseSyllabusToStructure(textInput));
    } else if (mode === "builder" && newMode === "text") {
      updateSyllabusText();
    }
    setMode(newMode);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => switchMode("builder")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: mode === "builder" ? colors.accent : colors.secondary,
            color: mode === "builder" ? colors.bg : colors.fg,
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Visual Builder
        </button>
        <button
          onClick={() => switchMode("text")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: mode === "text" ? colors.accent : colors.secondary,
            color: mode === "text" ? colors.bg : colors.fg,
            border: `1px solid ${colors.border}`,
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Text Editor
        </button>
      </div>

      {mode === "builder" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Add Subject Button */}
          <button
            onClick={addSubject}
            style={{
              padding: "0.75rem",
              backgroundColor: colors.accent,
              color: colors.bg,
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
            }}
          >
            <Plus size={16} />
            Add Subject
          </button>

          {/* Subjects */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  backgroundColor: colors.secondary,
                }}
              >
                {/* Subject Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <button
                    onClick={() => toggleSubjectExpanded(subject.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.fg,
                      padding: 0,
                    }}
                  >
                    {subject.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, e.target.value)}
                    placeholder=""
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "0.25rem",
                      backgroundColor: colors.bg,
                      color: colors.fg,
                      fontWeight: "bold",
                    }}
                  />
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "0.25rem",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {subject.expanded && (
                  <div style={{ marginLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* Add Unit Button */}
                    <button
                      onClick={() => addUnit(subject.id)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: colors.hover,
                        color: colors.fg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        alignSelf: "flex-start",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Plus size={14} />
                      Add Unit
                    </button>

                    {/* Units */}
                    {subject.units.map((unit) => (
                      <div
                        key={unit.id}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: "0.25rem",
                          padding: "0.75rem",
                          backgroundColor: colors.bg,
                        }}
                      >
                        {/* Unit Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <button
                            onClick={() => toggleUnitExpanded(subject.id, unit.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: colors.fg,
                              padding: 0,
                            }}
                          >
                            {unit.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <input
                            type="text"
                            value={unit.name}
                            onChange={(e) => updateUnit(subject.id, unit.id, e.target.value)}
                            placeholder=""
                            style={{
                              flex: 1,
                              padding: "0.375rem",
                              border: `1px solid ${colors.border}`,
                              borderRadius: "0.25rem",
                              backgroundColor: colors.secondary,
                              color: colors.fg,
                              fontSize: "0.875rem",
                            }}
                          />
                          <button
                            onClick={() => deleteUnit(subject.id, unit.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                              padding: "0.25rem",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {unit.expanded && (
                          <div style={{ marginLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {/* Add Topic Button */}
                            <button
                              onClick={() => addTopic(subject.id, unit.id)}
                              style={{
                                padding: "0.375rem",
                                backgroundColor: colors.secondary,
                                color: colors.fg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                alignSelf: "flex-start",
                                fontSize: "0.75rem",
                              }}
                            >
                              <Plus size={12} />
                              Add Topic
                            </button>

                            {/* Topics */}
                            {unit.topics.map((topic) => (
                              <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input
                                  type="text"
                                  value={topic.name}
                                  onChange={(e) => updateTopic(subject.id, unit.id, topic.id, e.target.value)}
                                  placeholder=""
                                  style={{
                                    flex: 1,
                                    padding: "0.25rem",
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "0.25rem",
                                    backgroundColor: colors.hover,
                                    color: colors.fg,
                                    fontSize: "0.75rem",
                                  }}
                                />
                                <button
                                  onClick={() => deleteTopic(subject.id, unit.id, topic.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#ef4444",
                                    padding: "0.125rem",
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: colors.fg, opacity: 0.7 }}>
            Format: Subject Name &gt;&gt;&gt; Unit Name &gt;&gt;&gt; topic1, topic2, topic3
          </p>
          <textarea
            value={textInput}
            onChange={(e) => handleTextInputChange(e.target.value)}
            placeholder=""
            style={{
              width: "100%",
              padding: "0.75rem",
              border: `1px solid ${colors.border}`,
              borderRadius: "0.375rem",
              backgroundColor: colors.secondary,
              color: colors.fg,
              boxSizing: "border-box",
              minHeight: "300px",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              resize: "vertical",
            }}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to parse syllabus text back to structure
function parseSyllabusToStructure(syllabusText: string): Subject[] {
  const subjects: Subject[] = [];
  const subjectMap = new Map<string, Subject>();

  const lines = syllabusText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const parts = line.split('>>>').map(p => p.trim());
    if (parts.length < 2) continue;

    const subjectName = parts[0];
    const unitName = parts[1];
    const topicsStr = parts.length > 2 ? parts[2] : "";
    const topics = topicsStr ? topicsStr.split(',').map(t => t.trim()).filter(t => t) : [];

    // Get or create subject
    let subject = subjectMap.get(subjectName);
    if (!subject) {
      subject = {
        id: Math.random().toString(36).substr(2, 9),
        name: subjectName,
        units: [],
        expanded: true,
      };
      subjectMap.set(subjectName, subject);
      subjects.push(subject);
    }

    // Create unit
    const unit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      name: unitName,
      topics: topics.map(topicName => ({
        id: Math.random().toString(36).substr(2, 9),
        name: topicName,
      })),
      expanded: true,
    };

    subject.units.push(unit);
  }

  return subjects;
}