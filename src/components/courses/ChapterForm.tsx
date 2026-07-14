'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const chapterSchema = z.object({
  title: z.string().min(3, 'عنوان الفصل مطلوب'),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: defaultValues || {
      status: 'draft',
      order: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">عنوان الفصل *</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="مثال: أساسيات البرمجة"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الوصف</label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="وصف مختصر للفصل"
        />
      </div>

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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ الفصل'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
