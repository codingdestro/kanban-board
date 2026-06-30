"use client";

import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useKanbanStore } from "../store/kanbanStore";
import { 
  Columns3, 
  ListTodo, 
  CalendarDays, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  GitBranch, 
  BarChart3,
  Layers
} from "lucide-react";

export default function WorkspaceSidebar() {
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const boards = useKanbanStore((state) => state.boards);
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const currentView = useKanbanStore((state) => state.currentView);
  const setCurrentView = useKanbanStore((state) => state.setCurrentView);
  const activeBoard = boards[activeBoardId];

  // Calculate task counts
  const tasksCount = activeBoard ? Object.keys(activeBoard.tasks).length : 0;
  const inProgressCount = activeBoard 
    ? Object.values(activeBoard.tasks).filter(t => t.status === 'inprogress').length 
    : 0;

  const navItems = [
    { id: "board", name: "Board View", icon: Columns3, badge: undefined },
    { id: "list", name: "List View", icon: ListTodo, badge: tasksCount > 0 ? String(tasksCount) : undefined },
    { id: "analytics", name: "Analytics", icon: BarChart3, badge: undefined },
    { id: "calendar", name: "Calendar", icon: CalendarDays, badge: undefined },
  ] as const;

  return (
    <aside 
      className={`glass-panel border-r border-border h-screen flex flex-col justify-between transition-all duration-300 ease-in-out relative z-30 select-none
        ${isCollapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Top Header */}
      <div>
        <div className={`p-4 flex items-center justify-between border-b border-border min-h-[65px] ${isCollapsed ? "justify-center" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                DevFlow
              </span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 w-6 h-6 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center cursor-pointer transition-colors shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-4">
          {!isCollapsed && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2 block">VIEWS</span>}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === currentView;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer relative
                  ${active 
                    ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-l-2 border-indigo-500" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? "text-indigo-500 dark:text-indigo-400" : ""}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full border border-border">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-border flex flex-col gap-2">
        {/* Sprint active status */}
        {!isCollapsed && activeBoard && (
          <div className="p-3 bg-muted/40 dark:bg-muted/10 rounded-xl border border-border/50 mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Active Sprint</span>
              <span className="text-inprogress flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-inprogress animate-pulse"></span>
                {inProgressCount} items
              </span>
            </div>
            <div className="text-xs font-bold truncate mb-2">{activeBoard.name}</div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ 
                  width: `${tasksCount > 0 
                    ? (activeBoard.columns.done.taskIds.length / tasksCount) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Theme Toggle & Branch details */}
        <div className={`flex items-center ${isCollapsed ? "flex-col gap-3 justify-center" : "justify-between px-1"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 dark:bg-muted/20 px-2.5 py-1 rounded-full border border-border">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>v1.0.0</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted cursor-pointer transition-colors relative"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-in fade-in zoom-in duration-300" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
