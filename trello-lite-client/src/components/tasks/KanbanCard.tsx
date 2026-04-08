import { Task } from '@/types';
import { Calendar, User } from 'lucide-react';

export function KanbanCard({ task }: { task: Task }) {
  const isOverdue =
    task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <div className="rounded-lg bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer">
      <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>

      {task.description && (
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
              isOverdue
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}

        {task.assignee && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#0052CC] text-[10px] font-bold text-white" title={task.assignee.username}>
            {task.assignee.username[0].toUpperCase()}
          </span>
        )}

        {!task.assignee && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400" title="Unassigned">
            <User className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
