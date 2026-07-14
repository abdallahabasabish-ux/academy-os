'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const chapterSchema = z.object({
  title: z.string().min(3, 'العنوان مطلوب'),
  description: z.string().optional(),
  order: z.number().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
  onSubmit: (data: ChapterFormData) => Promise<void>;
  defaultValues?: Partial<ChapterFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ChapterForm({ onSubmit, defaultValues, isLoading = false, onCancel }: ChapterFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: defaultValues || { status: 'draft', order: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">عنوان الفصل *</label><input {...register('title')} className="w-full px-3 py-2 border rounded-lg" />{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}</div>
      <div><label className="block text-sm font-medium mb-1">الوصف</label><textarea {...register('description')} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">الترتيب</label><input {...register('order', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">الحالة</label><select {...register('status')} className="w-full px-3 py-2 border rounded-lg"><option value="draft">مسودة</option><option value="published">منشور</option></select></div>
      </div>
      <div className="flex gap-3"><button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">{isLoading ? 'جاري الحفظ...' : 'حفظ الفصل'}</button>{onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>}</div>
    </form>
  );
}
