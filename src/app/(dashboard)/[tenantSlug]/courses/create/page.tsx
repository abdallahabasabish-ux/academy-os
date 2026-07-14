'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { CourseForm } from '@/components/courses/CourseForm';
import { CourseFormData } from '@/lib/validators/course.schema';

export default function CreateCoursePage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant } = useTenant(tenantSlug);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CourseFormData) => {
    if (!tenant) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await courseService.createCourse(tenant.id, { ...data, instructorId: 'temp' });
      router.push(`/${tenantSlug}/courses`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">إنشاء كورس جديد</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow-md p-6">
        <CourseForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
