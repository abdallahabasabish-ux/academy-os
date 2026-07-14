'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const lessonSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  description: z.string().optional(),
  videoType: z.enum(['youtube', 'vimeo', 'mp4', 'bunny', 'cloudflare']).default('youtube'),
  videoUrl: z.string().url('رابط غير صحيح'),
  order: z.number().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaultValues || { videoType: 'youtube', status: 'draft', requiredWatchTime: 80 },
  });

  const videoType = watch('videoType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div><label className="block text-sm font-medium mb-1">عنوان الدرس *</label><input {...register('title')} className="w-full px-3 py-2 border rounded-lg" />{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}</div>
      <div><label className="block text-sm font-medium mb-1">الوصف</label><textarea {...register('description')} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">مصدر الفيديو</label><select {...register('videoType')} className="w-full px-3 py-2 border rounded-lg"><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="mp4">MP4</option><option value="bunny">Bunny.net</option><option value="cloudflare">Cloudflare</option></select></div>
        <div><label className="block text-sm font-medium mb-1">رابط الفيديو *</label><input {...register('videoUrl')} className="w-full px-3 py-2 border rounded-lg" placeholder={videoType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} />{errors.videoUrl && <p className="text-red-500 text-sm">{errors.videoUrl.message}</p>}</div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-sm">إعدادات الفيديو</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm"><input {...register('preventForwarding')} type="checkbox" /> منع التقديم</label>
          <label className="flex items-center gap-2 text-sm"><input {...register('preventSkipping')} type="checkbox" /> منع التخطي</label>
          <label className="flex items-center gap-2 text-sm"><input {...register('requireCompletion')} type="checkbox" /> إكمال الفيديو</label>
        </div>
        <div><label className="block text-sm font-medium mb-1">نسبة المشاهدة المطلوبة %</label><input {...register('requiredWatchTime', { valueAsNumber: true })} type="number" className="w-32 px-3 py-2 border rounded-lg" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">الترتيب</label><input {...register('order', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">الحالة</label><select {...register('status')} className="w-full px-3 py-2 border rounded-lg"><option value="draft">مسودة</option><option value="published">منشور</option></select></div>
      </div>
      <div className="flex gap-3"><button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">{isLoading ? 'جاري الحفظ...' : 'حفظ الدرس'}</button>{onCancel && <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">إلغاء</button>}</div>
    </form>
  );
}
