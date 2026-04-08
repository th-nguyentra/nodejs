"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.email("Invalid email"),
});

type FormValues = z.infer<typeof schema>;

interface InviteFormProps {
  boardId: string;
  onSubmit: (data: { email: string; boardId: string }) => Promise<void>;
  loading: boolean;
}

export function InviteForm({ boardId, onSubmit, loading }: InviteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({ ...data, boardId });
        reset();
      })}
      className="flex flex-col gap-4"
    >
      <Input
        label="Email address"
        type="email"
        placeholder="member@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" loading={loading} className="w-full">
        Send invitation
      </Button>
    </form>
  );
}
