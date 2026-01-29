import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { SyllabusBuilder } from "./SyllabusBuilder";
import { Palette, BookOpen, FileText } from "lucide-react";

interface TrackerCreationFormProps {
  onCreateTracker: (data: {
    name: string;
    description: string;
    color: string;
    syllabus: string;
  }) => void;
  onCancel: () => void;
  isCreating: boolean;
  error: string;
}

const TRACKER_COLORS = [
  { name: "Blue", value: "#3b82f6", bg: "#eff6ff" },
  { name: "Green", value: "#10b981", bg: "#ecfdf5" },
  { name: "Purple", value: "#8b5cf6", bg: "#f3e8ff" },
  { name: "Red", value: "#ef4444", bg: "#fef2f2" },
  { name: "Orange", value: "#f59e0b", bg: "#fffbeb" },
  { name: "Pink", value: "#ec4899", bg: "#fdf2f8" },
  { name: "Indigo", value: "#6366f1", bg: "#eef2ff" },
  { name: "Teal", value: "#14b8a6", bg: "#f0fdfa" },
];

export const TrackerCreationForm: React.FC<TrackerCreationFormProps> = ({
  onCreateTracker,
  onCancel,
  isCreating,
  error,
}) => {
  const { colors } = useTheme();
  const [trackerName, setTrackerName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(TRACKER_COLORS[0].value);
  const [syllabus, setSyllabus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = () => {
    if (!trackerName.trim()) {
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    onCreateTracker({
      name: trackerName,
      description: description,
      color: selectedColor,
      syllabus: syllabus,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return trackerName.trim().length > 0;
      case 2:
        return true; // Description and color are optional
      case 3:
        return syllabus.trim().length > 0;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Customization";
      case 3:
        return "Syllabus Setup";
      default:
        return "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Progress Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                backgroundColor: step <= currentStep ? colors.accent : colors.secondary,
                color: step <= currentStep ? colors.bg : colors.fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  backgroundColor: step < currentStep ? colors.accent : colors.border,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {currentStep === 1 && <BookOpen size={20} color={colors.accent} />}
        {currentStep === 2 && <Palette size={20} color={colors.accent} />}
        {currentStep === 3 && <FileText size={20} color={colors.accent} />}
        <h3 style={{ margin: 0, color: colors.fg }}>{getStepTitle()}</h3>
      </div>

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

      {/* Step Content */}
      {currentStep === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Tracker Name <span style={{ color: "#ef4444" }}>*</span>
            </p>
            <input
              type="text"
              value={trackerName}
              onChange={(e) => setTrackerName(e.target.value)}
              placeholder=""
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${colors.border}`,
                borderRadius: "0.375rem",
                backgroundColor: colors.secondary,
                color: colors.fg,
                boxSizing: "border-box",
                fontSize: "1rem",
              }}
              autoFocus
            />
          </label>

          <div style={{ padding: "1rem", backgroundColor: colors.hover, borderRadius: "0.375rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: colors.fg, opacity: 0.8 }}>
              Choose a descriptive name that helps you identify this study tracker easily. 
              You can include the course name, semester, or academic year.
            </p>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <label>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Description (Optional)
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${colors.border}`,
                borderRadius: "0.375rem",
                backgroundColor: colors.secondary,
                color: colors.fg,
                boxSizing: "border-box",
                minHeight: "80px",
                resize: "vertical",
              }}
            />
          </label>

          <div>
            <p style={{ margin: "0 0 0.75rem 0", fontWeight: 500 }}>
              Choose a Color Theme
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {TRACKER_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setSelectedColor(colorOption.value)}
                  style={{
                    padding: "0.75rem",
                    border: selectedColor === colorOption.value 
                      ? `2px solid ${colorOption.value}` 
                      : `1px solid ${colors.border}`,
                    borderRadius: "0.5rem",
                    backgroundColor: colorOption.bg,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      backgroundColor: colorOption.value,
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: colors.fg }}>
                    {colorOption.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
              Build Your Syllabus <span style={{ color: "#ef4444" }}>*</span>
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: colors.fg, opacity: 0.7 }}>
              Add your subjects, units, and topics. You can use the visual builder or text editor.
            </p>
          </div>
          
          <SyllabusBuilder
            onSyllabusChange={setSyllabus}
            initialSyllabus={syllabus}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: colors.secondary,
                color: colors.fg,
                border: `1px solid ${colors.border}`,
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
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
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canProceed() || isCreating}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: canProceed() ? colors.accent : colors.border,
            color: canProceed() ? colors.bg : colors.fg,
            border: "none",
            borderRadius: "0.375rem",
            cursor: canProceed() && !isCreating ? "pointer" : "not-allowed",
            opacity: !canProceed() || isCreating ? 0.6 : 1,
            fontWeight: 500,
          }}
        >
          {isCreating 
            ? "Creating..." 
            : currentStep === 3 
              ? "Create Tracker" 
              : "Next"
          }
        </button>
      </div>
    </div>
  );
};