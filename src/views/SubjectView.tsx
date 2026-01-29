import React, { useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import { ArrowLeft, Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { CircularProgressIndicator } from "../components/CircularProgressIndicator";
import { NeonCheckbox } from "../components/NeonCheckbox";
import { Modal, ConfirmDialog } from "../components/Modal";

interface SubjectViewProps {
  subjectData: {
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
  };
  onBack: () => void;
  onToggleTopic: (topicId: string) => Promise<void>;
  onUpdateTopic?: (topicId: string, newName: string) => Promise<void>;
  onDeleteTopic?: (topicId: string) => Promise<void>;
  onAddTopic?: (unitId: string, topicName: string) => Promise<void>;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subjectData,
  onBack,
  onToggleTopic,
  onUpdateTopic,
  onDeleteTopic,
  onAddTopic,
}) => {
  const { colors } = useTheme();
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [addingToUnitId, setAddingToUnitId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set(subjectData.units.map(u => u.unit.id))
  );

  const handleToggleUnit = (unitId: string) => {
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

  const handleStartEdit = (topicId: string, currentName: string) => {
    setEditingTopicId(topicId);
    setEditingTopicName(currentName);
  };

  const handleSaveEdit = async () => {
    if (editingTopicId && editingTopicName.trim() && onUpdateTopic) {
      await onUpdateTopic(editingTopicId, editingTopicName);
      setEditingTopicId(null);
      setEditingTopicName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTopicId(null);
    setEditingTopicName("");
  };

  const handleAddTopic = async () => {
    if (addingToUnitId && newTopicName.trim() && onAddTopic) {
      await onAddTopic(addingToUnitId, newTopicName);
      setAddingToUnitId(null);
      setNewTopicName("");
    }
  };

  const handleDeleteTopic = async () => {
    if (deletingTopicId && onDeleteTopic) {
      await onDeleteTopic(deletingTopicId);
      setDeletingTopicId(null);
    }
  };

  // Calculate progress
  const totalTopics = subjectData.units.reduce(
    (sum, u) => sum + u.topics.length,
    0
  );
  const completedTopics = subjectData.units.reduce(
    (sum, u) => sum + u.topics.filter((t) => t.completed).length,
    0
  );
  const percentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

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
        <h1 style={{ color: colors.fg, margin: 0 }}>
          {subjectData.subject.name}
        </h1>
      </div>

      {/* Progress Section */}
      <div
        style={{
          backgroundColor: colors.secondary,
          borderRadius: "0.5rem",
          border: `1px solid ${colors.border}`,
          padding: "2rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgressIndicator
          percentage={percentage}
          size={150}
          strokeWidth={10}
        />
      </div>

      {/* Units */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {subjectData.units.map((unitData) => {
          const completedCount = unitData.topics.filter((t) => t.completed).length;
          
          return (
            <div
              key={unitData.unit.id}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: "0.5rem",
                overflow: "hidden",
                backgroundColor: colors.secondary,
              }}
            >
              {/* Unit Header */}
              <button
                onClick={() => handleToggleUnit(unitData.unit.id)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  backgroundColor: colors.secondary,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: expandedUnits.has(unitData.unit.id) 
                    ? `1px solid ${colors.border}` 
                    : "none",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ margin: 0, color: colors.fg, marginBottom: "0.25rem" }}>
                    {unitData.unit.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: colors.fg,
                      opacity: 0.7,
                    }}
                  >
                    {completedCount} / {unitData.topics.length} topics
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {onAddTopic && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingToUnitId(unitData.unit.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: colors.accent,
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                  <span style={{ color: colors.fg }}>
                    {expandedUnits.has(unitData.unit.id) ? "▼" : "▶"}
                  </span>
                </div>
              </button>

              {/* Topics */}
              {expandedUnits.has(unitData.unit.id) && (
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {unitData.topics.map((topic) => (
                      <div
                        key={topic.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          backgroundColor: colors.bg,
                          borderRadius: "0.375rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {editingTopicId === topic.id ? (
                          <>
                            <input
                              type="text"
                              value={editingTopicName}
                              onChange={(e) => setEditingTopicName(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "0.5rem",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "0.375rem",
                                backgroundColor: colors.secondary,
                                color: colors.fg,
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") handleSaveEdit();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: colors.accent,
                                padding: "0.25rem",
                              }}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                padding: "0.25rem",
                              }}
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                              <NeonCheckbox
                                checked={topic.completed}
                                onChange={() => onToggleTopic(topic.id)}
                                label={topic.name}
                              />
                            </div>
                            {onUpdateTopic && (
                              <button
                                onClick={() => handleStartEdit(topic.id, topic.name)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: colors.accent,
                                  padding: "0.25rem",
                                  flexShrink: 0,
                                }}
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {onDeleteTopic && (
                              <button
                                onClick={() => setDeletingTopicId(topic.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#ef4444",
                                  padding: "0.25rem",
                                  flexShrink: 0,
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Topic Modal */}
      <Modal
        isOpen={!!addingToUnitId}
        onClose={() => {
          setAddingToUnitId(null);
          setNewTopicName("");
        }}
        title="Add New Topic"
        buttons={[
          {
            label: "Add",
            onClick: handleAddTopic,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Topic Name
            </p>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
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
                if (e.key === "Enter") handleAddTopic();
              }}
            />
          </label>
        </div>
      </Modal>

      {/* Delete Topic Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTopicId}
        onConfirm={handleDeleteTopic}
        onCancel={() => setDeletingTopicId(null)}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};
