import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { AlertCircle } from "lucide-react";

interface PriorityTestData {
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
}

interface PriorityTestBoxProps {
  test: PriorityTestData;
}

export const PriorityTestBox: React.FC<PriorityTestBoxProps> = ({ test }) => {
  const { colors} = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(test.time_remaining);

  useEffect(() => {
    // Update time remaining every minute
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const testTime = test.test.scheduled_date;
      const diff = testTime - now;

      if (diff <= 0) {
        setTimeRemaining("Test has passed");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [test.test.scheduled_date]);

  // Determine urgency color based on days remaining
  const getUrgencyColor = () => {
    if (test.days_remaining <= 1) return "#dc2626"; // Red
    if (test.days_remaining <= 3) return "#ea580c"; // Orange
    if (test.days_remaining<=7) return "#f00687c5";
    return colors.accent; // Normal accent
  };

  const urgencyColor = getUrgencyColor();

  return (
    <div
      style={{
        backgroundColor: colors.secondary,
        border: `2px solid ${urgencyColor}`,
        borderRadius: "0.5rem",
        padding: "1.25rem",
        boxShadow:
          test.days_remaining <= 1
            ? `0 0 10px ${urgencyColor}40`
            : "none",
      }}
    >
      {/* Header with urgency indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "start",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <AlertCircle size={20} color={urgencyColor} style={{ marginTop: "2px", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              color: colors.fg,
              fontSize: "1.125rem",
              fontWeight: 600,
            }}
          >
            {test.test.name}
          </h4>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.875rem",
              color: colors.fg,
              opacity: 0.7,
            }}
          >
            {test.test.test_type}
          </p>
        </div>
      </div>

      {/* Countdown Timer */}
      <div
        style={{
          backgroundColor: urgencyColor + "20",
          borderRadius: "0.375rem",
          padding: "0.75rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: urgencyColor,
          }}
        >
          {timeRemaining}
        </p>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.75rem",
            color: colors.fg,
            opacity: 0.6,
          }}
        >
          Time remaining (Exam at 8:00 PM)
        </p>
      </div>

      {/* Test Date */}
      <p
        style={{
          margin: "0 0 0.75rem 0",
          fontSize: "0.875rem",
          color: colors.fg,
          opacity: 0.7,
        }}
      >
        📅 {new Date(test.test.scheduled_date).toLocaleDateString()} @
        8:00 PM
      </p>

      {/* Covered Topics */}
      {test.covered_topics.length > 0 && (
        <div style={{ marginBottom: "0rem" }}>
          <p
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: colors.fg,
            }}
          >
            Topics Covered:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {test.covered_topics.map((topic) => (
              <span
                key={topic}
                style={{
                  backgroundColor: colors.accent + "20",
                  color: colors.accent,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
