'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { invitationsApi } from '@/lib/api/invitations';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState, Suspense } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Min 3 characters').max(30, 'Max 30 characters'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState('');
  const prefillEmail = searchParams.get('email') ?? '';
  const inviteToken = searchParams.get('token') ?? '';
  const redirect = searchParams.get('redirect') ?? '/boards';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  });

  const onSubmit = async (data: FormValues) => {
    setApiError('');
    try {
      const res = await authApi.register(data);
      setAuth(res.data, res.access);
      if (inviteToken) {
        await invitationsApi.acceptInvitation(inviteToken);
      }
      router.push(redirect);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed';
      setApiError(msg);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F2F4] px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <svg className="h-8 w-8 text-[#0052CC] fill-current" viewBox="0 0 24 24">
            <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-10 9H5V5h6v7zm8 4h-6V5h6v11z"/>
          </svg>
          <span className="text-2xl font-bold text-[#172B4D]">Trello Lite</span>
        </div>
        <p className="text-sm text-gray-500">Sign up — it&apos;s free!</p>
      </div>

      <div className="w-full max-w-sm rounded-xl bg-white px-8 py-6 shadow-md">
        <h1 className="mb-5 text-center text-base font-semibold text-gray-700">
          Create your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            placeholder="Choose a username"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />
          {apiError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {apiError}
            </div>
          )}
          <Button type="submit" loading={isSubmitting} className="w-full mt-1" style={{ background: '#0052CC' }}>
            Sign up
          </Button>
        </form>

        <div className="mt-5 border-t border-gray-200 pt-5 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#0052CC] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
