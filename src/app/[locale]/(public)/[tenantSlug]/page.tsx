'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { BookOpen, Users, Award, Clock, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PublicHomePage({ params }: { params: { locale: string; tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const [courses, setCourses] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (tenant) {
      fetchPublicData(tenant.id);
    }
  }, [tenant]);

  const fetchPublicData = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const allCourses = await courseService.getCourses(tenantId, { status: 'published' });
      setCourses(allCourses);
      setFeaturedCourses(allCourses.slice(0, 3));
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCourses.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length);
  };

  if (tenantLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">الأكاديمية غير موجودة</h1>
          <p className="text-gray-500 mt-2">تأكد من الرابط أو تواصل مع الدعم</p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.colors?.primary || '#2563EB';

  return (
    <div className="min-h-screen bg-white" style={{ '--primary': primaryColor } as any}>
      {/* الهيدر */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="h-10 w-auto" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" 
                   style={{ backgroundColor: primaryColor }}>
                {tenant.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg">{tenant.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${tenantSlug}`} className="text-gray-700 hover:text-primary transition">الرئيسية</Link>
            <Link href={`/${tenantSlug}/courses`} className="text-gray-700 hover:text-primary transition">الكورسات</Link>
            <Link href={`/${tenantSlug}/about`} className="text-gray-700 hover:text-primary transition">عن الأكاديمية</Link>
            <Link href={`/${tenantSlug}/contact`} className="text-gray-700 hover:text-primary transition">تواصل</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/${tenantSlug}/login`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href={`/${tenantSlug}/register`}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition"
              style={{ backgroundColor: primaryColor }}
            >
              اشترك الآن
            </Link>
          </div>
        </div>
      </header>

      {/* الهيرو (Hero Section) */}
      <section className="relative overflow-hidden" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {tenant.seo?.title || `مرحباً في ${tenant.name}`}
              </h1>
              <p className="text-lg text-gray-600 mt-4">
                {tenant.seo?.description || 'منصة تعليمية متكاملة تقدم أفضل الكورسات في مجالات متعددة'}
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  href={`/${tenantSlug}/courses`}
                  className="px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  <PlayCircle className="w-5 h-5" />
                  استكشف الكورسات
                </Link>
                <Link
                  href={`/${tenantSlug}/about`}
                  className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  تعرف علينا
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 border">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                       style={{ backgroundColor: primaryColor }}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold mt-3">{courses.length}</p>
                  <p className="text-sm text-gray-500">كورس تعليمي</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border mt-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                       style={{ backgroundColor: primaryColor }}>
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold mt-3">100+</p>
                  <p className="text-sm text-gray-500">طالب مسجل</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border -mt-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                       style={{ backgroundColor: primaryColor }}>
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold mt-3">50+</p>
                  <p className="text-sm text-gray-500">شهادة معتمدة</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                       style={{ backgroundColor: primaryColor }}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold mt-3">200+</p>
                  <p className="text-sm text-gray-500">ساعة محتوى</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* الكورسات المميزة */}
      {featuredCourses.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">الكورسات المميزة</h2>
              <p className="text-gray-500">اختر ما يناسبك من كورساتنا</p>
            </div>
            <Link href={`/${tenantSlug}/courses`} className="text-sm font-medium hover:underline" style={{ color: primaryColor }}>
              عرض الكل ←
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/${tenantSlug}/courses/${course.id}`}
                  className="group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                    {course.isFree && (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        مجاني
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="font-bold" style={{ color: primaryColor }}>
                        {course.isFree ? 'مجاني' : `${course.price} ريال`}
                      </span>
                      <span className="text-sm text-gray-400">{course.totalStudents || 0} طالب</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold">ابدأ رحلة التعلم اليوم</h2>
          <p className="text-lg mt-2 opacity-90">انضم إلى آلاف الطلاب واستفد من الكورسات المميزة</p>
          <Link
            href={`/${tenantSlug}/register`}
            className="inline-block mt-6 px-8 py-3 bg-white rounded-lg font-medium transition hover:shadow-lg"
            style={{ color: primaryColor }}
          >
            سجل الآن مجاناً
          </Link>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg">{tenant.name}</h3>
              <p className="text-gray-400 text-sm mt-2">منصة تعليمية متكاملة</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={`/${tenantSlug}/courses`} className="hover:text-white transition">الكورسات</Link></li>
                <li><Link href={`/${tenantSlug}/about`} className="hover:text-white transition">عن الأكاديمية</Link></li>
                <li><Link href={`/${tenantSlug}/contact`} className="hover:text-white transition">تواصل معنا</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">تواصل</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 {tenant.socialLinks?.email || 'info@academy.com'}</li>
                <li>📞 {tenant.socialLinks?.phone || '+966 50 000 0000'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">تابعنا</h4>
              <div className="flex gap-3">
                {tenant.socialLinks?.twitter && (
                  <a href={tenant.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Twitter</a>
                )}
                {tenant.socialLinks?.instagram && (
                  <a href={tenant.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Instagram</a>
                )}
                {tenant.socialLinks?.youtube && (
                  <a href={tenant.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">YouTube</a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {tenant.name}. جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
