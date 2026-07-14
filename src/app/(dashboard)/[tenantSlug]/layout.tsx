'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/lib/auth/auth.service';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  params: { tenantSlug: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { tenantSlug } = params;
  const { tenant, isLoading } = useTenant(tenantSlug);
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: `/${tenantSlug}/dashboard`, icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: `/${tenantSlug}/courses`, icon: BookOpen, label: 'الكورسات' },
    { path: `/${tenantSlug}/students`, icon: Users, label: 'الطلاب' },
    { path: `/${tenantSlug}/settings`, icon: Settings, label: 'الإعدادات' },
  ];

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* القائمة الجانبية */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white shadow-xl z-50 transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
        lg:w-64 lg:relative lg:shadow-sm
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              {tenant?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-sm line-clamp-1">{tenant?.name}</p>
              <p className="text-xs text-gray-400">@{tenantSlug}</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-red-50 text-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className={`
        transition-all duration-300
        ${isSidebarOpen ? 'lg:mr-64' : 'lg:mr-0'}
      `}>
        {/* شريط العلوي */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-sm font-medium text-gray-500">
            {tenant?.name || 'Academy OS'}
          </h1>
        </header>

        <div className="p-4">
          {children}
        </div>
      </main>

      {/* الخلفية المظللة للقائمة على الموبايل */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
