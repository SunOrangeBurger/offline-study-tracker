import React, { ReactNode } from "react";
import { useThemeStore } from "../stores/themeStore";

const themes = {
  light: {
    bg: "#FFFFFF",          // Clean white – max clarity
    fg: "#0F172A",          // Deep Midnight – high readability
    accent: "#2563EB",      // Boosted Ocean Blue – primary CTA
    accentAlt: "#7C3AED",   // Saturated Lavender – secondary actions
    border: "#0F172A1A",    // Neutral structure
    secondary: "#F8FAFC",   // Elevated surfaces
    hover: "#2563EB1F",     // Clear, visible hover
  },

  dark: {
    bg: "#020617",          // Near-black Midnight – makes accents pop
    fg: "#E5E7EB",          // Soft white, not harsh
    accent: "#ED254E",      // Red Crayola – bold, unmistakable CTA
    accentAlt: "#8B5CF6",   // Electric Lavender – controlled vibrance
    border: "#1E293B",      // Gunmetal-leaning structure
    secondary: "#020617",   // Flat, modern panels
    hover: "#ED254E40",     // Confident hover, no muddiness
  },
};


interface ThemeContextType {
  theme: keyof typeof themes;
  colors: (typeof themes)[keyof typeof themes];
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { theme, toggleTheme } = useThemeStore();

  const value: ThemeContextType = {
    theme: theme as keyof typeof themes,
    colors: themes[theme as keyof typeof themes],
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
