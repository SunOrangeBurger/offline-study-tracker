import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Topic } from "../types";
import { NeonCheckbox } from "./NeonCheckbox";

interface TopicChecklistProps {
  topics: Topic[];
  onToggle: (topicId: string) => Promise<void>;
  isLoading?: boolean;
}

export const TopicChecklist: React.FC<TopicChecklistProps> = ({
  topics,
  onToggle,
}) => {
  const { colors } = useTheme();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleToggle = async (topicId: string) => {
    setLoadingIds((prev) => new Set(prev).add(topicId));
    try {
      await onToggle(topicId);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {topics.map((topic) => (
        <div
          key={topic.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem",
            backgroundColor: colors.secondary,
            borderRadius: "0.375rem",
            opacity: loadingIds.has(topic.id) ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <NeonCheckbox
            checked={topic.completed}
            onChange={() => handleToggle(topic.id)}
          />
          <span
            style={{
              flex: 1,
              color: topic.completed ? colors.fg + "99" : colors.fg,
              textDecoration: topic.completed ? "line-through" : "none",
              transition: 'all 0.3s ease',
            }}
          >
            {topic.name}
          </span>
        </div>
      ))}
    </div>
  );
};

interface CollapsibleUnitProps {
  unitName: string;
  topics: Topic[];
  onToggleTopic: (topicId: string) => Promise<void>;
  isLoading?: boolean;
}

export const CollapsibleUnit: React.FC<CollapsibleUnitProps> = ({
  unitName,
  topics,
  onToggleTopic,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = topics.filter((t) => t.completed).length;

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "1rem",
          backgroundColor: colors.secondary,
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isOpen ? `1px solid ${colors.border}` : "none",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h3 style={{ margin: 0, color: colors.fg, marginBottom: "0.25rem" }}>
            {unitName}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: colors.fg,
              opacity: 0.7,
            }}
          >
            {completedCount} / {topics.length} topics
          </p>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div style={{ padding: "1rem" }}>
          <TopicChecklist
            topics={topics}
            onToggle={onToggleTopic}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
