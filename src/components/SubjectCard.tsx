import React from "react";
import { useTheme } from "./ThemeProvider";
import { Edit2, Trash2 } from "lucide-react";

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
  };
  totalTopics: number;
  completedTopics: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  totalTopics,
  completedTopics,
  onClick,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const percentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.secondary,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        borderRadius: "0.75rem",
        padding: "1.5rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${colors.accent}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.accent,
                padding: "0.25rem",
              }}
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
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
          )}
        </div>
      )}

      {/* Subject Name */}
      <h3
        style={{
          margin: "0 0 1rem 0",
          color: colors.accent,
          fontSize: "1.25rem",
          fontWeight: 600,
          paddingRight: onEdit || onDelete ? "3rem" : "0",
        }}
      >
        {subject.name}
      </h3>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: colors.border,
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: colors.accent,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: colors.fg,
            opacity: 0.7,
          }}
        >
          {completedTopics} / {totalTopics} topics
        </span>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: colors.accent,
          }}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};
