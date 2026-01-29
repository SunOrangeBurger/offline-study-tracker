import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { AlertCircle, X } from "lucide-react";

interface Button {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "danger";
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: Button[];
  danger?: boolean;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  buttons = [],
  maxWidth = "32rem",
}) => {
  const { colors } = useTheme();
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        animation: isClosing ? "fadeOut 0.2s ease-out" : "fadeIn 0.2s ease-in",
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          backgroundColor: colors.secondary,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxWidth: maxWidth,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <h2 style={{ margin: 0, color: colors.fg }}>{title}</h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.fg,
              opacity: 0.7,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem", color: colors.fg }}>
          {children}
        </div>

        {/* Footer */}
        {buttons.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              borderTop: `1px solid ${colors.border}`,
              backgroundColor: colors.secondary,
            }}
          >
            <button
              onClick={handleClose}
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
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    btn.variant === "danger"
                      ? "#ef4444"
                      : btn.variant === "secondary"
                        ? colors.secondary
                        : colors.accent,
                  color:
                    btn.variant === "secondary"
                      ? colors.fg
                      : colors.bg,
                  border:
                    btn.variant === "secondary"
                      ? `1px solid ${colors.border}`
                      : "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  isDangerous = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      danger={isDangerous}
      buttons={[
        {
          label: confirmText,
          onClick: onConfirm,
          variant: isDangerous ? "danger" : "primary",
        },
      ]}
    >
      {isDangerous && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            borderRadius: "0.375rem",
          }}
        >
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ color: "#991b1b" }}>
            This action cannot be undone
          </span>
        </div>
      )}
      <p>{message}</p>
    </Modal>
  );
};
