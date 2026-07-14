import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن لا يقل عن 3 أحرف' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صحيح' }),
  phone: z.string().min(10, { message: 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
  academyName: z.string().min(3, { message: 'اسم الأكاديمية يجب أن لا يقل عن 3 أحرف' }),
  username: z.string().min(3, { message: 'اسم المستخدم يجب أن لا يقل عن 3 أحرف' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'يحتوي على أحرف غير مسموحة' }),
  country: z.string().optional(),
  city: z.string().optional(),
  language: z.string().default('ar'),
  currency: z.string().default('SAR'),
  specialty: z.string().optional(),
  educationLevels: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
  agreeToTerms: z.boolean().refine(val => val === true, { message: 'يجب الموافقة على الشروط' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
