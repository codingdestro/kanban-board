"use client";

import React from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import ListView from "@/components/ListView";

export default function ListPage() {
  const setActiveTaskId = useKanbanStore((state) => state.setActiveTaskId);

  return (
    <ListView onTaskClick={(taskId) => setActiveTaskId(taskId)} />
  );
}
