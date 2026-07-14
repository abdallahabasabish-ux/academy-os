'use client';

interface RecentActivityProps {
  tenantId: string;
}

export function RecentActivity({ tenantId }: RecentActivityProps) {
  const activities = [
    { id: 1, action: 'تم تسجيل طالب جديد: أحمد محمد', time: 'منذ 5 دقائق', type: 'student' },
    { id: 2, action: 'تم نشر كورس: أساسيات البرمجة', time: 'منذ ساعة', type: 'course' },
    { id: 3, action: 'دفع فاتورة بقيمة 250 ريال', time: 'منذ 3 ساعات', type: 'payment' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">آخر النشاطات</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-gray-800">{activity.action}</p>
              <p className="text-gray-400 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
