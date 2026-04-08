import { Task, TaskStatus } from '@/types';
import { KanbanCard } from './KanbanCard';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: '#091E42' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#0747A6' },
  { status: 'DONE', label: 'Done', color: '#006644' },
];

export function KanbanColumns({ tasks }: { tasks: Task[] }) {
  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className="kanban-board">
      {COLUMNS.map(({ status, label, color }) => {
        const col = byStatus(status);
        return (
          <div key={status} className="w-72 shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
              </div>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                {col.length}
              </span>
            </div>
            <div className="rounded-xl bg-[#EBECF0] p-2 flex flex-col gap-2 min-h-16">
              {col.length === 0 && (
                <p className="py-4 text-center text-xs text-gray-400">No tasks</p>
              )}
              {col.map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
