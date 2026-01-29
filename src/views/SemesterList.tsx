import React, { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeProvider";
import { api } from "../api/client";
import { Semester } from "../types";
import { Plus, Trash2 } from "lucide-react";
import { Modal, ConfirmDialog } from "../components/Modal";

interface SemesterListProps {
  onSelectSemester: (semester: Semester) => void;
}

export const SemesterList: React.FC<SemesterListProps> = ({
  onSelectSemester,
}) => {
  const { colors } = useTheme();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      const data = await api.semester.getAll();
      setSemesters(data);
    } catch (err) {
      console.error("Failed to load semesters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSemester = async () => {
    if (!newSemesterName.trim()) return;

    try {
      const semester = await api.semester.create(newSemesterName);
      setSemesters([semester, ...semesters]);
      setNewSemesterName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create semester:", err);
    }
  };

  const handleDeleteSemester = async (id: string) => {
    try {
      await api.semester.delete(id);
      setSemesters(semesters.filter((s) => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete semester:", err);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: colors.fg,
        }}
      >
        Loading semesters...
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: colors.fg, margin: 0 }}>My Semesters</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: colors.accent,
            color: colors.bg,
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          <Plus size={18} />
          New Semester
        </button>
      </div>

      {semesters.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: colors.fg,
            opacity: 0.7,
          }}
        >
          <p>No semesters yet. Create one to get started!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {semesters.map((semester) => (
            <div
              key={semester.id}
              style={{
                backgroundColor: colors.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: "0.5rem",
                padding: "1.5rem",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onClick={() => onSelectSemester(semester)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.5rem",
                      color: colors.accent,
                    }}
                  >
                    {semester.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: colors.fg,
                      opacity: 0.6,
                    }}
                  >
                    Created{" "}
                    {new Date(semester.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(semester.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ef4444",
                    padding: 0,
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Semester"
        buttons={[
          {
            label: "Create",
            onClick: handleCreateSemester,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Semester Name
            </p>
            <input
              type="text"
              value={newSemesterName}
              onChange={(e) => setNewSemesterName(e.target.value)}
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
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateSemester();
              }}
            />
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onConfirm={() => {
          if (deletingId) handleDeleteSemester(deletingId);
        }}
        onCancel={() => setDeletingId(null)}
        title="Delete Semester"
        message="This will delete the semester and all associated trackers. This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};
