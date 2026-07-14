'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  DollarSign,
  MessageSquare,
  Calendar,
  Award,
  ShoppingBag,
  FileText,
  Globe,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { authService } from '@/lib/auth/auth.service';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  params: { tenantSlug: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { tenantSlug } = params;
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${tenantSlug}/login`);
    }
  }, [user, authLoading, tenantSlug, router]);

  const toggleMenu = (path: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedMenus(newExpanded);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push(`/${tenantSlug}/login`);
  };

  const navItems = [
    { path: `/${tenantSlug}`, icon: Home, label: 'الصفحة الرئيسية' },
    { path: `/${tenantSlug}/dashboard`, icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: `/${tenantSlug}/courses`, icon: BookOpen, label: 'الكورسات' },
    { path: `/${tenantSlug}/students`, icon: Users, label: 'الطلاب' },
    { 
      path: `/${tenantSlug}/crm`, 
      icon: MessageSquare, 
      label: 'CRM',
      children: [
        { path: `/${tenantSlug}/crm/leads`, icon: User, label: 'العملاء المحتملين' },
      ]
    },
    { 
      path: `/${tenantSlug}/erp`, 
      icon: DollarSign, 
      label: 'المالية',
      children: [
        { path: `/${tenantSlug}/erp/dashboard`, icon: FileText, label: 'لوحة المالية' },
      ]
    },
    { path: `/${tenantSlug}/exams`, icon: GraduationCap, label: 'الامتحانات' },
    { path: `/${tenantSlug}/certificates`, icon: Award, label: 'الشهادات' },
    { path: `/${tenantSlug}/store`, icon: ShoppingBag, label: 'المتجر' },
    { path: `/${tenantSlug}/calendar`, icon: Calendar, label: 'التقويم' },
    { path: `/${tenantSlug}/settings`, icon: Settings, label: 'الإعدادات' },
  ];

  if (tenantLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">الأكاديمية غير موجودة</h1>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.colors?.primary || '#2563EB';

  return (
    <div className="min-h-screen bg-background" style={{ '--primary': primaryColor } as any}>
      <aside
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 border-l",
          isSidebarOpen ? "w-72" : "w-0 -translate-x-full",
          "lg:translate-x-0 lg:shadow-sm lg:border-l-0 lg:border-r"
        )}
        style={{ width: isSidebarOpen ? '288px' : '0px' }}
      >
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-1">{tenant.name}</p>
              <p className="text-xs text-gray-400">@{tenantSlug}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-500">{tenant.status === 'active' ? 'نشطة' : 'موقفة'}</span>
          </div>
        </div>

        <div className="p-3 border-b">
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/${tenantSlug}/courses/create`} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition">
              <BookOpen className="w-3.5 h-3.5" />
              كورس جديد
            </Link>
            <Link href={`/${tenantSlug}`} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              <Globe className="w-3.5 h-3.5" />
              معاينة
            </Link>
          </div>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.path);

            if (hasChildren) {
              return (
                <div key={item.path} className="mb-1">
                  <button onClick={() => toggleMenu(item.path)} className={cn("flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition text-sm", isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-700')}>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", isActive ? 'text-primary' : 'text-gray-400')} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mr-4 pr-2 border-r-2 border-gray-100 space-y-0.5 mt-0.5">
                      {item.children.map((child) => (
                        <Link key={child.path} href={child.path} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm", pathname === child.path ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-gray-50 text-gray-600')}>
                          <child.icon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.path} href={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm", isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-700')}>
                <item.icon className={cn("w-4 h-4", isActive ? 'text-primary' : 'text-gray-400')} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-3 border-t bg-gray-50/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1">{user?.displayName || 'مستخدم'}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className={cn("transition-all duration-300 min-h-screen", isSidebarOpen ? "lg:mr-72" : "lg:mr-0")}>
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden sm:inline">{tenant.name}</span>
              <span className="hidden sm:inline text-gray-300">/</span>
              <span className="font-medium text-gray-700">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'لوحة التحكم'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${tenantSlug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة</span>
            </Link>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
