"use client";

import React, { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { Task, Priority } from "../types/kanban";
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Calendar, 
  GitBranch, 
  Link2,
  CheckSquare
} from "lucide-react";

interface ListViewProps {
  onTaskClick: (taskId: string) => void;
}

export default function ListView({ onTaskClick }: ListViewProps) {
  const { boards, activeBoardId, searchQuery, filters } = useKanbanStore();
  const activeBoard = boards[activeBoardId];

  // Track collapsed state of each status group
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    backlog: false,
    todo: false,
    inprogress: false,
    review: false,
    done: false,
  });

  const toggleGroup = (statusId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }));
  };

  if (!activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 select-none">
        <span className="text-sm text-muted-foreground">Select or create a workspace board.</span>
      </div>
    );
  }

  // Filter Tasks Helper
  const searchLower = searchQuery.toLowerCase();
  const filterTask = (task: Task) => {
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
  };

  const priorityColors: { [key in Priority]: string } = {
    low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const priorityLabels: { [key in Priority]: string } = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const statusColors: { [key: string]: { headerBg: string; dot: string; text: string } } = {
    backlog: { headerBg: "bg-slate-500/5 hover:bg-slate-500/10", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
    todo: { headerBg: "bg-blue-500/5 hover:bg-blue-500/10", dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    inprogress: { headerBg: "bg-purple-500/5 hover:bg-purple-500/10", dot: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    review: { headerBg: "bg-amber-500/5 hover:bg-amber-500/10", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    done: { headerBg: "bg-emerald-500/5 hover:bg-emerald-500/10", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-65px)] scrollbar-thin">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Table Columns Descriptor Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 select-none">
          <div className="col-span-2">Ticket ID</div>
          <div className="col-span-5">Summary</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1 text-right">Assignees</div>
        </div>

        {/* Status groups loops */}
        {activeBoard.columnOrder.map((colId) => {
          const column = activeBoard.columns[colId];
          const colTasks = column.taskIds
            .map((id) => activeBoard.tasks[id])
            .filter(Boolean)
            .filter(filterTask);

          const isCollapsed = collapsedGroups[colId];
          const groupStyles = statusColors[colId] || statusColors.backlog;

          return (
            <div key={column.id} className="glass-panel border border-border/60 rounded-xl overflow-hidden shadow-sm">
              {/* Collapsible Section Header */}
              <button
                onClick={() => toggleGroup(column.id)}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold select-none border-b border-border/20 transition-colors cursor-pointer ${groupStyles.headerBg}`}
              >
                <div className="flex items-center gap-2.5">
                  {isCollapsed ? (
                    <ChevronRight className="w-4.5 h-4.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-muted-foreground" />
                  )}
                  <span className={`w-2 h-2 rounded-full ${groupStyles.dot}`} />
                  <span className={`font-bold tracking-wide uppercase text-xs ${groupStyles.text}`}>
                    {column.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-background dark:bg-muted/80 text-muted-foreground border border-border/40 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
              </button>

              {/* Rows List Container */}
              {!isCollapsed && (
                <div className="divide-y divide-border/30">
                  {colTasks.map((task) => {
                    const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task.id)}
                        className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 px-6 py-3.5 hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors cursor-pointer group text-sm select-none"
                      >
                        {/* ID */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                            {task.id}
                          </span>
                          {task.gitBranch && (
                            <span title={`Branch: ${task.gitBranch}`}>
                              <GitBranch className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            </span>
                          )}
                          {task.prLink && (
                            <span title="Pull Request Linked">
                              <Link2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>

                        {/* Title Summary & Tags */}
                        <div className="col-span-1 md:col-span-5 space-y-1.5 pr-4">
                          <div className="font-semibold text-foreground line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </div>
                          
                          {/* Label badges & subtask count inline */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {task.subtasks.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-1.5 bg-muted/60 dark:bg-muted/30 px-1.5 py-0.5 rounded border border-border/50 font-mono">
                                <CheckSquare className="w-3 h-3 text-indigo-400" />
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                              </div>
                            )}

                            {task.labels.map((l) => (
                              <span
                                key={l.id}
                                className={`text-[9px] font-medium px-2 py-0.5 rounded border ${l.color}`}
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="col-span-1 md:col-span-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </span>
                        </div>

                        {/* Due Date */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          {task.dueDate ? (
                            <>
                              <Calendar className={`w-3.5 h-3.5 ${isOverdue ? "text-red-500" : ""}`} />
                              <span className={isOverdue ? "text-red-500 font-semibold flex items-center gap-1" : ""}>
                                {task.dueDate}
                                {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground/35 italic">No date</span>
                          )}
                        </div>

                        {/* Assignees stack */}
                        <div className="col-span-1 md:col-span-1 flex justify-start md:justify-end -space-x-1.5 overflow-hidden">
                          {task.assignees.map((user) => (
                            <div
                              key={user.id}
                              className="w-5.5 h-5.5 rounded-full border border-card bg-gradient-to-tr from-violet-600 to-indigo-600 text-[8px] font-bold text-white flex items-center justify-center flex-shrink-0 shadow-sm"
                              title={user.name}
                            >
                              {user.avatar}
                            </div>
                          ))}
                          {task.assignees.length === 0 && (
                            <span className="text-xs text-muted-foreground/40 italic">Unassigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground italic select-none">
                      No matching tickets in this status.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
