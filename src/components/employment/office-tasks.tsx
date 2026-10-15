"use client";

import React, { useState, useMemo } from "react";
import {
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Check,
  ListTodo,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import {
  StoredEmploymentTask,
  updateTaskStatus,
  deleteEmploymentTask,
} from "@/actions/employment.actions";
import { TaskDialog } from "./task-dialog";

export interface OfficeTasksProps {
  employmentId: string;
  tasks: StoredEmploymentTask[];
  onRefresh: () => void;
}

type StatusFilter = "ALL" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type PriorityFilter = "ALL" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";

const STATUS_FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "DONE", label: "Done" },
];

const PRIORITY_FILTER_CHIPS: {
  key: PriorityFilter;
  label: string;
  badgeClass: string;
}[] = [
  { key: "ALL", label: "All", badgeClass: "border-card-border text-foreground" },
  {
    key: "URGENT",
    label: "URGENT",
    badgeClass: "border-red-500/40 text-red-400 bg-red-500/10",
  },
  {
    key: "HIGH",
    label: "HIGH",
    badgeClass: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    key: "MEDIUM",
    label: "MEDIUM",
    badgeClass: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  },
  {
    key: "LOW",
    label: "LOW",
    badgeClass: "border-slate-500/40 text-slate-400 bg-slate-500/10",
  },
];

const NEXT_STATUS: Record<
  StoredEmploymentTask["status"],
  StoredEmploymentTask["status"]
> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  BLOCKED: "IN_PROGRESS",
  DONE: "TODO",
};

export function OfficeTasks({
  employmentId,
  tasks = [],
  onRefresh,
}: OfficeTasksProps) {
  // Filters state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<StoredEmploymentTask | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Status metrics calculation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
    const done = tasks.filter((t) => t.status === "DONE").length;

    const todayStr = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
      return t.dueDate.split("T")[0] < todayStr;
    }).length;

    const completionPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, inProgress, blocked, done, overdue, completionPercent };
  }, [tasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "ALL" && task.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description
          ? task.description.toLowerCase().includes(query)
          : false;
        if (!titleMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Toggle status checkbox (DONE <-> TODO)
  const handleToggleCheck = async (task: StoredEmploymentTask) => {
    const newStatus: StoredEmploymentTask["status"] =
      task.status === "DONE" ? "TODO" : "DONE";
    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus(task.id, newStatus, employmentId);
      onRefresh();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Advance status to next logical state
  const handleAdvanceStatus = async (
    task: StoredEmploymentTask,
    targetStatus?: StoredEmploymentTask["status"]
  ) => {
    const newStatus = targetStatus || NEXT_STATUS[task.status];
    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus(task.id, newStatus, employmentId);
      onRefresh();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Confirm delete task
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmploymentTask(taskToDelete.id, employmentId);
      setTaskToDelete(null);
      onRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to compute due date status
  const getDueDateMeta = (dueDateStr: string | null | undefined, isDone: boolean) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dueDateStr.split("T")[0].split("-");
    const due = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
    due.setHours(0, 0, 0, 0);

    const isToday = due.getTime() === today.getTime();
    const isOverdue = !isDone && due.getTime() < today.getTime();

    return {
      formatted: formatDate(dueDateStr),
      isOverdue,
      isToday,
    };
  };

  return (
    <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header and Summary Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-sm">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  Office Sprint Tasks
                </h3>
                <p className="text-xs text-muted-foreground">
                  Checklist tugas kantor, sprint backlog, dan pelacakan deadline pekerjaan
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-10 px-5 text-xs font-extrabold gap-2 shrink-0 rounded-full bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Task
          </Button>
        </div>

        {/* Quick Metrics & Progress bar */}
        <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Total Tasks
            </span>
            <p className="text-xl font-black text-foreground tabular-nums">
              {metrics.total}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
              In Progress
            </span>
            <p className="text-xl font-black text-blue-500 tabular-nums">
              {metrics.inProgress}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-neon tracking-wider">
              Selesai (Done)
            </span>
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-neon tabular-nums">
                {metrics.done}
              </p>
              <span className="text-xs font-bold text-muted-foreground">
                {metrics.completionPercent}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
              Terlewat (Overdue)
            </span>
            <p className="text-xl font-black text-rose-500 tabular-nums">
              {metrics.overdue}
            </p>
          </div>
        </div>

        {/* Progress bar line */}
        {metrics.total > 0 && (
          <div className="w-full bg-card-inner border border-card-border-subtle rounded-full h-2 overflow-hidden mt-3.5">
            <div
              className="bg-neon h-full transition-all duration-500 rounded-full"
              style={{ width: `${metrics.completionPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls: Search, Status Tabs, Priority Chips */}
      <div className="space-y-3.5 pt-3 border-t border-card-border-subtle">
        {/* Status Filter Tabs (Stitch Pill Style) */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-card-inner border border-card-border-subtle overflow-x-auto max-w-full">
          {STATUS_FILTER_TABS.map((tab) => {
            const isSelected = statusFilter === tab.key;
            let count = metrics.total;
            if (tab.key === "TODO") count = metrics.todo;
            if (tab.key === "IN_PROGRESS") count = metrics.inProgress;
            if (tab.key === "BLOCKED") count = metrics.blocked;
            if (tab.key === "DONE") count = metrics.done;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  isSelected
                    ? "bg-neon text-black font-extrabold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                    isSelected
                      ? "bg-black/15 text-black"
                      : "bg-card text-muted-foreground border border-card-border"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-row: Priority Chips & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Priority Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">
              Prioritas:
            </span>
            {PRIORITY_FILTER_CHIPS.map((chip) => {
              const isSelected = priorityFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setPriorityFilter(chip.key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap",
                    chip.badgeClass,
                    isSelected
                      ? "ring-2 ring-neon scale-[1.03] font-bold shadow-sm"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau rincian..."
              className="pl-9 pr-4 h-9 text-xs bg-card-inner border-card-border-subtle focus-visible:ring-neon rounded-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

          {/* Task List Items */}
          <div className="space-y-2.5 pt-2">
            {filteredTasks.length === 0 ? (
              <div className="p-10 rounded-2xl bg-background border border-dashed border-card-border flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-card border border-card-border text-muted-foreground flex items-center justify-center">
                  <ListTodo className="w-6 h-6 opacity-50" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-sm font-bold text-foreground">
                    Tidak Ada Task
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                      ? "Tidak ada task yang sesuai dengan kriteria filter saat ini."
                      : "Belum ada task yang dibuat untuk pekerjaan ini."}
                  </p>
                </div>
                {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setPriorityFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="text-xs rounded-xl border-card-border"
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="text-xs rounded-xl font-bold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Buat Task Baru
                  </Button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "DONE";
                const isBlocked = task.status === "BLOCKED";
                const isUpdating = updatingTaskId === task.id;
                const dueMeta = getDueDateMeta(task.dueDate, isDone);

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "group p-3.5 sm:p-4 rounded-2xl border transition-all duration-200",
                      isDone
                        ? "bg-card-inner/50 border-card-border-subtle opacity-70 hover:opacity-100"
                        : isBlocked
                        ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
                        : "bg-card-inner border-card-border-subtle hover:border-card-border hover:bg-emerald-50/20 shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleCheck(task)}
                        disabled={isUpdating}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 border",
                          isDone
                            ? "bg-neon border-neon text-black shadow-[0_0_10px_rgba(59,240,41,0.4)]"
                            : "bg-card border-card-border text-transparent hover:border-neon/60 hover:text-neon/40"
                        )}
                        aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        ) : isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm font-semibold text-foreground break-words transition-all",
                              isDone && "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </h4>

                          {/* Badges: Priority, Status, Due Date */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {/* Priority Badge */}
                            {task.priority === "URGENT" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-red-500/15 text-red-400 border-red-500/30">
                                URGENT
                              </span>
                            )}
                            {task.priority === "HIGH" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-amber-500/15 text-amber-400 border-amber-500/30">
                                HIGH
                              </span>
                            )}
                            {task.priority === "MEDIUM" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-blue-500/15 text-blue-400 border-blue-500/30">
                                MEDIUM
                              </span>
                            )}
                            {task.priority === "LOW" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-500/15 text-slate-400 border-slate-500/30">
                                LOW
                              </span>
                            )}

                            {/* Status Quick Badge / Selector */}
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(task)}
                              disabled={isUpdating}
                              title="Klik untuk memajukan status"
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 transition-all hover:scale-105",
                                task.status === "TODO" &&
                                  "bg-slate-500/15 text-slate-300 border-slate-500/30",
                                task.status === "IN_PROGRESS" &&
                                  "bg-blue-500/15 text-blue-400 border-blue-500/30",
                                task.status === "BLOCKED" &&
                                  "bg-red-500/15 text-red-400 border-red-500/30",
                                task.status === "DONE" &&
                                  "bg-neon/15 text-neon border-neon/30"
                              )}
                            >
                              <span>{task.status.replace("_", " ")}</span>
                              <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                            </button>

                            {/* Due Date Pill */}
                            {dueMeta && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1",
                                  dueMeta.isOverdue
                                    ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                                    : dueMeta.isToday
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold"
                                    : "bg-card border-card-border text-muted-foreground"
                                )}
                              >
                                {dueMeta.isOverdue ? (
                                  <>
                                    <AlertCircle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                                    <span>Terlewat: {dueMeta.formatted}</span>
                                  </>
                                ) : dueMeta.isToday ? (
                                  <>
                                    <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    <span>Hari Ini</span>
                                  </>
                                ) : (
                                  <>
                                    <Calendar className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                    <span>{dueMeta.formatted}</span>
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p
                            className={cn(
                              "text-xs text-muted-foreground leading-relaxed pr-8",
                              isDone && "line-through opacity-70"
                            )}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Delete Action Button */}
                      <button
                        type="button"
                        onClick={() => setTaskToDelete(task)}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Hapus task"
                        aria-label="Hapus task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

      {/* Add Task Dialog */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employmentId={employmentId}
        onSuccess={() => {
          setIsDialogOpen(false);
          onRefresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !isDeleting && setTaskToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-card border border-card-border rounded-3xl shadow-2xl z-10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Hapus Task Sprint?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-card-border text-xs text-foreground font-medium">
              &quot;{taskToDelete.title}&quot;
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border-card-border text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
