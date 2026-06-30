"use client";

import React, { useEffect } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceHeader from "./WorkspaceHeader";
import TaskDetailModal from "./TaskDetailModal";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { 
    hydrateStore, 
    isHydrated, 
    activeTaskId, 
    setActiveTaskId, 
    isNewTaskOpen, 
    setIsNewTaskOpen, 
    isShortcutsOpen, 
    setIsShortcutsOpen 
  } = useKanbanStore();

  // Hydrate store on mount
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // Global keyboard shortcuts listener
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
        setActiveTaskId(null);
        setIsNewTaskOpen(false);
        setIsShortcutsOpen(false);
        if (activeEl instanceof HTMLElement) activeEl.blur();
        return;
      }

      // If typing in forms/inputs, ignore shortcuts
      if (isInputFocused) return;

      // N: Open new task modal
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsNewTaskOpen(true);
        setActiveTaskId(null);
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
        setIsShortcutsOpen(!isShortcutsOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShortcutsOpen, setActiveTaskId, setIsNewTaskOpen, setIsShortcutsOpen]);

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
        <WorkspaceHeader />

        {/* Dynamic Page Views */}
        {children}
      </main>

      {/* Global Overlays */}
      {activeTaskId && (
        <TaskDetailModal 
          key={activeTaskId}
          taskId={activeTaskId} 
          onClose={() => setActiveTaskId(null)} 
        />
      )}

      {isNewTaskOpen && (
        <TaskDetailModal 
          key="new"
          taskId={null} 
          onClose={() => setIsNewTaskOpen(false)} 
        />
      )}

      {isShortcutsOpen && (
        <KeyboardShortcutsModal 
          onClose={() => setIsShortcutsOpen(false)} 
        />
      )}
    </div>
  );
}
