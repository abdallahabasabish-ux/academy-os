import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(3, 'عنوان الكورس مطلوب'),
  description: z.string().min(10, 'الوصف يجب أن لا يقل عن 10 أحرف'),
  price: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
  isFree: z.boolean().default(false),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(1, 'التصنيف مطلوب'),
  image: z.string().url('رابط الصورة غير صحيح').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string()).default([]),
  language: z.string().default('ar'),
  duration: z.number().default(0),
});

export type CourseFormData = z.infer<typeof courseSchema>;
