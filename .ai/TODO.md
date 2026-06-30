# Developer-Centric Kanban Board - AI Implementation Roadmap

This document outlines the step-by-step implementation plan for an AI agent to build a premium, highly responsive, and developer-focused Kanban board.

---

## 🛠️ Tech Stack & Design System

- **Core Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS v4 (Using modern custom palettes, custom fonts, CSS custom properties, and native animations)
- **Icons:** Lucide React
- **Typography:** Google Fonts (Outfit for clean sans-serif UI, JetBrains Mono for developer ticket IDs and code blocks)
- **Code Quality:** ESLint + Prettier
- **State Management & Drag-and-Drop:** React Context / Zustand + `@dnd-kit/core` (or `@hello-pangea/dnd`)

---

## 🎨 Premium Design System Specifications

To achieve an **extremely premium, non-garbage, developer-centric design**, we will implement:
- **Dual-Theme Mode:** Sleek Dark Mode (default, utilizing deep slate/zinc backgrounds, dark gray glassmorphic components, and vibrant developer accents) and a matching Light Mode.
- **Accents by Status:**
  - `Backlog`: Sleek Cool Gray / Zinc
  - `Todo`: Sky Blue / Indigo (planning)
  - `In Progress`: Purple / Violet (active focus)
  - `Review`: Amber / Orange (needs attention)
  - `Done`: Teal / Emerald (completed)
- **Visual Enhancements:** Glassmorphism (`backdrop-blur-md`), subtle glowing focus indicators, smooth transitions on hover/active states, and rounded corners (`rounded-xl`).
- **Responsive Layout:** Dynamic multi-column grid layout transitioning from vertical stack on mobile to multi-column horizontal scroll on desktop, complemented by a collapsible navigation sidebar.

---

## 📋 Phase-by-Phase Roadmap

### Phase 1: Project Initialization & Configuration

- [ ] **1.1 Setup Next.js Boilerplate**
  - Run non-interactive initialization: `npx -y create-next-app@latest ./ --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`
  - Clean up default boilerplate styles and template code in `src/app/page.tsx` and `src/app/globals.css`.
- [ ] **1.2 Configure Tailwind CSS v4**
  - Integrate Google Fonts using `next/font/google` for `Outfit` and `JetBrains Mono`.
  - Set up Tailwind v4 style config within `src/app/globals.css` using the `@theme` directive:
    - Define Outfit as the primary sans font, and JetBrains Mono as the mono font.
    - Setup custom slate, zinc, violet, and sky color tokens.
    - Set up backdrop-blur and soft box-shadow tokens for glassmorphism.
- [ ] **1.3 Coding Standards Setup**
  - Install Prettier and tailwind formatting plugin: `npm install -D prettier prettier-plugin-tailwindcss`
  - Create `.prettierrc` with single quotes, semi-colons, and tab width configurations.
  - Create `.prettierignore` to exclude builds and cache directories.
  - Verify `next.config.js` and `tsconfig.json` configurations.

---

### Phase 2: Shell Layout & Responsive Navigation

- [ ] **2.1 Global Layout (`src/app/layout.tsx`)**
  - Set up metadata (SEO tags, titles, description).
  - Add standard page skeleton with persistent collapsible Sidebar and responsive Header.
  - Build a simple React context for Theme Toggle (Light/Dark mode) with local storage persistence.
- [ ] **2.2 Workspace Navigation Sidebar**
  - Create a premium sidebar containing:
    - Workspace Switcher dropdown (with placeholder boards: "Frontend App", "Compiler Core", "API Gateway").
    - Views toggler: "Board View" (Kanban), "List View", "Timeline / Calendar".
    - Theme Toggle buttons with sleek micro-animations.
  - Ensure the sidebar collapses smoothly on desktop and becomes a mobile slide-out drawer on smaller screens.
- [ ] **2.3 Workspace Header**
  - Build responsive top header containing page title, search bar, active users' avatars group, filters status indicator, and notification bell.

---

### Phase 3: Schema Models & Store Setup

- [ ] **3.1 Define TypeScript Interfaces (`src/types/kanban.ts`)**
  - Define interfaces for:
    - `Task`: `id` (e.g., `DEV-101`), `title`, `description` (Markdown format), `priority` (`low`, `medium`, `high`, `critical`), `status` (column id), `labels` (array of colors and text), `assignees` (avatars/names), `subtasks` (title + isCompleted), `dueDate`, `comments` (author, text, timestamp), `gitBranch` (optional branch name), `prLink` (optional GitHub PR URL), `createdAt`.
    - `Column`: `id`, `title`, `color` (status color theme).
    - `Board`: `id`, `name`, `columns` (array of columns), `tasks` (array of tasks).
- [ ] **3.2 Local State Store (`src/store/kanbanStore.ts`)**
  - Create a store (using React Context or Zustand) to manage CRUD actions:
    - `addTask(columnId, taskData)`
    - `updateTask(taskId, updatedData)`
    - `deleteTask(taskId)`
    - `moveTask(taskId, sourceColumnId, destColumnId, index)`
    - `addSubtask(taskId, title)`, `toggleSubtask(taskId, subtaskId)`
    - `addComment(taskId, commentText, author)`
  - Add client-side state hydration to persist tasks safely in `localStorage` without Next.js SSR mismatch warnings.

---

### Phase 4: Core Kanban Columns & Task Cards

- [ ] **4.1 Kanban Column Component (`src/components/Column.tsx`)**
  - Implement visually distinct columns with status headers (containing card counts, colored badge accents, and column actions button).
  - Add an inline "Quick Add Task" text-field at the top/bottom of each column.
  - Implement full responsiveness: columns wrap in a single vertical stack on mobile, but flow side-by-side with horizontal scroll on desktop.
- [ ] **4.2 Drag-and-Drop Context (`src/components/Board.tsx`)**
  - Install and set up `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/modifiers` for responsive drag-and-drop operations.
  - Construct drop animations and visual overlays showing placeholder cards where a card will land.
- [ ] **4.3 Premium Task Card Component (`src/components/TaskCard.tsx`)**
  - Build responsive card UI featuring:
    - Header: Ticket key (e.g., `DEV-402` in monospaced font) and priority indicator (colored dot/pill).
    - Body: Task title and truncated description.
    - Metadata pills: Subtask completion fraction (e.g., `2/5`), comment count, due date (red if overdue).
    - Footer: Assignee avatars and GitHub branch/PR quick-link badges.
  - Visual states: Slight border glow on hover, CSS scale transition, and cursor grab states.

---

### Phase 5: Developer Task Detail Modals

- [ ] **5.1 Task Detail Modal (`src/components/TaskDetailModal.tsx`)**
  - Premium overlay featuring:
    - Markdown editor/previewer for description (uses code block styling for code snippets).
    - Subtask checklist with custom-styled checkboxes and progress bar.
    - Developer properties side panel: Github PR link input, git branch command generator (`git checkout -b feature/DEV-xx`), labels selector.
    - Comment Activity stream with avatars and markdown support.
- [ ] **5.2 Keyboard Shortcuts Reference Overlay**
  - Build quick keyboard handlers:
    - `n`: open new task modal.
    - `/`: focus search bar.
    - `esc`: close current open modal.
    - `cmd+k` / `ctrl+k`: open workspace selection popup.

---

### Phase 6: Polish, Filters & Animations

- [ ] **6.1 Advanced Filtering Panel**
  - Interactive top bar filter pill group allowing instant filtering of cards by:
    - Priority (Critical, High, Medium, Low).
    - Assignee.
    - Custom Tags/Labels.
    - Overdue status.
- [ ] **6.2 Micro-Animations & Dark Mode Polish**
  - Implement a satisfying completion animation (e.g. confetti, subtle green flash) when a task is moved to `Done`.
  - Fine-tune theme toggle with a smooth fading CSS transition.
  - Customize standard browser scrollbars to be thin, rounded, and matched to dark/light theme colors.

---

### Phase 7: Verification & Build Inspection

- [ ] **7.1 Build Verification**
  - Run `npm run build` to confirm static site generation compiles without TypeScript or layout hydration issues.
- [ ] **7.2 Prettier & ESLint Quality Check**
  - Run linting commands: `npm run lint` and resolve any warnings.
  - Run Prettier to formatting correctness: `npx prettier --write .`
- [ ] **7.3 Responsive UI Validation**
  - Perform visual regression check at standard screen widths: Mobile (375px), Tablet (768px), Laptop (1024px), Desktop (1440px).
