'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api/boards';
import { useAuthStore } from '@/store/auth';
import { Board } from '@/types';
import { BoardCard } from '@/components/boards/BoardCard';
import { BoardForm } from '@/components/boards/BoardForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Search } from 'lucide-react';

export default function BoardsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [deleteBoard, setDeleteBoard] = useState<Board | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['boards', { page, search }],
    queryFn: () => boardsApi.getBoards({ page, limit: 12, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: boardsApi.createBoard,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['boards'] }); setCreateOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string }) =>
      boardsApi.updateBoard(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['boards'] }); setEditBoard(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: boardsApi.deleteBoard,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['boards'] }); setDeleteBoard(null); },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Workspace header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0052CC] to-[#0747A6] text-white font-bold text-lg">
          {user?.username?.[0]?.toUpperCase() ?? 'W'}
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">
            {user?.username}&apos;s workspace
          </h1>
          <p className="text-xs text-gray-500">Free</p>
        </div>
      </div>

      {/* Your boards section */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-10 9H5V5h6v7zm8 4h-6V5h6v11z"/>
          </svg>
          Your boards
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search boards…"
              className="w-44 rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-300" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data?.data.map((board) => (
              <BoardCard key={board.id} board={board} onEdit={setEditBoard} onDelete={setDeleteBoard} />
            ))}

            {/* Create new board tile */}
            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-24 rounded-lg bg-gray-200 hover:bg-gray-300 transition flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-800"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Create new board</span>
              </button>
            )}

            {data?.data.length === 0 && !isAdmin && (
              <p className="col-span-full py-12 text-center text-sm text-gray-400">
                You have no boards yet. Ask an admin to invite you.
              </p>
            )}
          </div>

          {data?.meta && (
            <div className="mt-6">
              <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create board">
        <BoardForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={!!editBoard} onClose={() => setEditBoard(null)} title="Edit board">
        {editBoard && (
          <BoardForm
            defaultValues={editBoard}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editBoard.id, ...data }); }}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal open={!!deleteBoard} onClose={() => setDeleteBoard(null)} title="Delete board?">
        <p className="mb-5 text-sm text-gray-600">
          Deleting <span className="font-semibold">{deleteBoard?.name}</span> will remove all its tasks.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteBoard(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteBoard && deleteMutation.mutate(deleteBoard.id)}
          >
            Delete board
          </Button>
        </div>
      </Modal>
    </div>
  );
}
