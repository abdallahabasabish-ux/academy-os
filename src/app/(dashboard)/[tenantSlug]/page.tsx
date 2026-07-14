'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { tenantService } from '@/services/tenant.service';
import { courseService } from '@/services/course.service';
import { studentService } from '@/services/student.service';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Loader } from '@/components/ui/Loader';
import styles from './page.module.css';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  completionRate: number;
}

export default function DashboardPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { user, loading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!tenantLoading && tenant) {
      fetchDashboardData(tenant.id);
    }
  }, [user, authLoading, tenant, tenantLoading]);

  const fetchDashboardData = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const [students, courses, revenueStats] = await Promise.all([
        studentService.getStudents(tenantId),
        courseService.getCourses(tenantId, { status: 'published' }),
        tenantService.getTenantStatistics(tenantId),
      ]);

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalRevenue: revenueStats.totalRevenue || 0,
        completionRate: 0, // سنحسبها لاحقاً
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || tenantLoading || isLoading) {
    return <Loader fullScreen />;
  }

  if (!tenant) {
    return <div>Academy not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-arabic">{tenant.name}</h1>
          <p className="text-muted-foreground">لوحة التحكم الرئيسية</p>
        </div>
        <button className="btn-primary">+ إنشاء كورس جديد</button>
      </div>

      {/* Stats Grid */}
      <div className={styles.dashboardGrid}>
        <StatsCard 
          title="الطلاب" 
          value={stats?.totalStudents || 0} 
          icon="👨‍🎓" 
          trend="+12% this month"
        />
        <StatsCard 
          title="الكورسات" 
          value={stats?.totalCourses || 0} 
          icon="📚" 
          trend="+5 new this month"
        />
        <StatsCard 
          title="الإيرادات" 
          value={`$${stats?.totalRevenue || 0}`} 
          icon="💰" 
          trend="+23% this month"
        />
        <StatsCard 
          title="معدل الإكمال" 
          value={`${stats?.completionRate || 0}%`} 
          icon="📈" 
          trend="+8% from last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart tenantId={tenant.id} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity tenantId={tenant.id} />
        </div>
      </div>
    </div>
  );
}
