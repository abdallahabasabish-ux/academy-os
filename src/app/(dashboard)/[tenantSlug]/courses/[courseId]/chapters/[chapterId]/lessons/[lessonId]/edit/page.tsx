'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { LessonForm } from '@/components/courses/LessonForm';

export default function EditLessonPage({ params }: { 
  params: { tenantSlug: string; courseId: string; chapterId: string; lessonId: string } 
}) {
  const { tenantSlug, courseId, chapterId, lessonId } = params;
  const { tenant } = useTenant(tenantSlug);
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      fetchLesson();
    }
  }, [tenant, lessonId]);

  const fetchLesson = async () => {
    if (!tenant) return;
    try {
      const data = await courseService.getLesson(tenant.id, courseId, chapterId, lessonId);
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.updateLesson(tenant.id, courseId, chapterId, lessonId, data);
      router.push(`/${tenantSlug}/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">تعديل الدرس</h1>
        <p className="text-muted-foreground">تحديث بيانات الدرس</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <LessonForm
          onSubmit={handleSubmit}
          defaultValues={lesson ? {
            title: lesson.title,
            description: lesson.description,
            videoType: lesson.video?.type || 'youtube',
            videoUrl: lesson.video?.url || '',
            order: lesson.order,
            status: lesson.status,
            preventForwarding: lesson.settings?.preventForwarding || false,
            preventSkipping: lesson.settings?.preventSkipping || false,
            requiredWatchTime: lesson.settings?.requiredWatchTime || 80,
            requireCompletion: lesson.settings?.requireCompletion || true,
            allowReplay: lesson.settings?.allowReplay || true,
            showSpeedControl: lesson.settings?.showSpeedControl || true,
            allowFullscreen: lesson.settings?.allowFullscreen || true,
          } : undefined}
          isLoading={isSubmitting}
          onCancel={() => router.push(`/${tenantSlug}/courses/${courseId}`)}
        />
      </div>
    </div>
  );
}
