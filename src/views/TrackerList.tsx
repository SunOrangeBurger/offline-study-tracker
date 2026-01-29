import React, { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeProvider";
import { api } from "../api/client";
import { Semester, Tracker } from "../types";
import { Plus, ArrowLeft, BookOpen, Calendar, Upload } from "lucide-react";
import { Modal } from "../components/Modal";
import { TrackerCreationForm } from "../components/TrackerCreationForm";
import { GlassCard } from "../components/GlassCard";

interface TrackerListProps {
  semester: Semester;
  onSelectTracker: (tracker: Tracker) => void;
  onBack: () => void;
}

export const TrackerList: React.FC<TrackerListProps> = ({
  semester,
  onSelectTracker,
  onBack,
}) => {
  const { colors } = useTheme();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    loadTrackers();
  }, [semester.id]);

  const loadTrackers = async () => {
    try {
      setIsLoading(true);
      const data = await api.tracker.getBysemester(semester.id);
      setTrackers(data);
    } catch (err) {
      console.error("Failed to load trackers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTracker = async (data: {
    name: string;
    description: string;
    color: string;
    syllabus: string;
  }) => {
    if (!data.name.trim() || !data.syllabus.trim()) {
      setCreateError("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const tracker = await api.tracker.create(
        semester.id,
        data.name,
        data.syllabus
      );
      setTrackers([tracker, ...trackers]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const getTrackerStats = (tracker: Tracker) => {
    return {
      subjects: tracker.total_subjects || 0,
      units: tracker.total_units || 0,
      topics: tracker.total_topics || 0,
    };
  };

  const handleImportSyllabus = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError("");
    setIsCreating(true);

    try {
      const text = await file.text();
      const syllabusData = JSON.parse(text);
      
      const tracker = await api.syllabus.import(semester.id, syllabusData);
      setTrackers([tracker, ...trackers]);
      setIsImportModalOpen(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Invalid JSON file");
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.accent,
            padding: 0,
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ color: colors.fg, margin: 0 }}>
            {semester.name}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: colors.fg,
              opacity: 0.6,
            }}
          >
            Study Trackers: {trackers.length}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginBottom: "2rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: colors.accent,
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "0.875rem 1.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
          }}
        >
          <Plus size={18} />
          Create New Tracker
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{
            backgroundColor: colors.secondary,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: colors.accent,
            border: `2px solid ${colors.accent}`,
            borderRadius: "12px",
            padding: "0.875rem 1.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: `0 4px 12px ${colors.accent}20`,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.backgroundColor = colors.accent;
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = `0 6px 20px ${colors.accent}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.backgroundColor = colors.secondary;
            e.currentTarget.style.color = colors.accent;
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent}20`;
          }}
        >
          <Upload size={18} />
          Import Syllabus
        </button>
      </div>

      {/* Trackers Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", color: colors.fg, opacity: 0.7 }}>
          Loading trackers...
        </div>
      ) : trackers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: colors.fg,
            opacity: 0.7,
          }}
        >
          <BookOpen size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h3 style={{ margin: "0 0 0.5rem 0" }}>No Study Trackers Yet</h3>
          <p style={{ margin: 0 }}>Create your first tracker to start organizing your studies!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {trackers.map((tracker) => {
            const stats = getTrackerStats(tracker);
            return (
              <GlassCard
                key={tracker.id}
                onClick={() => onSelectTracker(tracker)}
                hover={true}
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Color accent */}
                {tracker.color && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      backgroundColor: tracker.color,
                    }}
                  />
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Header */}
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: "0.5rem",
                        color: tracker.color || colors.accent,
                        fontSize: "1.125rem",
                        fontWeight: "600",
                      }}
                    >
                      {tracker.name}
                    </h3>
                    {tracker.description && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: colors.fg,
                          opacity: 0.7,
                          lineHeight: "1.4",
                        }}
                      >
                        {tracker.description}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "0.75rem",
                      backgroundColor: colors.hover,
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: colors.fg,
                        }}
                      >
                        {stats.subjects}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.fg,
                          opacity: 0.6,
                        }}
                      >
                        Subjects
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: colors.fg,
                        }}
                      >
                        {stats.units}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.fg,
                          opacity: 0.6,
                        }}
                      >
                        Units
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: colors.fg,
                        }}
                      >
                        {stats.topics}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.fg,
                          opacity: 0.6,
                        }}
                      >
                        Topics
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.75rem",
                      color: colors.fg,
                      opacity: 0.5,
                    }}
                  >
                    <Calendar size={12} />
                    Created {new Date(tracker.created_at).toLocaleDateString()}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create Tracker Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateError("");
        }}
        title="Create New Study Tracker"
        maxWidth="800px"
      >
        <TrackerCreationForm
          onCreateTracker={handleCreateTracker}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setCreateError("");
          }}
          isCreating={isCreating}
          error={createError}
        />
      </Modal>

      {/* Import Syllabus Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportError("");
        }}
        title="Import Syllabus from JSON"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {importError && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fee2e2",
                borderRadius: "0.375rem",
                color: "#991b1b",
              }}
            >
              {importError}
            </div>
          )}
          <p style={{ margin: 0, color: colors.fg, opacity: 0.8 }}>
            Select a JSON file containing syllabus data. This will create a new tracker with the imported structure.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportSyllabus}
            disabled={isCreating}
            style={{
              padding: "0.75rem",
              border: `1px solid ${colors.border}`,
              borderRadius: "0.375rem",
              backgroundColor: colors.secondary,
              color: colors.fg,
              cursor: isCreating ? "not-allowed" : "pointer",
            }}
          />
          {isCreating && (
            <p style={{ margin: 0, color: colors.accent, textAlign: "center" }}>
              Importing syllabus...
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
