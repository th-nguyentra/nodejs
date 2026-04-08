import { Task } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Assignee</th>
            <th className="px-4 py-3 text-left font-medium">Due Date</th>
            <th className="px-4 py-3 text-left font-medium">Board</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                <div className="line-clamp-1">{task.title}</div>
                {task.description && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                    {task.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {task.assignee?.username ?? <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {task.boardId.slice(0, 8)}…
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
