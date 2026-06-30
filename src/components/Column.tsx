"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column as ColumnType, Task } from "../types/kanban";
import TaskCard from "./TaskCard";
import { Plus, X, ArrowRight } from "lucide-react";
import { useKanbanStore } from "../store/kanbanStore";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export default function Column({ column, tasks, onTaskClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const addTask = useKanbanStore((state) => state.addTask);
  
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      addTask(column.id, {
        title: quickTitle.trim(),
        description: "",
        priority: "medium",
        status: column.id,
        labels: [],
        assignees: [],
        subtasks: [],
      });
      setQuickTitle("");
      setIsQuickAdding(false);
    }
  };

  const statusColors: { [key: string]: { header: string; dot: string; glow: string } } = {
    backlog: {
      header: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/15",
      dot: "bg-slate-400",
      glow: "glow-backlog",
    },
    todo: {
      header: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15",
      dot: "bg-blue-500",
      glow: "glow-todo",
    },
    inprogress: {
      header: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/15",
      dot: "bg-purple-500",
      glow: "glow-inprogress",
    },
    review: {
      header: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15",
      dot: "bg-amber-500",
      glow: "glow-review",
    },
    done: {
      header: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
      dot: "bg-emerald-500",
      glow: "glow-done",
    },
  };

  const colors = statusColors[column.id] || statusColors.backlog;

  return (
    <div className="flex flex-col w-full md:w-80 flex-shrink-0 bg-muted/20 dark:bg-muted/5 border border-border/40 rounded-2xl h-[calc(100vh-140px)] overflow-hidden">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b border-border/40 select-none ${colors.header}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot} ${colors.glow}`} />
          <h3 className="text-sm font-bold tracking-wide uppercase">{column.title}</h3>
        </div>
        <span className="text-xs font-mono font-bold bg-background/80 dark:bg-muted px-2 py-0.5 rounded-full border border-border/40 shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards List Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto min-h-[150px] scrollbar-thin transition-colors"
      >
        <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick(task.id)} 
            />
          ))}
        </SortableContext>

        {/* Empty State placeholder inside Column */}
        {tasks.length === 0 && !isQuickAdding && (
          <div className="h-24 rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center p-4 text-center select-none">
            <span className="text-xs text-muted-foreground">Drop tickets here</span>
          </div>
        )}

        {/* Quick Add Inline Form */}
        {isQuickAdding && (
          <form 
            onSubmit={handleQuickAddSubmit}
            className="p-3 bg-card border border-border rounded-xl shadow-sm mb-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <textarea
              placeholder="Enter ticket title..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full text-xs bg-transparent border-0 p-0 focus:ring-0 focus:outline-none resize-none min-h-[48px] text-foreground placeholder:text-muted-foreground"
              required
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAddSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2">
              <button
                type="button"
                onClick={() => setIsQuickAdding(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
              >
                <span>Add</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer Action */}
      {!isQuickAdding && (
        <button
          onClick={() => setIsQuickAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 py-3 hover:bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground border-t border-border/20 transition-colors cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Ticket</span>
        </button>
      )}
    </div>
  );
}
