"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { useKanbanStore } from "../store/kanbanStore";
import { Task, User, Label } from "@kanban/types";
import Column from "./Column";
import TaskCard from "./TaskCard";

interface BoardProps {
  onTaskClick: (taskId: string) => void;
}

export default function Board({ onTaskClick }: BoardProps) {
  const { boards, activeBoardId, searchQuery, filters, moveTask } = useKanbanStore();
  const activeBoard = boards[activeBoardId];
  const [activeId, setActiveId] = useState<string | null>(null);

  // Setup sensors for dragging (using pointer only to simplify drag start thresholds)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag before starting drag to allow simple clicks
      },
    })
  );

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
    // Search Query
    if (searchQuery) {
      const matchSearch =
        task.id.toLowerCase().includes(searchLower) ||
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower);
      if (!matchSearch) return false;
    }

    // Priority Filters
    if (filters.priorities.length > 0) {
      if (!filters.priorities.includes(task.priority)) return false;
    }

    // Assignee Filters
    if (filters.assignees.length > 0) {
      const hasAssignee = task.assignees.some((u: User) => filters.assignees.includes(u.id));
      if (!hasAssignee) return false;
    }

    // Label Filters
    if (filters.labels.length > 0) {
      const hasLabel = task.labels.some((l: Label) => filters.labels.includes(l.id));
      if (!hasLabel) return false;
    }

    return true;
  };

  const findColumnOfTask = (taskId: string) => {
    return Object.values(activeBoard.columns).find((col) => col.taskIds.includes(taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const activeCol = findColumnOfTask(activeId);
    if (!activeCol) {
      setActiveId(null);
      return;
    }

    let destColId = "";
    let destIndex = -1;

    // Check if dragging over another task
    const overCol = findColumnOfTask(overId);
    if (overCol) {
      destColId = overCol.id;
      destIndex = overCol.taskIds.indexOf(overId);
    } else if (activeBoard.columns[overId]) {
      // Dragging directly over a column container
      destColId = overId;
      destIndex = activeBoard.columns[overId].taskIds.length;
    }

    if (!destColId) {
      setActiveId(null);
      return;
    }

    const sourceIndex = activeCol.taskIds.indexOf(activeId);
    if (destIndex === -1) {
      destIndex = activeBoard.columns[destColId].taskIds.length;
    }

    moveTask(activeId, activeCol.id, destColId, sourceIndex, destIndex);
    setActiveId(null);
  };

  const activeTask = activeId ? activeBoard.tasks[activeId] : null;

  return (
    <div className="flex-1 p-6 overflow-x-auto h-[calc(100vh-65px)] scrollbar-thin">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-max pb-4 h-full">
          {activeBoard.columnOrder.map((colId) => {
            const column = activeBoard.columns[colId];
            // Filter list tasks belonging to this column
            const columnTasks = column.taskIds
              .map((id) => activeBoard.tasks[id])
              .filter(Boolean)
              .filter(filterTask);

            return (
              <Column
                key={column.id}
                column={column}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
              />
            );
          })}
        </div>

        {/* Drag Overlay for ghost preview card */}
        <DragOverlay>
          {activeTask ? (
            <div className="scale-[1.03] rotate-1 shadow-2xl opacity-90 transition-transform cursor-grabbing">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
