"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api/boards";
import { invitationsApi } from "@/lib/api/invitations";
import { tasksApi } from "@/lib/api/tasks";
import { useAuthStore } from "@/store/auth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InviteForm } from "@/components/boards/InviteForm";
import { KanbanColumns } from "@/components/tasks/KanbanColumns";
import { Pagination } from "@/components/ui/Pagination";
import { GetTasksParams } from "@/lib/api/tasks";
import { UserPlus, ArrowLeft, Users, ArrowUpDown } from "lucide-react";
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

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [filters, setFilters] = useState<GetTasksParams>({
    boardId: id,
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
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

  const boardTasks = tasksData?.data ?? [];
  const meta = tasksData?.meta;

  const updateFilters = (patch: Partial<GetTasksParams>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const hasActiveFilters = !!(filters.status || filters.assigneeId || filters.dueDateFrom || filters.dueDateTo);

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

  if (boardLoading) {
    return (
      <div>
        <div className="h-28 animate-pulse bg-gray-300" />
        <div className="px-4 py-4 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <div className="h-8 animate-pulse rounded-lg bg-gray-300 mb-2" />
              {Array.from({ length: 2 }).map((__, j) => (
                <div
                  key={j}
                  className="h-20 animate-pulse rounded-lg bg-gray-200 mb-2"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!board) return <p className="p-6 text-gray-500">Board not found.</p>;

  const bg = getBoardBg(board.id);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 48px)" }}>
      {/* Board header banner */}
      <div
        className="relative h-14 flex items-center px-4 gap-3"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <Link
          href="/boards"
          className="relative rounded p-1 text-white/80 hover:bg-white/20 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="relative text-base font-bold text-white">
          {board.name}
        </h1>

        <div className="relative ml-auto flex items-center gap-2">
          {/* Members avatars */}
          <button
            onClick={() => setMembersOpen(true)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-white/80 hover:bg-white/20 transition"
          >
            <div className="flex -space-x-1.5">
              {board.members?.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-[#579DFF] text-[10px] font-bold text-white"
                  title={m.user.username}
                >
                  {m.user.username[0].toUpperCase()}
                </div>
              ))}
              {(board.members?.length ?? 0) > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-black/30 text-[10px] font-bold text-white">
                  +{(board.members?.length ?? 0) - 3}
                </div>
              )}
            </div>
            <Users className="h-3.5 w-3.5" />
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setInviteOpen(true);
                setInviteSuccess(false);
              }}
              className="flex items-center gap-1.5 rounded bg-white/20 px-3 py-1 text-sm font-medium text-white hover:bg-white/30 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Kanban area */}
      <div
        className="flex-1 flex flex-col overflow-auto"
        style={{
          background: `${bg.split(",")[0].replace("linear-gradient(135deg", "linear-gradient(160deg")}99, #1D2125)`,
        }}
      >
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/20">
          {/* Status */}
          <div className="flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5">
            {([undefined, "TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
              <button
                key={s ?? "all"}
                onClick={() => updateFilters({ status: s })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filters.status === s
                    ? "bg-white text-gray-900"
                    : "text-white/70 hover:text-white hover:bg-white/10"
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
            className="rounded-md bg-white/10 border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50"
          >
            <option value="" className="text-gray-900">All assignees</option>
            {board?.members?.map((m) => (
              <option key={m.id} value={m.user.id} className="text-gray-900">
                {m.user.username}
              </option>
            ))}
          </select>

          {/* Due date range */}
          <input
            type="date"
            value={filters.dueDateFrom ?? ""}
            onChange={(e) => updateFilters({ dueDateFrom: e.target.value || undefined })}
            className="rounded-md bg-white/10 border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50"
            placeholder="From"
          />
          <span className="text-white/50 text-xs">–</span>
          <input
            type="date"
            value={filters.dueDateTo ?? ""}
            onChange={(e) => updateFilters({ dueDateTo: e.target.value || undefined })}
            className="rounded-md bg-white/10 border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50"
            placeholder="To"
          />

          {/* Sort */}
          <button
            onClick={() => updateFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
            className="flex items-center gap-1 rounded-md bg-white/10 border border-white/20 px-2.5 py-1 text-xs text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            <ArrowUpDown className="h-3 w-3" />
            {filters.sortOrder === "asc" ? "Oldest first" : "Newest first"}
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={() =>
                setFilters({ boardId: id, page: 1, limit: filters.limit, sortBy: "createdAt", sortOrder: filters.sortOrder })
              }
              className="text-xs text-white/60 hover:text-white transition"
            >
              Clear filters
            </button>
          )}

          {meta && (
            <span className="ml-auto text-xs text-white/50">{meta.total} tasks</span>
          )}
        </div>

        {/* Kanban columns */}
        <div className="flex-1 px-4 py-4 overflow-auto">
          {tasksLoading ? (
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-72 shrink-0">
                  <div className="h-8 animate-pulse rounded-lg bg-white/20 mb-2" />
                  {Array.from({ length: 2 }).map((__, j) => (
                    <div key={j} className="h-20 animate-pulse rounded-lg bg-white/10 mb-2" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <KanbanColumns tasks={boardTasks} />
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/10 bg-black/20">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        )}
      </div>

      {/* Members modal */}
      <Modal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        title={`Members · ${board.members?.length ?? 0}`}
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {board.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052CC] text-sm font-bold text-white">
                {member.user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-800">
                {member.user.username}
              </span>
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
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">Invitation sent!</p>
            <p className="mt-1 text-sm text-gray-500">
              The link expires in 7 days.
            </p>
            <Button className="mt-4" onClick={() => setInviteSuccess(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <>
            {inviteError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {inviteError}
              </p>
            )}
            <InviteForm
              boardId={id}
              onSubmit={async (data) => {
                await inviteMutation.mutateAsync(data);
              }}
              loading={inviteMutation.isPending}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
