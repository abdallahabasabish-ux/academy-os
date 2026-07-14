'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/lib/validators/auth.schema';
import { authService } from '@/lib/auth/auth.service';

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      language: 'ar',
      currency: 'SAR',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(data);
      router.push(`/dashboard/${result.slug}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">إنشاء أكاديمية جديدة</h1>
        <p className="text-sm text-gray-600">أدخل بياناتك لبدء رحلتك التعليمية</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
          <input {...register('name')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input {...register('email')} type="email" className="w-full px-3 py-2 border rounded-lg" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
          <input {...register('phone')} className="w-full px-3 py-2 border rounded-lg" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input {...register('password')} type="password" className="w-full px-3 py-2 border rounded-lg" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">اسم الأكاديمية</label>
          <input {...register('academyName')} className="w-full px-3 py-2 border rounded-lg" />
          {errors.academyName && <p className="text-red-500 text-sm mt-1">{errors.academyName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">اسم المستخدم (الرابط الخاص بك)</label>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">academy.com/@</span>
            <input {...register('username')} className="flex-1 px-3 py-2 border rounded-lg" />
          </div>
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input {...register('agreeToTerms')} type="checkbox" />
          <label className="text-sm">أوافق على <Link href="/terms" className="text-blue-600">الشروط والأحكام</Link></label>
          {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {isLoading ? 'جاري إنشاء الحساب...' : '🚀 إنشاء الأكاديمية'}
        </button>
      </form>

      <p className="text-center text-sm">
        لديك حساب بالفعل؟ <Link href="/login" className="text-blue-600 font-medium">تسجيل الدخول</Link>
      </p>
    </div>
  );
}
