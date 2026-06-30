"use client";

import React from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { 
  BarChart3, 
  PieChart, 
  CheckCircle2, 
  Clock, 
  FolderKanban,
  CheckSquare
} from "lucide-react";

export default function AnalyticsView() {
  const { boards, activeBoardId } = useKanbanStore();
  const activeBoard = boards[activeBoardId];

  if (!activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 select-none">
        <span className="text-sm text-muted-foreground">Select or create a workspace board.</span>
      </div>
    );
  }

  const tasks = Object.values(activeBoard.tasks);
  const totalTasks = tasks.length;

  // Status distributions
  const backlogCount = tasks.filter((t) => t.status === "backlog").length;
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "inprogress").length;
  const reviewCount = tasks.filter((t) => t.status === "review").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  // Priority distributions
  const lowCount = tasks.filter((t) => t.priority === "low").length;
  const mediumCount = tasks.filter((t) => t.priority === "medium").length;
  const highCount = tasks.filter((t) => t.priority === "high").length;
  const criticalCount = tasks.filter((t) => t.priority === "critical").length;

  // Subtask checks velocity
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  tasks.forEach((t) => {
    totalSubtasks += t.subtasks.length;
    completedSubtasks += t.subtasks.filter((s) => s.isCompleted).length;
  });

  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const donePercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Overdue tickets
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // 1. Math for Priority Donut Chart
  // Radius r = 50, Circumference = 2 * PI * r = 314.16
  const radius = 50;
  const circ = 2 * Math.PI * radius; // 314.159
  
  const pLow = totalTasks > 0 ? lowCount / totalTasks : 0;
  const pMed = totalTasks > 0 ? mediumCount / totalTasks : 0;
  const pHigh = totalTasks > 0 ? highCount / totalTasks : 0;
  const pCrit = totalTasks > 0 ? criticalCount / totalTasks : 0;

  const lowCirc = pLow * circ;
  const medCirc = pMed * circ;
  const highCirc = pHigh * circ;
  const critCirc = pCrit * circ;

  const offsetLow = 0;
  const offsetMed = -lowCirc;
  const offsetHigh = -(lowCirc + medCirc);
  const offsetCrit = -(lowCirc + medCirc + highCirc);

  // 2. Status Bar Chart Height Scale
  const maxStatusCount = Math.max(backlogCount, todoCount, inProgressCount, reviewCount, doneCount, 1);
  const getBarHeight = (count: number) => {
    return `${(count / maxStatusCount) * 140}px`; // Max height 140px
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-65px)] scrollbar-thin">
      <div className="max-w-5xl mx-auto space-y-6 select-none">
        
        {/* Top Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-panel p-5 rounded-xl border border-border/60 bg-card shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Total Tickets</span>
              <span className="text-2xl font-bold font-mono">{totalTasks}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-5 rounded-xl border border-border/60 bg-card shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Sprint Progress</span>
              <span className="text-2xl font-bold font-mono">{donePercent}%</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-5 rounded-xl border border-border/60 bg-card shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Subtasks Completed</span>
              <span className="text-2xl font-bold font-mono">{subtaskPercent}%</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-5 rounded-xl border border-border/60 bg-card shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
              ${overdueCount > 0 ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-slate-500/10 text-slate-500"}
            `}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Overdue Tickets</span>
              <span className={`text-2xl font-bold font-mono ${overdueCount > 0 ? "text-red-500" : ""}`}>
                {overdueCount}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Status Distribution Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-sm text-foreground">Ticket Status Distribution</span>
            </div>

            {/* Bars container */}
            <div className="flex items-end justify-between h-[160px] px-2.5">
              {/* Backlog */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono font-semibold text-muted-foreground">{backlogCount}</span>
                <div 
                  className="w-8 bg-slate-500/20 dark:bg-slate-400/20 hover:bg-slate-500/30 rounded-t-md transition-all duration-500 border border-slate-500/30"
                  style={{ height: getBarHeight(backlogCount) }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">BCKLG</span>
              </div>

              {/* Todo */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono font-semibold text-blue-500">{todoCount}</span>
                <div 
                  className="w-8 bg-blue-500/20 hover:bg-blue-500/35 rounded-t-md transition-all duration-500 border border-blue-500/30"
                  style={{ height: getBarHeight(todoCount) }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">TODO</span>
              </div>

              {/* In Progress */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono font-semibold text-purple-500">{inProgressCount}</span>
                <div 
                  className="w-8 bg-purple-500/20 hover:bg-purple-500/35 rounded-t-md transition-all duration-500 border border-purple-500/30"
                  style={{ height: getBarHeight(inProgressCount) }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">PROG</span>
              </div>

              {/* Review */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono font-semibold text-amber-500">{reviewCount}</span>
                <div 
                  className="w-8 bg-amber-500/20 hover:bg-amber-500/35 rounded-t-md transition-all duration-500 border border-amber-500/30"
                  style={{ height: getBarHeight(reviewCount) }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">REVW</span>
              </div>

              {/* Done */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono font-semibold text-emerald-500">{doneCount}</span>
                <div 
                  className="w-8 bg-emerald-500/20 hover:bg-emerald-500/35 rounded-t-md transition-all duration-500 border border-emerald-500/30"
                  style={{ height: getBarHeight(doneCount) }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">DONE</span>
              </div>
            </div>
          </div>

          {/* Priority Donut Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-sm text-foreground">Priority Breakdown</span>
            </div>

            {/* SVG Donut Circle and Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* SVG Ring circle */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Base Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--border)"
                    strokeWidth="10"
                  />
                  {totalTasks > 0 ? (
                    <>
                      {/* Low Priority segment */}
                      {lowCount > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="transparent"
                          stroke="rgb(148, 163, 184)"
                          strokeWidth="12"
                          strokeDasharray={`${lowCirc} ${circ}`}
                          strokeDashoffset={offsetLow}
                          className="transition-all duration-500"
                        />
                      )}
                      {/* Medium Priority segment */}
                      {mediumCount > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="transparent"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="12"
                          strokeDasharray={`${medCirc} ${circ}`}
                          strokeDashoffset={offsetMed}
                          className="transition-all duration-500"
                        />
                      )}
                      {/* High Priority segment */}
                      {highCount > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="transparent"
                          stroke="rgb(249, 115, 22)"
                          strokeWidth="12"
                          strokeDasharray={`${highCirc} ${circ}`}
                          strokeDashoffset={offsetHigh}
                          className="transition-all duration-500"
                        />
                      )}
                      {/* Critical Priority segment */}
                      {criticalCount > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="transparent"
                          stroke="rgb(239, 68, 68)"
                          strokeWidth="12"
                          strokeDasharray={`${critCirc} ${circ}`}
                          strokeDashoffset={offsetCrit}
                          className="transition-all duration-500"
                        />
                      )}
                    </>
                  ) : null}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono leading-none">{totalTasks}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-1">Tickets</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs font-semibold w-full max-w-[150px]">
                {/* Low */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-400" />
                    <span className="text-muted-foreground">Low</span>
                  </div>
                  <span className="font-mono font-bold">{lowCount}</span>
                </div>

                {/* Medium */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                    <span className="text-muted-foreground">Medium</span>
                  </div>
                  <span className="font-mono font-bold">{mediumCount}</span>
                </div>

                {/* High */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-orange-500" />
                    <span className="text-muted-foreground">High</span>
                  </div>
                  <span className="font-mono font-bold">{highCount}</span>
                </div>

                {/* Critical */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-red-500" />
                    <span className="text-muted-foreground">Critical</span>
                  </div>
                  <span className="font-mono font-bold">{criticalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Velocity Checklist summary panel */}
        {totalSubtasks > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between select-none">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">Sprint Checklist Completion</h4>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Checklist completion measures subtask completion velocity. We have currently completed <strong className="text-indigo-400 font-mono font-bold">{completedSubtasks}</strong> out of <strong className="font-mono font-bold">{totalSubtasks}</strong> subtask specifications defined in this sprint.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold font-mono text-indigo-500">{subtaskPercent}%</span>
              <div className="w-32 bg-border h-3 rounded-full overflow-hidden border border-border/60">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${subtaskPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
