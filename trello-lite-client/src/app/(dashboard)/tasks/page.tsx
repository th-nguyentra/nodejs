'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi, GetTasksParams } from '@/lib/api/tasks';
import { KanbanColumns } from '@/components/tasks/KanbanColumns';
import { Filter, X } from 'lucide-react';

export default function TasksPage() {
  const [filters, setFilters] = useState<GetTasksParams>({ limit: 100 });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
  });

  const hasActiveFilters = !!(filters.dueDate || filters.assigneeId);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      <div className="border-b border-black/10 bg-white/20 px-4 py-2 flex items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-800">All Tasks</h1>
        <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
          {data?.meta?.total ?? 0}
        </span>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`ml-2 flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ limit: 100 })}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        {showFilters && (
          <div className="ml-2 flex items-center gap-2">
            <input
              type="date"
              value={filters.dueDate ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, dueDate: e.target.value || undefined }))}
              className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-4 overflow-auto">
        {isLoading ? (
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-72 shrink-0">
                <div className="h-8 animate-pulse rounded-lg bg-gray-300 mb-2" />
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="h-20 animate-pulse rounded-lg bg-gray-200 mb-2" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <KanbanColumns tasks={data?.data ?? []} />
        )}
      </div>
    </div>
  );
}
