'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Task, TaskStatus, BoardMember } from '@/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  task?: Task;
  initialStatus?: TaskStatus;
  members: BoardMember[];
  isAdmin: boolean;
  currentUserId: string;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  onDelete?: () => void;
  loading: boolean;
  deleting?: boolean;
}

export function TaskFormModal({
  open,
  onClose,
  mode,
  task,
  initialStatus = 'TODO',
  members,
  isAdmin,
  currentUserId,
  onSubmit,
  onDelete,
  loading,
  deleting,
}: TaskFormModalProps) {
  const isAssignee = task?.assignee?.id === currentUserId;
  const canChangeStatus = isAdmin || isAssignee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? initialStatus,
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task?.assignee?.id ?? '',
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create Task' : 'Edit Task'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            placeholder="Add a description..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            {...register('description')}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              disabled={mode === 'edit' && !canChangeStatus}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              {...register('status')}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            {mode === 'edit' && !canChangeStatus && (
              <p className="text-[11px] text-gray-400">Only the assignee can change status</p>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              {...register('dueDate')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Assignee</label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            {...register('assigneeId')}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.user.id}>
                {m.user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          {isAdmin && mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
          <div className={`flex gap-2 ${isAdmin && mode === 'edit' ? '' : 'ml-auto'}`}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
