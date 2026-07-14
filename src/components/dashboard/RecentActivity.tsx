export function RecentActivity({ tenantId }: { tenantId: string }) {
  const activities = [{ id: 1, action: 'تم تسجيل طالب جديد: أحمد', time: 'منذ 5 دقائق' }, { id: 2, action: 'تم نشر كورس: أساسيات البرمجة', time: 'منذ ساعة' }];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border"><h3 className="text-lg font-semibold mb-4">آخر النشاطات</h3><div className="space-y-3">{activities.map((a) => (<div key={a.id} className="flex items-start gap-3 text-sm"><div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" /><div><p className="text-gray-800">{a.action}</p><p className="text-gray-400 text-xs">{a.time}</p></div></div>))}</div></div>
  );
}
