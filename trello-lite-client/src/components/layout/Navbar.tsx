'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LayoutDashboard, CheckSquare, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header style={{ background: 'var(--trello-navy)' }} className="flex h-12 items-center px-4 gap-2 shrink-0">
      {/* Logo */}
      <Link href="/boards" className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition mr-1">
        <svg className="h-5 w-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-10 9H5V5h6v7zm8 4h-6V5h6v11z"/>
        </svg>
        <span className="text-white font-bold text-sm tracking-wide">Trello Lite</span>
      </Link>

      {/* Nav links */}
      <NavLink href="/boards" icon={<LayoutDashboard className="h-4 w-4" />} label="Boards" />
      <NavLink href="/tasks" icon={<CheckSquare className="h-4 w-4" />} label="Tasks" />

      <div className="flex-1" />

      {/* User */}
      <div className="flex items-center gap-2">
        {user?.role === 'ADMIN' && (
          <span className="rounded-sm bg-[#0C66E4] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Admin
          </span>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#579DFF] text-sm font-bold text-[#1D2125]">
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="text-sm text-white/80 hidden sm:block">{user?.username}</span>
        <button
          onClick={handleLogout}
          className="ml-1 rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
    >
      {icon}
      {label}
    </Link>
  );
}
