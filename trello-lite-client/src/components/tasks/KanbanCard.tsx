import { Task } from '@/types';
import { Calendar, User, Trash2, Pencil } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isAdmin?: boolean;
}

export function KanbanCard({ task, onEdit, onDelete, isAdmin }: KanbanCardProps) {
  const isOverdue =
    task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <div
      className="group rounded-lg bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer"
      onClick={() => onEdit?.(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug flex-1">{task.title}</p>
        {(onEdit || (isAdmin && onDelete)) && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="rounded p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="rounded p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
              isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}

        {task.assignee && (
          <span
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#0052CC] text-[10px] font-bold text-white"
            title={task.assignee.username}
          >
            {task.assignee.username[0].toUpperCase()}
          </span>
        )}

        {!task.assignee && (
          <span
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400"
            title="Unassigned"
          >
            <User className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
