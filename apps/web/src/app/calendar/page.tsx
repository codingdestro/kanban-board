"use client";

import React from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import CalendarView from "@/components/CalendarView";

export default function CalendarPage() {
  const setActiveTaskId = useKanbanStore((state) => state.setActiveTaskId);

  return (
    <CalendarView onTaskClick={(taskId) => setActiveTaskId(taskId)} />
  );
}
