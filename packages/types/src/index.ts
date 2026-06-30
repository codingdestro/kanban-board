export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Label {
  id: string;
  name: string;
  color: string; // Tailwind bg-class or Hex color
}

export interface User {
  id: string;
  name: string;
  avatar: string; // Avatar URL or initials
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string; // e.g. "DEV-101"
  title: string;
  description: string; // Supports markdown
  priority: Priority;
  status: string; // Column ID
  labels: Label[];
  assignees: User[];
  subtasks: Subtask[];
  dueDate?: string; // YYYY-MM-DD
  comments: Comment[];
  gitBranch?: string;
  prLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string; // e.g. "backlog", "todo", "inprogress", "review", "done"
  title: string;
  colorClass: string; // Tailwind text/bg colors e.g. "todo"
  taskIds: string[];
}

export interface Board {
  id: string;
  name: string;
  columns: { [id: string]: Column };
  tasks: { [id: string]: Task };
  columnOrder: string[];
}
