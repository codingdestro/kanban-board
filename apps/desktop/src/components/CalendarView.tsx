"use client";

import React, { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { Priority } from "@kanban/types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon
} from "lucide-react";

interface CalendarViewProps {
  onTaskClick: (taskId: string) => void;
  onNewTaskWithDateClick?: (dateString: string) => void; // Optional extension
}

export default function CalendarView({ onTaskClick, onNewTaskWithDateClick }: CalendarViewProps) {
  const { boards, activeBoardId, searchQuery, filters } = useKanbanStore();
  const activeBoard = boards[activeBoardId];

  // Current Month/Year states
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed

  if (!activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 select-none">
        <span className="text-sm text-muted-foreground">Select or create a workspace board.</span>
      </div>
    );
  }

  // Filter Tasks Helper
  const searchLower = searchQuery.toLowerCase();
  const filteredTasks = Object.values(activeBoard.tasks).filter((task) => {
    if (!task.dueDate) return false;

    if (searchQuery) {
      const matchSearch =
        task.id.toLowerCase().includes(searchLower) ||
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower);
      if (!matchSearch) return false;
    }

    if (filters.priorities.length > 0) {
      if (!filters.priorities.includes(task.priority)) return false;
    }

    if (filters.assignees.length > 0) {
      const hasAssignee = task.assignees.some((u) => filters.assignees.includes(u.id));
      if (!hasAssignee) return false;
    }

    if (filters.labels.length > 0) {
      const hasLabel = task.labels.some((l) => filters.labels.includes(l.id));
      if (!hasLabel) return false;
    }

    return true;
  });

  // Calendar calculations
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Total days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // First day of current month index (0: Sunday, 1: Monday, etc.)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Total days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  // Generate cells data
  const cells: Array<{
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    dateString: string;
  }> = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({
      day,
      month: m,
      year: y,
      isCurrentMonth: false,
      dateString: `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }

  // 2. Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
    });
  }

  // 3. Next month leading days (to fill 42 cells grid = 6 rows)
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({
      day: i,
      month: m,
      year: y,
      isCurrentMonth: false,
      dateString: `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
    });
  }

  const priorityDotColors: { [key in Priority]: string } = {
    low: "bg-slate-400",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  const isTodayString = (dateString: string) => {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return dateString === todayStr;
  };

  return (
    <div className="flex-1 p-6 flex flex-col h-[calc(100vh-65px)] overflow-hidden select-none">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full space-y-4">
        
        {/* Calendar Header with Controllers */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base md:text-lg text-foreground tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            >
              Today
            </button>
            <div className="flex items-center border border-border/60 bg-muted/30 rounded-lg overflow-hidden">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground border-r border-border/40 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 min-h-[350px] flex flex-col glass-panel border border-border/60 rounded-2xl overflow-hidden shadow-sm">
          {/* Weekday headers row */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20 text-center py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-widest flex-shrink-0">
            {weekdayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Date cells grid */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-border/30 bg-background/50">
            {cells.map((cell, idx) => {
              const cellTasks = filteredTasks.filter((t) => t.dueDate === cell.dateString);
              const isToday = isTodayString(cell.dateString);

              return (
                <div
                  key={idx}
                  className={`min-h-[60px] p-2 flex flex-col justify-between hover:bg-muted/20 dark:hover:bg-muted/5 transition-colors group relative
                    ${cell.isCurrentMonth ? "bg-background/20" : "bg-muted/30 dark:bg-muted/5 opacity-55"}
                    ${isToday ? "ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 bg-indigo-500/5" : ""}
                  `}
                >
                  {/* Cell Header: date label & inline quick add */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className={`text-xs font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center
                        ${isToday ? "bg-indigo-600 text-white shadow" : "text-muted-foreground"}
                      `}
                    >
                      {cell.day}
                    </span>

                    {/* Quick add trigger button */}
                    {onNewTaskWithDateClick && (
                      <button
                        onClick={() => onNewTaskWithDateClick(cell.dateString)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Add ticket for this date"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Cell Tasks List (collapsible vertically on small cells) */}
                  <div className="flex-1 overflow-y-auto space-y-1 max-h-[70px] scrollbar-none pr-1">
                    {cellTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task.id)}
                        className={`w-full text-left px-1.5 py-0.5 rounded border border-border/40 text-[9px] font-semibold truncate flex items-center gap-1 hover:border-indigo-500/40 cursor-pointer transition-colors bg-card
                          ${task.status === "done" ? "opacity-60 line-through" : ""}
                        `}
                        title={`[${task.id}] ${task.title}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDotColors[task.priority]}`} />
                        <span className="truncate text-foreground font-mono">{task.id}</span>
                        <span className="truncate text-muted-foreground">{task.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
