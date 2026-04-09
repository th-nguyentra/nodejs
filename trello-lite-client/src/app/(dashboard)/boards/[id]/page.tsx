"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api/boards";
import { invitationsApi } from "@/lib/api/invitations";
import { tasksApi, GetTasksParams } from "@/lib/api/tasks";
import { useAuthStore } from "@/store/auth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InviteForm } from "@/components/boards/InviteForm";
import { TaskFormModal, TaskFormValues } from "@/components/tasks/TaskFormModal";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/Badge";
import { Task, TaskStatus } from "@/types";
import {
  UserPlus,
  ArrowLeft,
  Users,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const BG_GRADIENTS = [
  "linear-gradient(135deg,#0052CC,#0747A6)",
  "linear-gradient(135deg,#00875A,#006644)",
  "linear-gradient(135deg,#FF5630,#DE350B)",
  "linear-gradient(135deg,#6554C0,#403294)",
  "linear-gradient(135deg,#00B8D9,#0065FF)",
];

function getBoardBg(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return BG_GRADIENTS[Math.abs(hash) % BG_GRADIENTS.length];
}

const LIMIT = 20;

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");
  const queryClient = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("TODO");

  const [filters, setFilters] = useState<GetTasksParams>({
    boardId: id,
    page: 1,
    limit: LIMIT,
    sortBy: "createdAt",
    order: "desc",
  });

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: () => boardsApi.getBoardById(id),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.getTasks(filters),
    enabled: !!id,
  });

  const tasks = tasksData?.data ?? [];
  const meta = tasksData?.meta;

  const updateFilters = (patch: Partial<GetTasksParams>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const hasActiveFilters = !!(
    filters.status ||
    filters.assigneeId ||
    filters.startDate ||
    filters.endDate
  );

  const invalidateTasks = () =>
    queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const inviteMutation = useMutation({
    mutationFn: invitationsApi.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", id] });
      setInviteSuccess(true);
      setInviteError("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to send invitation";
      setInviteError(msg);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => invalidateTasks(),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Parameters<typeof tasksApi.updateTask>[1];
    }) => tasksApi.updateTask(taskId, data),
    onSuccess: () => invalidateTasks(),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      invalidateTasks();
      setTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setInitialStatus("TODO");
    setTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const toISODate = (date?: string) =>
    date ? new Date(date).toISOString() : undefined;

  const handleTaskSubmit = async (values: TaskFormValues) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        taskId: editingTask.id,
        data: {
          title: values.title,
          description: values.description || undefined,
          status: values.status,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          assigneeId: values.assigneeId || null,
        },
      });
    } else {
      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        dueDate: toISODate(values.dueDate),
        boardId: id,
        assigneeId: values.assigneeId || undefined,
      });
    }
    closeTaskModal();
  };

  const handleDeleteTask = () => {
    if (editingTask) deleteTaskMutation.mutate(editingTask.id);
  };

  const handleDeleteFromRow = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  if (boardLoading) {
    return (
      <div>
        <div className="h-14 animate-pulse bg-gray-300" />
        <div className="px-6 py-4 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!board) return <p className="p-6 text-gray-500">Board not found.</p>;

  const bg = getBoardBg(board.id);
  const members = board.members ?? [];

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 48px)" }}>
      {/* Board header */}
      <div
        className="relative h-14 flex items-center px-4 gap-3 shrink-0"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <Link
          href="/boards"
          className="relative rounded p-1 text-white/80 hover:bg-white/20 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="relative text-base font-bold text-white">{board.name}</h1>

        <div className="relative ml-auto flex items-center gap-2">
          <button
            onClick={() => setMembersOpen(true)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-white/80 hover:bg-white/20 transition"
          >
            <div className="flex -space-x-1.5">
              {members.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-[#579DFF] text-[10px] font-bold text-white"
                  title={m.user.username}
                >
                  {m.user.username[0].toUpperCase()}
                </div>
              ))}
              {members.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-black/30 text-[10px] font-bold text-white">
                  +{members.length - 3}
                </div>
              )}
            </div>
            <Users className="h-3.5 w-3.5" />
          </button>

          {isAdmin && (
            <button
              onClick={() => { setInviteOpen(true); setInviteSuccess(false); }}
              className="flex items-center gap-1.5 rounded bg-white/20 px-3 py-1 text-sm font-medium text-white hover:bg-white/30 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-gray-200 bg-white shrink-0">
        {/* Status */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
          {([undefined, "TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => updateFilters({ status: s })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filters.status === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s === undefined ? "All" : s === "IN_PROGRESS" ? "In Progress" : s === "TODO" ? "Todo" : "Done"}
            </button>
          ))}
        </div>

        {/* Assignee */}
        <select
          value={filters.assigneeId ?? ""}
          onChange={(e) => updateFilters({ assigneeId: e.target.value || undefined })}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All assignees</option>
          {members.map((m) => (
            <option key={m.id} value={m.user.id}>{m.user.username}</option>
          ))}
        </select>

        {/* Due date range */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => updateFilters({ order: filters.order === "asc" ? "desc" : "asc" })}
          className="flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowUpDown className="h-3 w-3" />
          {filters.order === "asc" ? "Oldest first" : "Newest first"}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ boardId: id, page: 1, limit: LIMIT, sortBy: "createdAt", order: filters.order })}
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Clear filters
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {meta && (
            <span className="text-xs text-gray-400">{meta.total} tasks</span>
          )}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {tasksLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-400">No tasks yet.</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Create the first task
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="pb-2 text-left pr-4">Title</th>
                <th className="pb-2 text-left pr-4 w-32">Status</th>
                <th className="pb-2 text-left pr-4 w-36">Assignee</th>
                <th className="pb-2 text-left pr-4 w-32">Due Date</th>
                <th className="pb-2 text-left w-36">Created</th>
                <th className="pb-2 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  task.status !== "DONE" &&
                  new Date(task.dueDate) < new Date();
                return (
                  <tr
                    key={task.id}
                    className="group hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => openEditModal(task)}
                  >
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-2.5 pr-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0052CC] text-[10px] font-bold text-white shrink-0">
                            {task.assignee.username[0].toUpperCase()}
                          </span>
                          <span className="text-gray-700 truncate">
                            {task.assignee.username}
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <User className="h-3.5 w-3.5" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      {task.dueDate ? (
                        <span
                          className={`text-xs font-medium ${
                            isOverdue ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                          className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFromRow(task); }}
                            className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-6 py-3 shrink-0">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      )}

      {/* Task form modal */}
      <TaskFormModal
        key={editingTask?.id ?? `new-${initialStatus}`}
        open={taskModalOpen}
        onClose={closeTaskModal}
        mode={editingTask ? "edit" : "create"}
        task={editingTask ?? undefined}
        initialStatus={initialStatus}
        members={members}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onSubmit={handleTaskSubmit}
        onDelete={handleDeleteTask}
        loading={createTaskMutation.isPending || updateTaskMutation.isPending}
        deleting={deleteTaskMutation.isPending}
      />

      {/* Members modal */}
      <Modal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        title={`Members · ${members.length}`}
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052CC] text-sm font-bold text-white">
                {member.user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-800">{member.user.username}</span>
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              className="w-full"
              onClick={() => {
                setMembersOpen(false);
                setInviteOpen(true);
                setInviteSuccess(false);
              }}
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Invite member
            </Button>
          </div>
        )}
      </Modal>

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite to board"
      >
        {inviteSuccess ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">Invitation sent!</p>
            <p className="mt-1 text-sm text-gray-500">The link expires in 7 days.</p>
            <Button className="mt-4" onClick={() => setInviteSuccess(false)}>Send another</Button>
          </div>
        ) : (
          <>
            {inviteError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{inviteError}</p>
            )}
            <InviteForm
              boardId={id}
              onSubmit={async (data) => { await inviteMutation.mutateAsync(data); }}
              loading={inviteMutation.isPending}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
