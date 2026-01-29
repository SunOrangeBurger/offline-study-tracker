import React from "react";
import { useTheme } from "./ThemeProvider";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgressIndicator: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
}) => {
  const { colors } = useTheme();
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          marginTop: size / 2 - 20,
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: colors.accent,
          }}
        >
          {Math.round(percentage)}%
        </div>
        <div style={{ fontSize: "0.75rem", color: colors.fg, opacity: 0.7 }}>
          Complete
        </div>
      </div>
    </div>
  );
};
