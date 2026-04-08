'use client';

import Link from 'next/link';
import { Board } from '@/types';
import { useAuthStore } from '@/store/auth';
import { Pencil, Trash2 } from 'lucide-react';

const BOARD_COLORS = [
  'linear-gradient(135deg,#0052CC,#0747A6)',
  'linear-gradient(135deg,#00875A,#006644)',
  'linear-gradient(135deg,#FF5630,#DE350B)',
  'linear-gradient(135deg,#6554C0,#403294)',
  'linear-gradient(135deg,#00B8D9,#0065FF)',
  'linear-gradient(135deg,#FF7452,#FF5630)',
  'linear-gradient(135deg,#36B37E,#00875A)',
  'linear-gradient(135deg,#8777D9,#6554C0)',
];

function getBoardColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return BOARD_COLORS[Math.abs(hash) % BOARD_COLORS.length];
}

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const bg = getBoardColor(board.id);

  return (
    <div
      className="group relative h-24 rounded-lg overflow-hidden cursor-pointer"
      style={{ background: bg }}
    >
      <Link href={`/boards/${board.id}`} className="absolute inset-0 p-3 flex flex-col justify-between">
        <span className="text-white font-semibold text-sm leading-tight line-clamp-2">
          {board.name}
        </span>
        {board.description && (
          <span className="text-white/60 text-xs line-clamp-1">{board.description}</span>
        )}
      </Link>

      {isAdmin && (
        <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-0.5">
          <button
            onClick={(e) => { e.preventDefault(); onEdit(board); }}
            className="rounded p-1 bg-black/20 text-white hover:bg-black/40 transition"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(board); }}
            className="rounded p-1 bg-black/20 text-white hover:bg-red-500/80 transition"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
