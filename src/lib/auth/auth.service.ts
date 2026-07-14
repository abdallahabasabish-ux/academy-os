import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { auth, db } from '../firebase/client';
import { registerSchema, loginSchema } from '../validators/auth.schema';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  academyName: string;
  username: string;
  country?: string;
  city?: string;
  language: string;
  currency: string;
  specialty?: string;
  educationLevels: string[];
  subjects: string[];
  agreeToTerms: boolean;
}

export class AuthService {
  
  async register(data: RegisterFormData) {
    // التحقق من صحة البيانات
    const validated = registerSchema.parse(data);
    
    // التأكد من أن اسم المستخدم غير مأخوذ
    const slugQuery = query(
      collection(db, 'tenants'), 
      where('slug', '==', validated.username.toLowerCase()), 
      limit(1)
    );
    const slugSnapshot = await getDocs(slugQuery);
    if (!slugSnapshot.empty) {
      throw new Error('اسم المستخدم هذا محجوز بالفعل، اختر اسماً آخر.');
    }

    // إنشاء المستخدم في Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      validated.email, 
      validated.password
    );
    const user = userCredential.user;

    // تحديث الاسم الظاهر
    await updateProfile(user, { displayName: validated.name });

    // إرسال رابط تأكيد البريد
    await sendEmailVerification(user);

    // إنشاء معرف المستأجر
    const tenantId = `tenant_${uuidv4().slice(0, 8)}`;

    // كتابة وثيقة المستأجر (Tenant)
    const tenantRef = doc(db, 'tenants', tenantId);
    await setDoc(tenantRef, {
      id: tenantId,
      slug: validated.username.toLowerCase(),
      name: validated.academyName,
      ownerId: user.uid,
      description: '',
      colors: {
        primary: '#2563EB',
        secondary: '#0F172A',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC'
      },
      fonts: { arabic: 'Cairo', english: 'Inter' },
      status: 'active',
      plan: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // إضافة المستخدم كـ Owner داخل وثائق المستأجر
    const userRef = doc(db, 'tenants', tenantId, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: validated.name,
      phone: validated.phone,
      role: 'owner',
      status: 'active',
      permissions: ['*'],
      metadata: {
        country: validated.country || '',
        city: validated.city || '',
        language: validated.language,
        currency: validated.currency,
        specialty: validated.specialty || '',
        educationLevels: validated.educationLevels,
        subjects: validated.subjects
      },
      joinedAt: serverTimestamp()
    });

    // إنشاء سجل الموظف (Staff) للمالك
    const staffRef = doc(db, 'tenants', tenantId, 'staff', user.uid);
    await setDoc(staffRef, {
      id: user.uid,
      userId: user.uid,
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      position: 'admin',
      hireDate: serverTimestamp(),
      status: 'active',
      permissions: ['*']
    });

    // إنشاء صفحة رئيسية افتراضية
    const pageRef = doc(db, 'tenants', tenantId, 'pages', 'home');
    await setDoc(pageRef, {
      slug: 'home',
      title: 'الرئيسية',
      isDefault: true,
      status: 'published',
      content: {
        sections: [
          { id: 'hero_1', type: 'hero', props: { title: `مرحباً في ${validated.academyName}`, subtitle: 'ابدأ التعلم الآن' } }
        ]
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { user, tenantId, slug: validated.username.toLowerCase() };
  }

  async login(email: string, password: string) {
    const validated = loginSchema.parse({ email, password });
    const userCredential = await signInWithEmailAndPassword(auth, validated.email, validated.password);
    return userCredential.user;
  }

  async logout() {
    await signOut(auth);
  }

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

export const authService = new AuthService();
