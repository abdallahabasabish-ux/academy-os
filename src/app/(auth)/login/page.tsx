'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await authService.login(email, password);
      // Get tenant slug from user metadata or redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="text-sm text-gray-600">مرحباً بعودتك</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        <button disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          {isLoading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
      <p className="text-center text-sm">
        ليس لديك حساب؟ <Link href="/register" className="text-blue-600 font-medium">إنشاء أكاديمية</Link>
      </p>
    </div>
  );
}
