'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { courseSchema } from '@/lib/validators/course.schema';

// سننشئ هذا المخطط لاحقاً، لكننا سنضعه هنا مؤقتاً
const createCourseSchema = z.object({
  title: z.string().min(3, 'عنوان الكورس مطلوب'),
  description: z.string().min(10, 'الوصف يجب أن لا يقل عن 10 أحرف'),
  price: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
  isFree: z.boolean().default(false),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(1, 'التصنيف مطلوب'),
  image: z.string().url('رابط الصورة غير صحيح').optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

type CourseFormData = z.infer<typeof createCourseSchema>;

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => Promise<void>;
  defaultValues?: Partial<CourseFormData>;
  isLoading?: boolean;
}

export function CourseForm({ onSubmit, defaultValues, isLoading = false }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: defaultValues || {
      isFree: false,
      level: 'beginner',
      status: 'draft',
    },
  });

  const isFree = watch('isFree');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* العنوان */}
      <div>
        <label className="block text-sm font-medium mb-1">عنوان الكورس *</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="مثال: أساسيات البرمجة"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* الوصف */}
      <div>
        <label className="block text-sm font-medium mb-1">الوصف *</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="وصف مختصر عن محتوى الكورس"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* السعر */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">السعر</label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="0"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input {...register('isFree')} type="checkbox" id="isFree" />
          <label htmlFor="isFree" className="text-sm font-medium">كورس مجاني</label>
        </div>
      </div>

      {/* المستوى */}
      <div>
        <label className="block text-sm font-medium mb-1">المستوى</label>
        <select {...register('level')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدم</option>
        </select>
        {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
      </div>

      {/* التصنيف */}
      <div>
        <label className="block text-sm font-medium mb-1">التصنيف</label>
        <input
          {...register('category')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="مثال: برمجة، تصميم، تسويق"
        />
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
      </div>

      {/* صورة الغلاف */}
      <div>
        <label className="block text-sm font-medium mb-1">رابط صورة الغلاف</label>
        <input
          {...register('image')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="https://example.com/image.jpg"
        />
        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
      </div>

      {/* الحالة */}
      <div>
        <label className="block text-sm font-medium mb-1">الحالة</label>
        <select {...register('status')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
        </select>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ الكورس'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
