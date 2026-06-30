import { create } from 'zustand';
import { Board, Task, Column, Priority, Label, User, Subtask, Comment } from '../types/kanban';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Rivera', avatar: 'AR' },
  { id: 'u2', name: 'Sophia Chen', avatar: 'SC' },
  { id: 'u3', name: 'Marcus Vance', avatar: 'MV' },
  { id: 'u4', name: 'Elena Rostova', avatar: 'ER' },
];

// Mock Labels
export const MOCK_LABELS: Label[] = [
  { id: 'l1', name: 'Bug', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  { id: 'l2', name: 'Feature', color: 'bg-violet-500/20 text-violet-500 border-violet-500/30' },
  { id: 'l3', name: 'Refactor', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  { id: 'l4', name: 'DevOps', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
  { id: 'l5', name: 'Docs', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
];

const initialTasks: { [id: string]: Task } = {
  'DEV-101': {
    id: 'DEV-101',
    title: 'Refactor authentication flow using NextAuth.js',
    description: 'We need to migrate our legacy authentication flow to **NextAuth.js v5** to support server components and edge routes.\n\n### Requirements:\n- [x] Configure providers (GitHub, Google, Credentials)\n- [ ] Enable session persistence in Redis cache\n- [ ] Write integration tests for middleware protection',
    priority: 'high',
    status: 'inprogress',
    labels: [MOCK_LABELS[1], MOCK_LABELS[2]],
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    subtasks: [
      { id: 's1', title: 'Configure providers (GitHub, Google)', isCompleted: true },
      { id: 's2', title: 'Enable session persistence in Redis', isCompleted: false },
      { id: 's3', title: 'Write middleware verification rules', isCompleted: false },
    ],
    dueDate: '2026-07-15',
    gitBranch: 'feature/DEV-101-auth-refactor',
    prLink: 'https://github.com/developer/kanban/pull/42',
    comments: [
      {
        id: 'c1',
        author: 'Sophia Chen',
        avatar: 'SC',
        text: 'I started working on the Google OAuth credentials setup. Let me know if you need the env vars.',
        createdAt: '2026-06-30T10:00:00Z',
      },
    ],
    createdAt: '2026-06-28T09:00:00Z',
    updatedAt: '2026-06-30T10:00:00Z',
  },
  'DEV-102': {
    id: 'DEV-102',
    title: 'Migrate Tailwind config to v4 and configure fonts',
    description: 'Update the global styling system to Tailwind CSS v4. Ensure all `@theme` attributes are fully defined in `globals.css` and font variables are integrated properly.\n\nInclude Outfit as sans font and JetBrains Mono as mono font.',
    priority: 'medium',
    status: 'done',
    labels: [MOCK_LABELS[1], MOCK_LABELS[2]],
    assignees: [MOCK_USERS[0]],
    subtasks: [
      { id: 's4', title: 'Add Tailwind v4 npm dependencies', isCompleted: true },
      { id: 's5', title: 'Configure font families and custom scrollbar styles', isCompleted: true },
    ],
    dueDate: '2026-06-30',
    gitBranch: 'feature/DEV-102-tailwind-v4',
    comments: [],
    createdAt: '2026-06-29T11:00:00Z',
    updatedAt: '2026-06-30T12:00:00Z',
  },
  'DEV-103': {
    id: 'DEV-103',
    title: 'Fix memory leak in board drag-and-drop render cycles',
    description: 'We are seeing significant heap size increase when dragging task cards repeatedly in Chrome. Need to profile performance using Chrome DevTools and optimize drag listeners.\n\nEnsure we throttle state updates and avoid unnecessary react renders.',
    priority: 'critical',
    status: 'review',
    labels: [MOCK_LABELS[0]],
    assignees: [MOCK_USERS[2]],
    subtasks: [
      { id: 's6', title: 'Profile DnD memory overhead using heap snapshots', isCompleted: true },
      { id: 's7', title: 'Throttled position calculations inside BoardContainer', isCompleted: false },
    ],
    dueDate: '2026-07-02',
    gitBranch: 'bugfix/DEV-103-dnd-mem-leak',
    comments: [
      {
        id: 'c2',
        author: 'Alex Rivera',
        avatar: 'AR',
        text: 'Confirmed that heap size grows by ~20MB per drag action. Looks like event listeners are not getting cleaned up.',
        createdAt: '2026-06-30T12:30:00Z',
      },
    ],
    createdAt: '2026-06-29T14:00:00Z',
    updatedAt: '2026-06-30T12:30:00Z',
  },
  'DEV-104': {
    id: 'DEV-104',
    title: 'Write automated unit tests for state hydration hooks',
    description: 'Ensure we have unit tests verifying local store state gets hydrated correctly and resolves SSR conflicts on initial boot.',
    priority: 'low',
    status: 'todo',
    labels: [MOCK_LABELS[4]],
    assignees: [],
    subtasks: [],
    dueDate: '2026-07-10',
    comments: [],
    createdAt: '2026-06-30T08:00:00Z',
    updatedAt: '2026-06-30T08:00:00Z',
  },
  'DEV-105': {
    id: 'DEV-105',
    title: 'Setup production CD pipeline on Vercel',
    description: 'Create a deployment workflow trigger that builds and deploys to staging and production automatically on push to `main` branch.',
    priority: 'high',
    status: 'backlog',
    labels: [MOCK_LABELS[3]],
    assignees: [MOCK_USERS[3]],
    subtasks: [],
    comments: [],
    createdAt: '2026-06-29T08:00:00Z',
    updatedAt: '2026-06-29T08:00:00Z',
  },
};

const initialColumns: { [id: string]: Column } = {
  backlog: {
    id: 'backlog',
    title: 'Backlog',
    colorClass: 'backlog',
    taskIds: ['DEV-105'],
  },
  todo: {
    id: 'todo',
    title: 'To Do',
    colorClass: 'todo',
    taskIds: ['DEV-104'],
  },
  inprogress: {
    id: 'inprogress',
    title: 'In Progress',
    colorClass: 'inprogress',
    taskIds: ['DEV-101'],
  },
  review: {
    id: 'review',
    title: 'In Review',
    colorClass: 'review',
    taskIds: ['DEV-103'],
  },
  done: {
    id: 'done',
    title: 'Done',
    colorClass: 'done',
    taskIds: ['DEV-102'],
  },
};

const defaultBoard: Board = {
  id: 'b1',
  name: 'Sprint Alpha // Core Dev',
  columns: initialColumns,
  tasks: initialTasks,
  columnOrder: ['backlog', 'todo', 'inprogress', 'review', 'done'],
};

interface KanbanStore {
  boards: { [id: string]: Board };
  activeBoardId: string;
  searchQuery: string;
  filters: {
    priorities: Priority[];
    assignees: string[]; // user IDs
    labels: string[]; // label IDs
  };
  isHydrated: boolean;
  activeTaskId: string | null;
  isNewTaskOpen: boolean;
  isShortcutsOpen: boolean;
  
  // Actions
  hydrateStore: () => void;
  setActiveBoardId: (id: string) => void;
  setActiveTaskId: (id: string | null) => void;
  setIsNewTaskOpen: (isOpen: boolean) => void;
  setIsShortcutsOpen: (isOpen: boolean) => void;
  addBoard: (name: string) => void;
  
  // Tasks
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (taskId: string, updatedFields: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
  
  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Comments
  addComment: (taskId: string, text: string, authorName: string, authorAvatar: string) => void;
  
  // Filters
  setSearchQuery: (query: string) => void;
  toggleFilterPriority: (priority: Priority) => void;
  toggleFilterAssignee: (userId: string) => void;
  toggleFilterLabel: (labelId: string) => void;
  clearFilters: () => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => {
  const saveState = (updatedBoards: { [id: string]: Board }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kanban-store', JSON.stringify({
        boards: updatedBoards,
        activeBoardId: get().activeBoardId,
      }));
    }
  };

  return {
    boards: { 'b1': defaultBoard },
    activeBoardId: 'b1',
    searchQuery: '',
    filters: {
      priorities: [],
      assignees: [],
      labels: [],
    },
    isHydrated: false,
    activeTaskId: null,
    isNewTaskOpen: false,
    isShortcutsOpen: false,

    hydrateStore: () => {
      if (typeof window === 'undefined') return;
      try {
        const data = localStorage.getItem('kanban-store');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.boards && parsed.activeBoardId) {
            set({
              boards: parsed.boards,
              activeBoardId: parsed.activeBoardId,
              isHydrated: true,
            });
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load store from localStorage', e);
      }
      set({ isHydrated: true });
    },

    setActiveBoardId: (id) => {
      set({ activeBoardId: id });
      saveState(get().boards);
    },

    setActiveTaskId: (id) => set({ activeTaskId: id }),
    setIsNewTaskOpen: (isOpen) => set({ isNewTaskOpen: isOpen }),
    setIsShortcutsOpen: (isOpen) => set({ isShortcutsOpen: isOpen }),

    addBoard: (name) => {
      const id = `b_${Date.now()}`;
      const newBoard: Board = {
        id,
        name,
        columns: {
          backlog: { id: 'backlog', title: 'Backlog', colorClass: 'backlog', taskIds: [] },
          todo: { id: 'todo', title: 'To Do', colorClass: 'todo', taskIds: [] },
          inprogress: { id: 'inprogress', title: 'In Progress', colorClass: 'inprogress', taskIds: [] },
          review: { id: 'review', title: 'In Review', colorClass: 'review', taskIds: [] },
          done: { id: 'done', title: 'Done', colorClass: 'done', taskIds: [] },
        },
        tasks: {},
        columnOrder: ['backlog', 'todo', 'inprogress', 'review', 'done'],
      };

      set((state) => {
        const nextBoards = { ...state.boards, [id]: newBoard };
        saveState(nextBoards);
        return { boards: nextBoards, activeBoardId: id };
      });
    },

    addTask: (columnId, taskData) => {
      const id = `DEV-${Math.floor(100 + Math.random() * 900)}`;
      const timestamp = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id,
        status: columnId,
        comments: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      set((state) => {
        const board = state.boards[state.activeBoardId];
        const column = board.columns[columnId];
        
        const nextBoard: Board = {
          ...board,
          tasks: { ...board.tasks, [id]: newTask },
          columns: {
            ...board.columns,
            [columnId]: {
              ...column,
              taskIds: [...column.taskIds, id],
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    updateTask: (taskId, updatedFields) => {
      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextTask = {
          ...task,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };

        // If status changed, we need to move the taskId to a new column
        const nextColumns = { ...board.columns };
        if (updatedFields.status && updatedFields.status !== task.status) {
          const prevCol = board.columns[task.status];
          const newCol = board.columns[updatedFields.status];
          
          nextColumns[task.status] = {
            ...prevCol,
            taskIds: prevCol.taskIds.filter((id) => id !== taskId),
          };

          nextColumns[updatedFields.status] = {
            ...newCol,
            taskIds: [...newCol.taskIds, taskId],
          };
        }

        const nextBoard: Board = {
          ...board,
          tasks: { ...board.tasks, [taskId]: nextTask },
          columns: nextColumns,
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    deleteTask: (taskId) => {
      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const colId = task.status;
        const column = board.columns[colId];

        const nextTasks = { ...board.tasks };
        delete nextTasks[taskId];

        const nextBoard: Board = {
          ...board,
          tasks: nextTasks,
          columns: {
            ...board.columns,
            [colId]: {
              ...column,
              taskIds: column.taskIds.filter((id) => id !== taskId),
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    moveTask: (taskId, sourceColId, destColId, sourceIndex, destIndex) => {
      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextColumns = { ...board.columns };
        
        // Same column move
        if (sourceColId === destColId) {
          const col = board.columns[sourceColId];
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(sourceIndex, 1);
          newTaskIds.splice(destIndex, 0, taskId);

          nextColumns[sourceColId] = {
            ...col,
            taskIds: newTaskIds,
          };
        } else {
          // Cross column move
          const srcCol = board.columns[sourceColId];
          const destCol = board.columns[destColId];

          const srcTaskIds = [...srcCol.taskIds];
          srcTaskIds.splice(sourceIndex, 1);

          const destTaskIds = [...destCol.taskIds];
          destTaskIds.splice(destIndex, 0, taskId);

          nextColumns[sourceColId] = {
            ...srcCol,
            taskIds: srcTaskIds,
          };

          nextColumns[destColId] = {
            ...destCol,
            taskIds: destTaskIds,
          };
        }

        const nextBoard: Board = {
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              status: destColId,
              updatedAt: new Date().toISOString(),
            },
          },
          columns: nextColumns,
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    addSubtask: (taskId, title) => {
      const subtask: Subtask = {
        id: `s_${Date.now()}`,
        title,
        isCompleted: false,
      };

      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextBoard: Board = {
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              subtasks: [...task.subtasks, subtask],
              updatedAt: new Date().toISOString(),
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    toggleSubtask: (taskId, subtaskId) => {
      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );

        const nextBoard: Board = {
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              subtasks: nextSubtasks,
              updatedAt: new Date().toISOString(),
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    deleteSubtask: (taskId, subtaskId) => {
      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);

        const nextBoard: Board = {
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              subtasks: nextSubtasks,
              updatedAt: new Date().toISOString(),
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    addComment: (taskId, text, authorName, authorAvatar) => {
      const comment: Comment = {
        id: `c_${Date.now()}`,
        author: authorName,
        avatar: authorAvatar,
        text,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const board = state.boards[state.activeBoardId];
        const task = board.tasks[taskId];
        if (!task) return {};

        const nextBoard: Board = {
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              comments: [comment, ...task.comments], // Latest comment first
              updatedAt: new Date().toISOString(),
            },
          },
        };

        const nextBoards = { ...state.boards, [state.activeBoardId]: nextBoard };
        saveState(nextBoards);
        return { boards: nextBoards };
      });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    toggleFilterPriority: (priority) => {
      set((state) => {
        const p = state.filters.priorities;
        const priorities = p.includes(priority)
          ? p.filter((x) => x !== priority)
          : [...p, priority];
        return { filters: { ...state.filters, priorities } };
      });
    },

    toggleFilterAssignee: (userId) => {
      set((state) => {
        const a = state.filters.assignees;
        const assignees = a.includes(userId)
          ? a.filter((x) => x !== userId)
          : [...a, userId];
        return { filters: { ...state.filters, assignees } };
      });
    },

    toggleFilterLabel: (labelId) => {
      set((state) => {
        const l = state.filters.labels;
        const labels = l.includes(labelId)
          ? l.filter((x) => x !== labelId)
          : [...l, labelId];
        return { filters: { ...state.filters, labels } };
      });
    },

    clearFilters: () => {
      set({
        filters: {
          priorities: [],
          assignees: [],
          labels: [],
        },
      });
    },
  };
});
