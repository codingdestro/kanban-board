"use client";

import React, { useState } from "react";
import { useKanbanStore, MOCK_USERS, MOCK_LABELS } from "../store/kanbanStore";
import { Priority } from "../types/kanban";
import { 
  Search, 
  Plus, 
  RotateCcw, 
  GitPullRequest, 
  Keyboard, 
  ChevronDown, 
  SlidersHorizontal,
  X
} from "lucide-react";

interface WorkspaceHeaderProps {
  onNewTaskClick: () => void;
  onShortcutsClick: () => void;
}

export default function WorkspaceHeader({ onNewTaskClick, onShortcutsClick }: WorkspaceHeaderProps) {
  const { 
    boards, 
    activeBoardId, 
    setActiveBoardId, 
    addBoard,
    searchQuery, 
    setSearchQuery,
    filters,
    toggleFilterPriority,
    toggleFilterAssignee,
    toggleFilterLabel,
    clearFilters
  } = useKanbanStore();

  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  const activeBoard = boards[activeBoardId];
  const activeFiltersCount = 
    filters.priorities.length + 
    filters.assignees.length + 
    filters.labels.length;

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      addBoard(newBoardName.trim());
      setNewBoardName("");
      setShowBoardModal(false);
    }
  };

  const priorityLabels: { [key in Priority]: string } = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const priorityColors: { [key in Priority]: string } = {
    low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Board Selector & Title */}
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button 
            onClick={() => setShowBoardDropdown(!showBoardDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-bold text-sm cursor-pointer transition-colors"
          >
            <span>{activeBoard?.name || "Select Board"}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showBoardDropdown ? "rotate-180" : ""}`} />
          </button>

          {showBoardDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowBoardDropdown(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-xl z-20 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-bold text-muted-foreground tracking-widest px-2.5 py-1.5 uppercase">YOUR BOARDS</div>
                {Object.values(boards).map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      setActiveBoardId(board.id);
                      setShowBoardDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-between
                      ${board.id === activeBoardId 
                        ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold" 
                        : "hover:bg-muted text-foreground"
                      }
                    `}
                  >
                    <span className="truncate">{board.name}</span>
                    {board.id === activeBoardId && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                  </button>
                ))}
                <div className="h-px bg-border my-1.5" />
                <button
                  onClick={() => {
                    setShowBoardModal(true);
                    setShowBoardDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-indigo-500 hover:bg-indigo-500/5 cursor-pointer font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Board
                </button>
              </div>
            </>
          )}
        </div>

        {/* Global Stats or Branch count details */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/60 dark:bg-muted/20 border border-border/80 px-2.5 py-1 rounded-full">
          <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sprint active</span>
        </div>
      </div>

      {/* Search, Filter Tools, Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets (e.g. DEV-101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-input hover:bg-muted/80 focus:bg-background border border-border/60 focus:border-ring rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>

        {/* Filters Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer
              ${activeFiltersCount > 0 
                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" 
                : "border-border/60 hover:bg-muted"
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filters Expanded Menu */}
          {showFiltersMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFiltersMenu(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <span className="font-bold text-sm">Active Filters</span>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Priority Filters */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Priority</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(priorityLabels) as Priority[]).map((p) => {
                      const active = filters.priorities.includes(p);
                      return (
                        <button
                          key={p}
                          onClick={() => toggleFilterPriority(p)}
                          className={`px-2 py-1 rounded text-xs border font-medium cursor-pointer transition-colors
                            ${active 
                              ? "bg-foreground text-background border-foreground" 
                              : priorityColors[p]
                            }
                          `}
                        >
                          {priorityLabels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assignee Filters */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Assignee</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_USERS.map((user) => {
                      const active = filters.assignees.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => toggleFilterAssignee(user.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs cursor-pointer transition-colors
                            ${active 
                              ? "bg-foreground text-background border-foreground font-medium" 
                              : "border-border hover:bg-muted"
                            }
                          `}
                        >
                          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-[8px] font-bold text-white flex items-center justify-center">
                            {user.avatar}
                          </span>
                          <span>{user.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Label Filters */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Labels</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_LABELS.map((lbl) => {
                      const active = filters.labels.includes(lbl.id);
                      return (
                        <button
                          key={lbl.id}
                          onClick={() => toggleFilterLabel(lbl.id)}
                          className={`px-2.5 py-0.5 rounded text-xs border cursor-pointer transition-colors
                            ${active 
                              ? "bg-foreground text-background border-foreground font-semibold" 
                              : `${lbl.color} hover:bg-opacity-35`
                            }
                          `}
                        >
                          {lbl.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onShortcutsClick}
          className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Add Task Button */}
        <button
          onClick={onNewTaskClick}
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Board Creation Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-bold text-base">Create New Board</span>
              <button 
                onClick={() => setShowBoardModal(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBoard} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Board Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Sprint // Developer Ops"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 bg-input focus:bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
