'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Board } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BoardFormProps {
  defaultValues?: Partial<Board>;
  onSubmit: (data: FormValues) => Promise<void>;
  loading: boolean;
}

export function BoardForm({ defaultValues, onSubmit, loading }: BoardFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Board name"
        placeholder="e.g. Marketing Q2"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Description"
        placeholder="Optional"
        error={errors.description?.message}
        {...register('description')}
      />
      <Button type="submit" loading={loading} className="w-full">
        {defaultValues?.id ? 'Update board' : 'Create board'}
      </Button>
    </form>
  );
}
