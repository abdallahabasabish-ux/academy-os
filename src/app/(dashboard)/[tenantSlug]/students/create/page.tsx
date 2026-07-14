'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { studentService } from '@/services/student.service';
import { StudentForm } from '@/components/students/StudentForm';

export default function CreateStudentPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant } = useTenant(tenantSlug);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await studentService.createStudent(tenant.id, data);
      router.push(`/${tenantSlug}/students`);
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">إضافة طالب جديد</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <StudentForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
