'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi, GetTasksParams } from '@/lib/api/tasks';
import { StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Calendar, User, ArrowUpDown } from 'lucide-react';

const LIMIT = 20;

export default function TasksPage() {
  const [filters, setFilters] = useState<GetTasksParams>({
    page: 1,
    limit: LIMIT,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
  });

  const tasks = data?.data ?? [];
  const meta = data?.meta;

  const updateFilters = (patch: Partial<GetTasksParams>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const hasActiveFilters = !!(filters.status || filters.startDate || filters.endDate);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Filter bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-800 mr-1">All Tasks</h1>

        {meta && (
          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
            {meta.total}
          </span>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
          {([undefined, 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
            <button
              key={s ?? 'all'}
              onClick={() => updateFilters({ status: s })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filters.status === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {s === undefined ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s === 'TODO' ? 'Todo' : 'Done'}
            </button>
          ))}
        </div>

        {/* Due date range */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => updateFilters({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          className="flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowUpDown className="h-3 w-3" />
          {filters.order === 'asc' ? 'Oldest first' : 'Newest first'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ page: 1, limit: LIMIT, sortBy: 'createdAt', order: filters.order })}
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">No tasks found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="pb-2 text-left pr-4">Title</th>
                <th className="pb-2 text-left pr-4 w-32">Status</th>
                <th className="pb-2 text-left pr-4 w-36">Assignee</th>
                <th className="pb-2 text-left pr-4 w-32">Due Date</th>
                <th className="pb-2 text-left w-36">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => {
                const isOverdue =
                  task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>
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
                          <span className="text-gray-700 truncate">{task.assignee.username}</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <User className="h-3.5 w-3.5" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      {task.dueDate ? (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      )}
    </div>
  );
}
