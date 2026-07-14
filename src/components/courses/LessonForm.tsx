'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// مخطط التحقق للدرس
const lessonSchema = z.object({
  title: z.string().min(3, 'عنوان الدرس مطلوب'),
  description: z.string().optional(),
  videoType: z.enum(['youtube', 'vimeo', 'mp4', 'bunny', 'cloudflare']).default('youtube'),
  videoUrl: z.string().url('رابط الفيديو غير صحيح').min(1, 'رابط الفيديو مطلوب'),
  order: z.number().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
  // إعدادات الفيديو
  preventForwarding: z.boolean().default(false),
  preventSkipping: z.boolean().default(false),
  requiredWatchTime: z.number().min(0).max(100).default(80),
  requireCompletion: z.boolean().default(true),
  allowReplay: z.boolean().default(true),
  showSpeedControl: z.boolean().default(true),
  allowFullscreen: z.boolean().default(true),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  onSubmit: (data: LessonFormData) => Promise<void>;
  defaultValues?: Partial<LessonFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function LessonForm({ onSubmit, defaultValues, isLoading = false, onCancel }: LessonFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaultValues || {
      videoType: 'youtube',
      status: 'draft',
      preventForwarding: false,
      preventSkipping: false,
      requiredWatchTime: 80,
      requireCompletion: true,
      allowReplay: true,
      showSpeedControl: true,
      allowFullscreen: true,
    },
  });

  const videoType = watch('videoType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* العنوان */}
      <div>
        <label className="block text-sm font-medium mb-1">عنوان الدرس *</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="مثال: مقدمة في البرمجة"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* الوصف */}
      <div>
        <label className="block text-sm font-medium mb-1">الوصف</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="وصف مختصر لمحتوى الدرس"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* نوع الفيديو ورابطه */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">مصدر الفيديو</label>
          <select {...register('videoType')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="mp4">MP4 مباشر</option>
            <option value="bunny">Bunny.net</option>
            <option value="cloudflare">Cloudflare Stream</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رابط الفيديو *</label>
          <input
            {...register('videoUrl')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder={
              videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
              videoType === 'vimeo' ? 'https://vimeo.com/...' :
              'https://example.com/video.mp4'
            }
          />
          {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>}
        </div>
      </div>

      {/* إعدادات التحكم في الفيديو */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-sm">إعدادات التحكم في الفيديو</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input {...register('preventForwarding')} type="checkbox" />
            منع التقديم
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...register('preventSkipping')} type="checkbox" />
            منع التخطي
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...register('requireCompletion')} type="checkbox" />
            إكمال الفيديو قبل الانتقال
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...register('allowReplay')} type="checkbox" />
            السماح بإعادة المشاهدة
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...register('showSpeedControl')} type="checkbox" />
            إظهار سرعة التشغيل
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input {...register('allowFullscreen')} type="checkbox" />
            السماح بملء الشاشة
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            نسبة المشاهدة المطلوبة (%)
          </label>
          <input
            {...register('requiredWatchTime', { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />
          {errors.requiredWatchTime && <p className="text-red-500 text-sm mt-1">{errors.requiredWatchTime.message}</p>}
        </div>
      </div>

      {/* الترتيب والحالة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ترتيب العرض</label>
          <input
            {...register('order', { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الحالة</label>
          <select {...register('status')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
          </select>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ الدرس'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
