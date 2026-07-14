'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { BookOpen, Users, Award, Clock, PlayCircle } from 'lucide-react';

export default function PublicHomePage({ params }: { params: { locale: string; tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant } = useTenant(tenantSlug);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (tenant) {
      courseService.getCourses(tenant.id, { status: 'published' }).then(setCourses).catch(console.error);
    }
  }, [tenant]);

  if (!tenant) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-red-600">الأكاديمية غير موجودة</h1></div></div>;

  const primaryColor = tenant.colors?.primary || '#2563EB';

  return (
    <div className="min-h-screen bg-white" style={{ '--primary': primaryColor } as any}>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: primaryColor }}>{tenant.name.charAt(0)}</div>
            <span className="font-bold text-lg">{tenant.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${tenantSlug}/login`} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">تسجيل الدخول</Link>
            <Link href={`/${tenantSlug}/register`} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ backgroundColor: primaryColor }}>اشترك الآن</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{tenant.seo?.title || `مرحباً في ${tenant.name}`}</h1>
              <p className="text-lg text-gray-600 mt-4">{tenant.seo?.description || 'منصة تعليمية متكاملة'}</p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Link href={`/${tenantSlug}/courses`} className="px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 transition hover:opacity-90" style={{ backgroundColor: primaryColor }}><PlayCircle className="w-5 h-5" /> استكشف الكورسات</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border"><BookOpen className="w-6 h-6 text-primary" /><p className="text-2xl font-bold mt-3">{courses.length}</p><p className="text-sm text-gray-500">كورس</p></div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border mt-8"><Users className="w-6 h-6 text-primary" /><p className="text-2xl font-bold mt-3">0</p><p className="text-sm text-gray-500">طالب</p></div>
            </div>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">الكورسات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/${tenantSlug}/courses/${course.id}`} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"><BookOpen className="w-16 h-16 text-blue-400" /></div>
                <div className="p-5"><h3 className="font-semibold">{course.title}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p><div className="flex items-center justify-between mt-4 pt-4 border-t"><span className="font-bold" style={{ color: primaryColor }}>{course.isFree ? 'مجاني' : `${course.price} ريال`}</span></div></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
