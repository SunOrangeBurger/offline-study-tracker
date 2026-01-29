import React, { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeProvider";
import { api, TrackerDataResponse } from "../api/client";
import { Tracker } from "../types";
import { ArrowLeft, Plus } from "lucide-react";
import { CircularProgressIndicator } from "../components/CircularProgressIndicator";
import { Modal, ConfirmDialog } from "../components/Modal";
import { TestScheduleForm } from "../components/TestScheduleForm";
import { PriorityTestBox } from "../components/PriorityTestBox";
import { SubjectCard } from "../components/SubjectCard";
import { SubjectView } from "./SubjectView";

interface TrackerDashboardProps {
  tracker: Tracker;
  onBack: () => void;
}

export const TrackerDashboard: React.FC<TrackerDashboardProps> = ({
  tracker,
  onBack,
}) => {
  const { colors } = useTheme();
  const [data, setData] = useState<TrackerDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subjects" | "tests">("subjects");
  const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string } | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  useEffect(() => {
    loadTrackerData();
  }, [tracker.id, refreshKey]);

  const loadTrackerData = async () => {
    try {
      setIsLoading(true);
      const trackerData = await api.tracker.getData(tracker.id);
      setData(trackerData);
    } catch (err) {
      console.error("Failed to load tracker data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    try {
      await api.topic.toggle(topicId);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to toggle topic:", err);
    }
  };

  const handleTestScheduled = () => {
    setIsScheduleTestOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await api.subject.create(tracker.id, newSubjectName);
      setNewSubjectName("");
      setIsAddSubjectOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to add subject:", err);
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !editingSubject.name.trim()) return;
    try {
      await api.subject.update(editingSubject.id, editingSubject.name);
      setEditingSubject(null);
      setIsEditSubjectOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to edit subject:", err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await api.subject.delete(subjectId);
      setDeletingSubjectId(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  const handleUpdateTopic = async (topicId: string, newName: string) => {
    try {
      await api.topic.update(topicId, newName);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to update topic:", err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await api.topic.delete(topicId);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  const handleAddTopic = async (unitId: string, topicName: string) => {
    try {
      await api.topic.create(unitId, topicName);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to add topic:", err);
    }
  };

  const selectedSubjectData = selectedSubject
    ? data?.subjects.find((s) => s.subject.id === selectedSubject)
    : null;

  if (selectedSubjectData) {
    return (
      <SubjectView
        subjectData={selectedSubjectData}
        onBack={() => setSelectedSubject(null)}
        onToggleTopic={handleToggleTopic}
        onUpdateTopic={handleUpdateTopic}
        onDeleteTopic={handleDeleteTopic}
        onAddTopic={handleAddTopic}
      />
    );
  }

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
        Loading tracker...
      </div>
    );
  }

  if (!data) {
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
        Failed to load tracker data
      </div>
    );
  }

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
        <h1 style={{ color: colors.fg, margin: 0 }}>{tracker.name}</h1>
      </div>

      {/* Progress and Priority Tests Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Circular Progress */}
        <div
          style={{
            backgroundColor: colors.secondary,
            borderRadius: "0.5rem",
            border: `1px solid ${colors.border}`,
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgressIndicator
            percentage={data.progress.percentage}
            size={150}
            strokeWidth={10}
          />
        </div>

        {/* Priority Tests */}
        <div>
          <h3 style={{ margin: "0 0 1rem 0", color: colors.fg }}>
            🔥 Upcoming Tests (Next 7 Days)
          </h3>
          {data.priority_tests.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.secondary,
                borderRadius: "0.5rem",
                padding: "2rem",
                textAlign: "center",
                color: colors.fg,
                opacity: 0.7,
              }}
            >
              No tests scheduled in the next 7 days
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.priority_tests.map((ptest) => (
                <PriorityTestBox key={ptest.test.id} test={ptest} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0rem",
          marginBottom: "2rem",
          borderBottom: `2px solid ${colors.border}`,
        }}
      >
        {["subjects", "tests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: activeTab === tab ? colors.accent : "transparent",
              color: activeTab === tab ? colors.bg : colors.fg,
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "1rem",
              borderBottom:
                activeTab === tab ? `3px solid ${colors.accent}` : "none",
              transition: "all 0.2s",
            }}
          >
            {tab === "subjects" ? "Subjects" : "All Tests"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "subjects" ? (
        <div>
          {/* Add Subject Button */}
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
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
              Add Subject
            </button>
          </div>

          {/* Subject Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {data.subjects.map((subjectData) => {
              const totalTopics = subjectData.units.reduce(
                (sum, u) => sum + u.topics.length,
                0
              );
              const completedTopics = subjectData.units.reduce(
                (sum, u) => sum + u.topics.filter((t) => t.completed).length,
                0
              );

              return (
                <SubjectCard
                  key={subjectData.subject.id}
                  subject={subjectData.subject}
                  totalTopics={totalTopics}
                  completedTopics={completedTopics}
                  onClick={() => setSelectedSubject(subjectData.subject.id)}
                  onEdit={() => {
                    setEditingSubject({
                      id: subjectData.subject.id,
                      name: subjectData.subject.name,
                    });
                    setIsEditSubjectOpen(true);
                  }}
                  onDelete={() => setDeletingSubjectId(subjectData.subject.id)}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={() => setIsScheduleTestOpen(true)}
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
              Schedule Test
            </button>
          </div>

          {data.all_tests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: colors.fg,
                opacity: 0.7,
                backgroundColor: colors.secondary,
                borderRadius: "0.5rem",
              }}
            >
              No tests scheduled yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {data.all_tests.map((test) => (
                <div
                  key={test.id}
                  style={{
                    backgroundColor: colors.secondary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "0.5rem",
                    padding: "1.5rem",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", color: colors.accent }}>
                    {test.name}
                  </h4>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.875rem",
                      color: colors.fg,
                      opacity: 0.7,
                    }}
                  >
                    Type: {test.test_type}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontSize: "0.875rem",
                      color: colors.fg,
                      opacity: 0.7,
                    }}
                  >
                    Date: {new Date(test.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Test Modal */}
      <Modal
        isOpen={isScheduleTestOpen}
        onClose={() => setIsScheduleTestOpen(false)}
        title="Schedule New Test"
      >
        <TestScheduleForm
          tracker={tracker}
          subjects={data.subjects}
          onTestScheduled={handleTestScheduled}
          onCancel={() => setIsScheduleTestOpen(false)}
        />
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectOpen}
        onClose={() => {
          setIsAddSubjectOpen(false);
          setNewSubjectName("");
        }}
        title="Add New Subject"
        buttons={[
          {
            label: "Add",
            onClick: handleAddSubject,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Subject Name
            </p>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
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
                if (e.key === "Enter") handleAddSubject();
              }}
            />
          </label>
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={isEditSubjectOpen}
        onClose={() => {
          setIsEditSubjectOpen(false);
          setEditingSubject(null);
        }}
        title="Edit Subject"
        buttons={[
          {
            label: "Save",
            onClick: handleEditSubject,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Subject Name
            </p>
            <input
              type="text"
              value={editingSubject?.name || ""}
              onChange={(e) =>
                setEditingSubject(
                  editingSubject
                    ? { ...editingSubject, name: e.target.value }
                    : null
                )
              }
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
                if (e.key === "Enter") handleEditSubject();
              }}
            />
          </label>
        </div>
      </Modal>

      {/* Delete Subject Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSubjectId}
        onConfirm={() => {
          if (deletingSubjectId) handleDeleteSubject(deletingSubjectId);
        }}
        onCancel={() => setDeletingSubjectId(null)}
        title="Delete Subject"
        message="This will delete the subject and all its units and topics. This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};
