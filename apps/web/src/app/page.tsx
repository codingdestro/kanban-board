"use client";

import React from "react";
import { useKanbanStore } from "../store/kanbanStore";
import Board from "../components/Board";

export default function Home() {
  const setActiveTaskId = useKanbanStore((state) => state.setActiveTaskId);

  return (
    <Board onTaskClick={(taskId) => setActiveTaskId(taskId)} />
  );
}
