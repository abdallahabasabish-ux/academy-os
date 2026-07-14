'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import styles from './page.module.css';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  status: 'draft' | 'published';
  level: string;
  category: string;
  image?: string;
  totalStudents: number;
}

export default function CoursesPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      fetchCourses(tenant.id);
    }
  }, [tenant]);

  const fetchCourses = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const data = await courseService.getCourses(tenantId);
      setCourses(data as Course[]);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (tenantLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الكورسات</h1>
          <p className="text-muted-foreground">إدارة جميع الكورسات في أكاديميتك</p>
        </div>
        <Link
          href={`/${tenantSlug}/courses/create`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          كورس جديد
        </Link>
      </div>

      {/* قائمة الكورسات */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد كورسات بعد</p>
          <Link
            href={`/${tenantSlug}/courses/create`}
            className="inline-block mt-4 text-primary hover:underline"
          >
            أنشئ أول كورس الآن
          </Link>
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              {/* صورة الغلاف */}
              <div className={styles.courseImage}>
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                  </div>
                )}
                <span className={`${styles.badge} ${course.status === 'published' ? styles.badgePublished : styles.badgeDraft}`}>
                  {course.status === 'published' ? 'منشور' : 'مسودة'}
                </span>
                {course.isFree && (
                  <span className={`${styles.badge} ${styles.badgeFree}`}>
                    مجاني
                  </span>
                )}
              </div>

              {/* المحتوى */}
              <div className={styles.courseContent}>
                <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-3 text-sm mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{course.category}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {course.level === 'beginner' && 'مبتدئ'}
                    {course.level === 'intermediate' && 'متوسط'}
                    {course.level === 'advanced' && 'متقدم'}
                  </span>
                  <span className="text-sm text-gray-500">{course.totalStudents || 0} طالب</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-lg font-bold text-primary">
                    {course.isFree ? 'مجاني' : `${course.price} ريال`}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/${tenantSlug}/courses/${course.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {}}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
