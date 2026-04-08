'use client';

import { TaskStatus } from '@/types';
import { GetTasksParams } from '@/lib/api/tasks';
import { Button } from '@/components/ui/Button';

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

interface TaskFiltersProps {
  filters: GetTasksParams;
  onChange: (filters: GetTasksParams) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => onChange({ ...filters, status: undefined, page: 1 })}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            !filters.status ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange({ ...filters, status: s.value, page: 1 })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              filters.status === s.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={filters.dueDate ?? ''}
        onChange={(e) => onChange({ ...filters, dueDate: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {(filters.status || filters.dueDate || filters.assigneeId) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ page: 1, limit: filters.limit })}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
