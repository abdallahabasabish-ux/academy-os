'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const studentFormSchema = z.object({
  name: z.string().min(3, 'الاسم مطلوب'),
  email: z.string().email('بريد غير صحيح'),
  phone: z.string().optional(),
  educationLevel: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('pending'),
  metadata: z.object({ country: z.string().optional(), city: z.string().optional() }).optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps { onSubmit: (data: StudentFormData) => Promise<void>; defaultValues?: Partial<StudentFormData>; isLoading?: boolean; onCancel?: () => void; }

export function StudentForm({ onSubmit, defaultValues, isLoading = false, onCancel }: StudentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: defaultValues || { status: 'pending' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">الاسم *</label><input {...register('name')} className="w-full px-3 py-2 border rounded-lg" />{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}</div>
        <div><label className="block text-sm font-medium mb-1">البريد *</label><input {...register('email')} type="email" className="w-full px-3 py-2 border rounded-lg" />{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}</div>
        <div><label className="block text-sm font-medium mb-1">الهاتف</label><input {...register('phone')} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">المرحلة</label><select {...register('educationLevel')} className="w-full px-3 py-2 border rounded-lg"><option value="">اختر</option><option value="ابتدائي">ابتدائي</option><option value="متوسط">متوسط</option><option value="ثانوي">ثانوي</option><option value="جامعي">جامعي</option></select></div>
        <div><label className="block text-sm font-medium mb-1">الصف</label><input {...register('grade')} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">الحالة</label><select {...register('status')} className="w-full px-3 py-2 border rounded-lg"><option value="pending">قيد الانتظار</option><option value="active">نشط</option><option value="suspended">موقوف</option></select></div>
      </div>
      <div className="flex gap-3"><button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">{isLoading ? 'جاري الحفظ...' : 'حفظ الطالب'}</button>{onCancel && <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>}</div>
    </form>
  );
}
