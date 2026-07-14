'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { CourseForm } from '@/components/courses/CourseForm';
import { CourseFormData } from '@/lib/validators/course.schema';

export default function CreateCoursePage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CourseFormData) => {
    if (!tenant) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const courseId = await courseService.createCourse(tenant.id, {
        ...data,
        instructorId: 'temp', // سنستبدله لاحقاً بمعرف المستخدم الحالي
      });
      
      // التوجيه إلى صفحة الكورسات بعد النجاح
      router.push(`/${tenantSlug}/courses`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الكورس');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إنشاء كورس جديد</h1>
        <p className="text-muted-foreground">أدخل بيانات الكورس ثم احفظه</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <CourseForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
