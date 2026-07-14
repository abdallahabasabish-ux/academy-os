'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { studentService } from '@/services/student.service';
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, Award, DollarSign } from 'lucide-react';

export default function StudentProfilePage({ params }: { params: { tenantSlug: string; studentId: string } }) {
  const { tenantSlug, studentId } = params;
  const { tenant } = useTenant(tenantSlug);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (tenant) fetchStudent(); }, [tenant]);

  const fetchStudent = async () => {
    if (!tenant) return;
    try {
      const data = await studentService.getStudent(tenant.id, studentId);
      setStudent(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!student) return <div className="text-center py-12">الطالب غير موجود</div>;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <Link href={`/${tenantSlug}/students`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary"><ArrowLeft className="w-4 h-4" /> العودة</Link>
      <div className="bg-white rounded-2xl shadow-sm p-6 border">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl">{student.name?.charAt(0)}</div>
          <div><h1 className="text-2xl font-bold">{student.name}</h1><p className="text-gray-500">{student.email}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border"><h3 className="font-semibold mb-4">معلومات الاتصال</h3><div className="space-y-3"><div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" />{student.email}</div>{student.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" />{student.phone}</div>}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-6 border"><h3 className="font-semibold mb-4">إحصائيات</h3><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-500">الكورسات</p><p className="text-2xl font-bold">{student.enrolledCourses?.length || 0}</p></div><div><p className="text-sm text-gray-500">مكتملة</p><p className="text-2xl font-bold text-green-600">{student.completedCourses?.length || 0}</p></div></div></div>
      </div>
    </div>
  );
}
