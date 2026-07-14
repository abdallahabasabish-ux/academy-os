'use client';

import { useEffect, useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function DashboardPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant, isLoading } = useTenant(tenantSlug);

  if (isLoading || !tenant) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          <p className="text-muted-foreground">لوحة التحكم الرئيسية</p>
        </div>
        <button className="btn-primary">+ إنشاء كورس جديد</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="الطلاب" value="0" icon="👨‍🎓" trend="+0% this month" />
        <StatsCard title="الكورسات" value="0" icon="📚" trend="+0 new" />
        <StatsCard title="الإيرادات" value="$0" icon="💰" trend="+0%" />
        <StatsCard title="معدل الإكمال" value="0%" icon="📈" trend="+0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RevenueChart tenantId={tenant.id} /></div>
        <div className="lg:col-span-1"><RecentActivity tenantId={tenant.id} /></div>
      </div>
    </div>
  );
}
