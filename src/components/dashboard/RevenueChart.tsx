'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ tenantId }: { tenantId: string }) {
  const data = [{ month: 'يناير', revenue: 4000 }, { month: 'فبراير', revenue: 3000 }, { month: 'مارس', revenue: 5000 }, { month: 'أبريل', revenue: 7000 }, { month: 'مايو', revenue: 6000 }, { month: 'يونيو', revenue: 8000 }];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border"><h3 className="text-lg font-semibold mb-4">الإيرادات الشهرية</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
  );
}
