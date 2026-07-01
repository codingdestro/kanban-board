"use client";

import React, { useState } from "react";
import { useKanbanStore, MOCK_USERS, MOCK_LABELS } from "../store/kanbanStore";
import { Priority, Label, User, Task } from "@kanban/types";
import { renderMarkdown } from "../utils/markdown";
import { 
  X, 
  Plus, 
  Trash2, 
  GitBranch, 
  Link2, 
  Calendar, 
  Copy, 
  Check, 
  UserPlus, 
  Tag, 
  MessageSquare,
  ChevronDown
} from "lucide-react";

interface TaskDetailModalProps {
  taskId: string | null; // If null, we are creating a new task
  columnId?: string;     // Initial column for new task
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, columnId, onClose }: TaskDetailModalProps) {
  const { 
    boards, 
    activeBoardId, 
    addTask, 
    updateTask, 
    deleteTask,
    addSubtask, 
    toggleSubtask, 
    deleteSubtask, 
    addComment 
  } = useKanbanStore();

  const activeBoard = boards[activeBoardId];
  
  // Find current task
  const isEditing = taskId !== null;
  const task = isEditing && activeBoard ? activeBoard.tasks[taskId] : null;

  // Local state for edits
  const [title, setTitle] = useState(() => (task ? task.title : ""));
  const [description, setDescription] = useState(() => (task ? task.description : ""));
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [priority, setPriority] = useState<Priority>(() => (task ? task.priority : "medium"));
  const [status, setStatus] = useState(() => (task ? task.status : (columnId || "todo")));
  const [dueDate, setDueDate] = useState(() => (task?.dueDate || ""));
  const [gitBranch, setGitBranch] = useState(() => (task?.gitBranch || ""));
  const [prLink, setPrLink] = useState(() => (task?.prLink || ""));
  
  // Subtask & Comment state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // UI States
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [copiedBranch, setCopiedBranch] = useState(false);

  // Handle immediate task updates on change
  const handleFieldChange = (field: keyof Task, value: Task[keyof Task]) => {
    if (isEditing && taskId) {
      updateTask(taskId, { [field]: value });
    }
  };

  const handleSaveDescription = () => {
    handleFieldChange("description", description);
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setDescription(task ? task.description : "");
    setIsEditingDescription(false);
  };

  const handleToggleAssignee = (user: User) => {
    if (!task) return;
    const isAssigned = task.assignees.some((u) => u.id === user.id);
    const updatedAssignees = isAssigned
      ? task.assignees.filter((u) => u.id !== user.id)
      : [...task.assignees, user];
    handleFieldChange("assignees", updatedAssignees);
  };

  const handleToggleLabel = (label: Label) => {
    if (!task) return;
    const hasLabel = task.labels.some((l) => l.id === label.id);
    const updatedLabels = hasLabel
      ? task.labels.filter((l) => l.id !== label.id)
      : [...task.labels, label];
    handleFieldChange("labels", updatedLabels);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() && taskId) {
      addSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim() && taskId) {
      // Mock log in as Alex Rivera
      addComment(taskId, newCommentText.trim(), "Alex Rivera", "AR");
      setNewCommentText("");
    }
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(status, {
      title: title.trim(),
      description,
      priority,
      status,
      labels: [],
      assignees: [],
      subtasks: [],
      dueDate: dueDate || undefined,
      gitBranch: gitBranch || undefined,
      prLink: prLink || undefined,
    });

    onClose();
  };

  const handleDeleteTaskClick = () => {
    if (isEditing && taskId) {
      if (confirm("Are you sure you want to delete this ticket?")) {
        deleteTask(taskId);
        onClose();
      }
    }
  };

  const copyGitBranchCommand = () => {
    if (!task) return;
    const branchName = task.gitBranch || `feature/${task.id.toLowerCase()}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const command = `git checkout -b ${branchName}`;
    navigator.clipboard.writeText(command);
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 2000);
  };

  const priorityColors: { [key in Priority]: string } = {
    low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-2xl border border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              {isEditing ? `Ticket / ${task?.id}` : "Create New Ticket"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleDeleteTaskClick}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                title="Delete Ticket"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {isEditing ? (
          /* ==========================================
             EXISTING TICKET DETAILED VIEW (EDITING)
             ========================================== */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: Rich text info, subtasks, comments */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* Title input (auto saves on blur) */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleFieldChange("title", title)}
                  className="w-full text-xl font-bold bg-transparent border-none p-0 focus:ring-0 focus:outline-none focus:border-b focus:border-border text-foreground"
                />
              </div>

              {/* Description Markdown editor */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add markdown description (e.g. ### Requirements)..."
                      className="w-full min-h-[160px] p-3 text-sm bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring text-foreground resize-y font-sans"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Save Spec
                      </button>
                      <button
                        onClick={handleCancelDescription}
                        className="px-3.5 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDescription(true)}
                    className="p-4 bg-muted/30 dark:bg-muted/10 border border-border/50 rounded-xl cursor-text hover:bg-muted/40 transition-colors min-h-[100px] overflow-hidden"
                  >
                    {description ? renderMarkdown(description) : (
                      <span className="text-sm text-muted-foreground italic">No specifications provided. Click here to edit...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks checklist */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Subtasks & Specs</span>
                
                {/* List subtasks */}
                {task && task.subtasks.length > 0 && (
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div 
                        key={subtask.id}
                        className="flex items-center justify-between group px-3 py-2 bg-muted/20 dark:bg-muted/5 border border-border/40 rounded-lg"
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer text-sm flex-1">
                          <input
                            type="checkbox"
                            checked={subtask.isCompleted}
                            onChange={() => toggleSubtask(task.id, subtask.id)}
                            className="rounded border-border text-indigo-600 focus:ring-ring/25 cursor-pointer"
                          />
                          <span className={`transition-all ${subtask.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {subtask.title}
                          </span>
                        </label>
                        <button
                          onClick={() => deleteSubtask(task.id, subtask.id)}
                          className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtask input builder */}
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add step/requirement..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-input border border-border/60 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
                  />
                  <button
                    type="submit"
                    className="px-3.5 bg-muted border border-border/80 hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* Comments stream */}
              <div className="space-y-4 border-t border-border/40 pt-6">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Activity Feed</span>
                </span>

                {/* New Comment Box */}
                <form onSubmit={handleAddCommentSubmit} className="space-y-2">
                  <textarea
                    placeholder="Write a comment (supports code blocks)..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full min-h-[70px] p-2.5 text-xs bg-input border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground resize-y"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCommentSubmit(e);
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-3 py-1.5 bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Log comments */}
                {task && task.comments.length > 0 && (
                  <div className="space-y-3.5 mt-4">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 text-xs">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 font-bold text-white flex items-center justify-center flex-shrink-0 select-none">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 bg-muted/40 dark:bg-muted/15 border border-border/50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-foreground">{comment.author}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-muted-foreground leading-relaxed">
                            {renderMarkdown(comment.text)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Options and dev properties panels */}
            <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-border/60 p-6 bg-muted/10 overflow-y-auto space-y-5 flex-shrink-0 scrollbar-thin">
              
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Status</label>
                <select
                  value={status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground font-semibold cursor-pointer"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["low", "medium", "high", "critical"] as Priority[]).map((p) => {
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPriority(p);
                          handleFieldChange("priority", p);
                        }}
                        className={`py-1.5 border text-xs font-semibold rounded-lg capitalize cursor-pointer transition-colors
                          ${active 
                            ? "bg-foreground text-background border-foreground font-bold" 
                            : priorityColors[p]
                          }
                        `}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignees selector dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Assignees</label>
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border/80 rounded-lg text-sm text-left hover:bg-muted/40 cursor-pointer font-medium"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                    {task && task.assignees.length > 0 
                      ? `${task.assignees.length} assigned` 
                      : "Unassigned"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showAssigneeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeDropdown(false)} />
                    <div className="absolute right-0 w-full mt-1.5 bg-card border border-border rounded-xl shadow-xl p-1.5 z-20 space-y-1 animate-in fade-in duration-150">
                      {MOCK_USERS.map((user) => {
                        const isAssigned = task?.assignees.some((u) => u.id === user.id);
                        return (
                          <button
                            key={user.id}
                            onClick={() => handleToggleAssignee(user)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer
                              ${isAssigned ? "bg-muted text-foreground font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-[8px] font-bold text-white flex items-center justify-center">
                                {user.avatar}
                              </span>
                              <span>{user.name}</span>
                            </div>
                            {isAssigned && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Labels Selector dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Labels</label>
                <button
                  onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border/80 rounded-lg text-sm text-left hover:bg-muted/40 cursor-pointer font-medium"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {task && task.labels.length > 0 
                      ? `${task.labels.length} active` 
                      : "No labels"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showLabelDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLabelDropdown(false)} />
                    <div className="absolute right-0 w-full mt-1.5 bg-card border border-border rounded-xl shadow-xl p-1.5 z-20 space-y-1 animate-in fade-in duration-150">
                      {MOCK_LABELS.map((lbl) => {
                        const hasLabel = task?.labels.some((l) => l.id === lbl.id);
                        return (
                          <button
                            key={lbl.id}
                            onClick={() => handleToggleLabel(lbl)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors
                              ${hasLabel ? "bg-muted text-foreground font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}
                            `}
                          >
                            <span className={`px-2 py-0.5 rounded border text-[10px] ${lbl.color}`}>
                              {lbl.name}
                            </span>
                            {hasLabel && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Due Date Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    handleFieldChange("dueDate", e.target.value || undefined);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground font-semibold cursor-pointer"
                />
              </div>

              {/* Developer Specific Metadata Section */}
              <div className="border-t border-border/60 pt-4 space-y-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Developer Context</span>
                
                {/* Branch name input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground block flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Git Branch Name</span>
                  </label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    onBlur={() => handleFieldChange("gitBranch", gitBranch || undefined)}
                    placeholder="e.g. feature/auth-fix"
                    className="w-full px-2.5 py-1.5 bg-input border border-border/60 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
                  />
                </div>

                {/* PR Link input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground block flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pull Request URL</span>
                  </label>
                  <input
                    type="text"
                    value={prLink}
                    onChange={(e) => setPrLink(e.target.value)}
                    onBlur={() => handleFieldChange("prLink", prLink || undefined)}
                    placeholder="e.g. https://github.com/..."
                    className="w-full px-2.5 py-1.5 bg-input border border-border/60 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
                  />
                </div>

                {/* Branch copier snippet */}
                {task && (
                  <div className="p-3 bg-muted/40 dark:bg-muted/10 border border-border/50 rounded-xl space-y-2 select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Checkout Branch</span>
                      <button
                        onClick={copyGitBranchCommand}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors flex items-center gap-1 text-[9px] font-semibold"
                      >
                        {copiedBranch ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy cmd</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-[10px] font-mono p-2 bg-zinc-950 text-indigo-300 rounded block border border-zinc-800 break-all select-all leading-tight">
                      git checkout -b {task.gitBranch || `feature/${task.id.toLowerCase()}`}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             NEW TICKET CREATION FORM
             ========================================== */
          <form onSubmit={handleCreateNewTask} className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: General Info Inputs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Ticket Title</label>
                <input
                  type="text"
                  placeholder="Summarize the work to be done..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-input focus:bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground font-semibold"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Specs & Description (Markdown)</label>
                <textarea
                  placeholder="### Goal:\nAdd specs here...\n\n### Steps:\n- [ ] Task 1..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[220px] p-3 text-sm bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring text-foreground resize-y font-sans"
                />
              </div>
            </div>

            {/* Right Side: Options & Dev Settings */}
            <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-border/60 p-6 bg-muted/10 overflow-y-auto space-y-5 flex-shrink-0 scrollbar-thin">
              {/* Column/Status Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Column</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground font-semibold cursor-pointer"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["low", "medium", "high", "critical"] as Priority[]).map((p) => {
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 border text-xs font-semibold rounded-lg capitalize cursor-pointer transition-colors
                          ${active 
                            ? "bg-foreground text-background border-foreground font-bold" 
                            : priorityColors[p]
                          }
                        `}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border/80 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground font-semibold cursor-pointer"
                />
              </div>

              {/* Git details (prefill suggestion helper) */}
              <div className="space-y-4 border-t border-border/60 pt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Developer Metadata</span>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground block flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Branch Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. feature/api-auth"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-input border border-border/60 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
                  />
                </div>
              </div>

              {/* Creation action buttons */}
              <div className="border-t border-border/60 pt-5 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
