import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col" style={{ background: 'var(--trello-bg)' }}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
