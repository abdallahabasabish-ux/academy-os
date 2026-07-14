'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, CourseFormData } from '@/lib/validators/course.schema';

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => Promise<void>;
  defaultValues?: Partial<CourseFormData>;
  isLoading?: boolean;
}

export function CourseForm({ onSubmit, defaultValues, isLoading = false }: CourseFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: defaultValues || { isFree: false, level: 'beginner', status: 'draft' },
  });

  const isFree = watch('isFree');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div><label className="block text-sm font-medium mb-1">العنوان *</label><input {...register('title')} className="w-full px-3 py-2 border rounded-lg" />{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}</div>
      <div><label className="block text-sm font-medium mb-1">الوصف *</label><textarea {...register('description')} rows={4} className="w-full px-3 py-2 border rounded-lg" />{errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">السعر</label><input {...register('price', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-lg" /></div>
        <div className="flex items-center gap-2 mt-6"><input {...register('isFree')} type="checkbox" /><label>مجاني</label></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">المستوى</label><select {...register('level')} className="w-full px-3 py-2 border rounded-lg"><option value="beginner">مبتدئ</option><option value="intermediate">متوسط</option><option value="advanced">متقدم</option></select></div>
      <div><label className="block text-sm font-medium mb-1">التصنيف</label><input {...register('category')} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div><label className="block text-sm font-medium mb-1">صورة الغلاف</label><input {...register('image')} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div><label className="block text-sm font-medium mb-1">الحالة</label><select {...register('status')} className="w-full px-3 py-2 border rounded-lg"><option value="draft">مسودة</option><option value="published">منشور</option></select></div>
      <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50">{isLoading ? 'جاري الحفظ...' : 'حفظ الكورس'}</button>
    </form>
  );
}
