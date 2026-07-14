// src/services/student.service.ts (إضافة دوال جديدة)
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';

export interface StudentData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  educationLevel?: string;
  grade?: string;
  parentId?: string;
  status: 'active' | 'suspended' | 'pending';
  notes?: string;
  metadata?: {
    country?: string;
    city?: string;
    language?: string;
    currency?: string;
  };
  enrolledCourses?: string[];
  completedCourses?: string[];
  certificates?: string[];
  totalSpent?: number;
}

class StudentService {
  private db = db;

  // إنشاء طالب جديد
  async createStudent(tenantId: string, data: StudentData): Promise<string> {
    const studentId = `std_${uuidv4().slice(0, 8)}`;
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    
    await setDoc(ref, {
      id: studentId,
      ...data,
      status: data.status || 'pending',
      enrolledCourses: data.enrolledCourses || [],
      completedCourses: data.completedCourses || [],
      certificates: data.certificates || [],
      totalSpent: data.totalSpent || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return studentId;
  }

  // جلب طالب حسب المعرف
  async getStudent(tenantId: string, studentId: string): Promise<any | null> {
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  // جلب قائمة الطلاب مع خيارات التصفية
  async getStudents(tenantId: string, filters?: {
    status?: string;
    educationLevel?: string;
    grade?: string;
    search?: string;
    limit?: number;
  }): Promise<any[]> {
    let q = query(collection(this.db, 'tenants', tenantId, 'students'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.educationLevel) {
      q = query(q, where('educationLevel', '==', filters.educationLevel));
    }
    if (filters?.grade) {
      q = query(q, where('grade', '==', filters.grade));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // بحث بسيط (client-side) - يمكن استبدال بـ Algolia لاحقاً
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      students = students.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.phone?.includes(filters.search!)
      );
    }
    
    return students;
  }

  // تحديث بيانات الطالب
  async updateStudent(tenantId: string, studentId: string, data: Partial<StudentData>): Promise<void> {
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  // حذف طالب
  async deleteStudent(tenantId: string, studentId: string): Promise<void> {
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await deleteDoc(ref);
  }

  // تغيير حالة الطالب
  async updateStudentStatus(tenantId: string, studentId: string, status: 'active' | 'suspended' | 'pending'): Promise<void> {
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp()
    });
  }

  // تسجيل طالب في كورس
  async enrollStudent(tenantId: string, studentId: string, courseId: string): Promise<void> {
    const studentRef = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(studentRef, {
      enrolledCourses: arrayUnion(courseId),
      updatedAt: serverTimestamp()
    });
  }

  // إكمال كورس من قبل طالب
  async completeCourse(tenantId: string, studentId: string, courseId: string): Promise<void> {
    const studentRef = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(studentRef, {
      completedCourses: arrayUnion(courseId),
      updatedAt: serverTimestamp()
    });
  }

  // إضافة شهادة للطالب
  async addCertificate(tenantId: string, studentId: string, certificateId: string): Promise<void> {
    const studentRef = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(studentRef, {
      certificates: arrayUnion(certificateId),
      updatedAt: serverTimestamp()
    });
  }

  // إضافة ملاحظة للطالب
  async addNote(tenantId: string, studentId: string, note: string, createdBy: string): Promise<void> {
    const ref = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(ref, {
      notes: arrayUnion({
        text: note,
        createdAt: serverTimestamp(),
        createdBy
      }),
      updatedAt: serverTimestamp()
    });
  }

  // جلب تقدم الطالب في الكورسات
  async getStudentProgress(tenantId: string, studentId: string): Promise<any> {
    const progressRef = collection(this.db, 'tenants', tenantId, 'students', studentId, 'progress');
    const snapshot = await getDocs(progressRef);
    const progress = {};
    snapshot.forEach(doc => {
      progress[doc.id] = doc.data();
    });
    return progress;
  }

  // جلب مدفوعات الطالب
  async getStudentPayments(tenantId: string, studentId: string): Promise<any[]> {
    const q = query(
      collection(this.db, 'tenants', tenantId, 'students', studentId, 'payments'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // إضافة دفعة للطالب
  async addPayment(tenantId: string, studentId: string, payment: {
    amount: number;
    currency: string;
    description: string;
    courseId?: string;
    paymentMethod: string;
  }): Promise<void> {
    const ref = doc(collection(this.db, 'tenants', tenantId, 'students', studentId, 'payments'));
    await setDoc(ref, {
      id: ref.id,
      ...payment,
      createdAt: serverTimestamp(),
      createdBy: 'system'
    });
    
    // تحديث إجمالي المصروفات
    const studentRef = doc(this.db, 'tenants', tenantId, 'students', studentId);
    await updateDoc(studentRef, {
      totalSpent: increment(payment.amount),
      updatedAt: serverTimestamp()
    });
  }
}

export const studentService = new StudentService();
