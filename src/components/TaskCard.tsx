"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Priority } from "../types/kanban";
import { 
  CheckSquare, 
  MessageSquare, 
  GitBranch, 
  Link2,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };

  // Subtasks progress calculations
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const hasSubtasks = totalSubtasks > 0;

  const priorityColors: { [key in Priority]: string } = {
    low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const priorityLabels: { [key in Priority]: string } = {
    low: "Low",
    medium: "Med",
    high: "High",
    critical: "Crit",
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`glass-panel p-4 mb-3 rounded-xl border border-border/60 bg-card hover:border-indigo-500/30 hover:shadow-md transition-all duration-200 group select-none relative
        ${isDragging ? "shadow-none" : "shadow-sm"}
        ${task.priority === 'critical' ? "border-l-4 border-l-red-500" : ""}
        ${task.priority === 'high' ? "border-l-4 border-l-orange-500" : ""}
        ${task.priority === 'medium' ? "border-l-4 border-l-blue-500" : ""}
        ${task.priority === 'low' ? "border-l-4 border-l-slate-400" : ""}
      `}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {task.id}
        </span>
        <div className="flex items-center gap-1.5">
          {isOverdue && (
            <span className="text-red-500" title="Overdue!">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            </span>
          )}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-foreground mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Custom Tag Badges */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <span 
              key={label.id} 
              className={`text-[9px] font-medium px-2 py-0.5 rounded border ${label.color}`}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Checklist Progress Bar */}
      {hasSubtasks && (
        <div className="space-y-1 mb-3.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-indigo-400" />
              <span>Subtasks</span>
            </span>
            <span className="font-mono">{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Metadata row */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2.5">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {/* Comments count */}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">{task.comments.length}</span>
            </div>
          )}

          {/* GitHub branch badge */}
          {task.gitBranch && (
            <div 
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 dark:bg-muted/30 border border-border/50 text-[10px] font-mono text-muted-foreground max-w-[90px] truncate"
              title={`Branch: ${task.gitBranch}`}
            >
              <GitBranch className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{task.gitBranch.split('/').pop()}</span>
            </div>
          )}

          {/* PR icon */}
          {task.prLink && (
            <a 
              href={task.prLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Stop modal trigger
              className="hover:text-indigo-500 transition-colors"
              title="View Pull Request"
            >
              <Link2 className="w-3.5 h-3.5 text-indigo-500" />
            </a>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div 
              className={`flex items-center gap-1 text-[10px] font-mono
                ${isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}
              `}
              title={`Due date: ${task.dueDate}`}
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{task.dueDate.split('-').slice(1).join('/')}</span>
            </div>
          )}
        </div>

        {/* Assignees stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees.map((user) => (
            <div
              key={user.id}
              className="w-5 h-5 rounded-full border border-card bg-gradient-to-tr from-violet-600 to-indigo-600 text-[8px] font-bold text-white flex items-center justify-center flex-shrink-0 select-none shadow-sm"
              title={user.name}
            >
              {user.avatar}
            </div>
          ))}
          {task.assignees.length === 0 && (
            <div 
              className="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px]"
              title="Unassigned"
            >
              +
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
