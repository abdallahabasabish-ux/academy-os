'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { studentService } from '@/services/student.service';
import { Plus, Search, Users, UserPlus, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from './page.module.css';

export default function StudentsPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const { tenant } = useTenant(tenantSlug);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (tenant) fetchStudents(); }, [tenant]);

  const fetchStudents = async () => {
    if (!tenant) return;
    try {
      setIsLoading(true);
      const data = await studentService.getStudents(tenant.id, { search: searchTerm || undefined });
      setStudents(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (tenant) fetchStudents(); }, [searchTerm]);

  const handleStatusChange = async (studentId: string, status: 'active' | 'suspended' | 'pending') => {
    if (!tenant) return;
    await studentService.updateStudentStatus(tenant.id, studentId, status);
    await fetchStudents();
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('حذف الطالب؟')) return;
    if (!tenant) return;
    await studentService.deleteStudent(tenant.id, studentId);
    await fetchStudents();
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">الطلاب</h1><p className="text-muted-foreground">إدارة جميع الطلاب</p></div>
        <Link href={`/${tenantSlug}/students/create`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          <UserPlus className="w-4 h-4" /> إضافة طالب
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد طلاب</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الطالب</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">البريد</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الحالة</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th></tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition border-b">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">{student.name?.charAt(0)}</div><div><p className="font-medium">{student.name}</p></div></div></td>
                  <td className="px-6 py-4 text-sm">{student.email}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${student.status === 'active' ? 'bg-green-100 text-green-700' : student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{student.status === 'active' ? 'نشط' : student.status === 'pending' ? 'قيد الانتظار' : 'موقوف'}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2">
                    <Link href={`/${tenantSlug}/students/${student.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></Link>
                    <button onClick={() => handleStatusChange(student.id, student.status === 'active' ? 'suspended' : 'active')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">{student.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</button>
                    <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
