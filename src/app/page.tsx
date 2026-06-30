"use client";

import React, { useEffect, useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import WorkspaceHeader from "../components/WorkspaceHeader";
import Board from "../components/Board";
import ListView from "../components/ListView";
import AnalyticsView from "../components/AnalyticsView";
import CalendarView from "../components/CalendarView";
import TaskDetailModal from "../components/TaskDetailModal";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";

export default function Home() {
  const { hydrateStore, isHydrated, currentView } = useKanbanStore();
  
  // Modals visibility states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Trigger state hydration from localStorage
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // Bind keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // ESC: Close open modals
      if (e.key === "Escape") {
        setSelectedTaskId(null);
        setShowNewTaskModal(false);
        setShowShortcuts(false);
        if (activeEl instanceof HTMLElement) activeEl.blur();
        return;
      }

      // If typing in forms/inputs, ignore other shortcut bindings
      if (isInputFocused) return;

      // N: Open new task modal
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setShowNewTaskModal(true);
        setSelectedTaskId(null);
      }

      // /: Focus search input
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search tickets"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // ?: Toggle keyboard shortcuts guide
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-400">LOADING WORKSPACE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Navigation Sidebar */}
      <WorkspaceSidebar />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Workspace Top Header Bar */}
        <WorkspaceHeader 
          onNewTaskClick={() => setShowNewTaskModal(true)}
          onShortcutsClick={() => setShowShortcuts(true)}
        />

        {/* Conditionally Render Selected View */}
        {currentView === "board" && (
          <Board 
            onTaskClick={(taskId) => {
              setSelectedTaskId(taskId);
              setShowNewTaskModal(false);
            }} 
          />
        )}
        {currentView === "list" && (
          <ListView 
            onTaskClick={(taskId) => {
              setSelectedTaskId(taskId);
              setShowNewTaskModal(false);
            }} 
          />
        )}
        {currentView === "analytics" && (
          <AnalyticsView />
        )}
        {currentView === "calendar" && (
          <CalendarView 
            onTaskClick={(taskId) => {
              setSelectedTaskId(taskId);
              setShowNewTaskModal(false);
            }} 
          />
        )}
      </main>

      {/* Slide-over or Center Overlay modals */}
      {selectedTaskId && (
        <TaskDetailModal 
          key={selectedTaskId}
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}

      {showNewTaskModal && (
        <TaskDetailModal 
          key="new"
          taskId={null} 
          onClose={() => setShowNewTaskModal(false)} 
        />
      )}

      {showShortcuts && (
        <KeyboardShortcutsModal 
          onClose={() => setShowShortcuts(false)} 
        />
      )}
    </div>
  );
}
