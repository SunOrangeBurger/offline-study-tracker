import React from "react";
import { useTheme } from "./ThemeProvider";
import { ThemeSwitch } from "./ThemeSwitch";

interface HeaderProps {
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  const { colors } = useTheme();

  return (
    <header
      style={{
        backgroundColor: colors.secondary + 'cc',
        borderBottom: `1px solid ${colors.border}`,
        padding: "1.25rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h1 
        onClick={onNavigateHome}
        style={{ 
          color: colors.accent, 
          margin: 0, 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          letterSpacing: "-0.03em",
          cursor: onNavigateHome ? "pointer" : "default",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (onNavigateHome) {
            e.currentTarget.style.opacity = "0.8";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (onNavigateHome) {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        StudyApp
      </h1>
      <ThemeSwitch />
    </header>
  );
};
