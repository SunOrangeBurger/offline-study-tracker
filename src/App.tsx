import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { SemesterList } from "./views/SemesterList";
import { TrackerList } from "./views/TrackerList";
import { TrackerDashboard } from "./views/TrackerDashboard";
import { Semester, Tracker } from "./types";
import { api } from "./api/client";
import { useThemeStore } from "./stores/themeStore";
import "./App.css";

function AppContent() {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<
    "semesters" | "trackers" | "dashboard"
  >("semesters");
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const initTheme = async () => {
      try {
        const theme = await api.theme.get();
        useThemeStore.getState().setTheme(theme as "light" | "dark");
      } catch (err) {
        console.error("Failed to load theme:", err);
        // Default to light theme if loading fails
        useThemeStore.getState().setTheme("light");
      }
    };
    initTheme();
  }, []);

  const handleSelectSemester = (semester: Semester) => {
    setSelectedSemester(semester);
    setCurrentView("trackers");
  };

  const handleSelectTracker = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setCurrentView("dashboard");
  };

  const handleBackToTrackers = () => {
    setCurrentView("trackers");
  };

  const handleBackToSemesters = () => {
    setCurrentView("semesters");
    setSelectedSemester(null);
    setSelectedTracker(null);
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.fg, minHeight: "100vh" }}>
      <Header onNavigateHome={handleBackToSemesters} />
      {currentView === "semesters" && (
        <SemesterList onSelectSemester={handleSelectSemester} />
      )}
      {currentView === "trackers" && selectedSemester && (
        <TrackerList
          semester={selectedSemester}
          onSelectTracker={handleSelectTracker}
          onBack={handleBackToSemesters}
        />
      )}
      {currentView === "dashboard" && selectedTracker && (
        <TrackerDashboard
          tracker={selectedTracker}
          onBack={handleBackToTrackers}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
