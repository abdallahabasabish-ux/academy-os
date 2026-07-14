'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { LessonForm } from '@/components/courses/LessonForm';

export default function EditLessonPage({ params }: { params: { tenantSlug: string; courseId: string; chapterId: string; lessonId: string } }) {
  const { tenantSlug, courseId, chapterId, lessonId } = params;
  const { tenant } = useTenant(tenantSlug);
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { if (tenant) fetchLesson(); }, [tenant]);

  const fetchLesson = async () => {
    if (!tenant) return;
    try {
      const data = await courseService.getLesson(tenant.id, courseId, chapterId, lessonId);
      setLesson(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleSubmit = async (data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.updateLesson(tenant.id, courseId, chapterId, lessonId, data);
      router.push(`/${tenantSlug}/courses/${courseId}`);
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">تعديل الدرس</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <LessonForm onSubmit={handleSubmit} defaultValues={lesson ? {
          title: lesson.title,
          description: lesson.description,
          videoType: lesson.video?.type || 'youtube',
          videoUrl: lesson.video?.url || '',
          order: lesson.order,
          status: lesson.status,
        } : undefined} isLoading={isSubmitting} onCancel={() => router.push(`/${tenantSlug}/courses/${courseId}`)} />
      </div>
    </div>
  );
}
