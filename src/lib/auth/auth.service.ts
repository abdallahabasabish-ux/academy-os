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
  private auth = auth;
  private db = db;

  async register(data: RegisterFormData) {
    // 1. Validate data
    const validated = registerSchema.parse(data);
    
    // 2. Check if username is available
    const slugQuery = query(
      collection(this.db, 'tenants'), 
      where('slug', '==', validated.username.toLowerCase()), 
      limit(1)
    );
    const slugSnapshot = await getDocs(slugQuery);
    if (!slugSnapshot.empty) {
      throw new Error('اسم المستخدم هذا محجوز بالفعل، اختر اسماً آخر.');
    }

    // 3. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      this.auth, 
      validated.email, 
      validated.password
    );
    const user = userCredential.user;

    // 4. Update profile
    await updateProfile(user, { displayName: validated.name });

    // 5. Send verification email
    await sendEmailVerification(user);

    // 6. Generate tenant ID
    const tenantId = `tenant_${uuidv4().slice(0, 8)}`;

    // 7. Create tenant document in Firestore
    const tenantRef = doc(this.db, 'tenants', tenantId);
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
      fonts: {
        arabic: 'Cairo',
        english: 'Inter'
      },
      seo: {
        title: validated.academyName,
        description: `Learn with ${validated.academyName}`,
        keywords: ['education', 'courses', 'learning']
      },
      socialLinks: {},
      status: 'active',
      plan: 'free',
      subscription: {
        planId: 'free',
        startDate: serverTimestamp(),
        endDate: null,
        status: 'active'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 8. Create user document in tenant
    const userRef = doc(this.db, 'tenants', tenantId, 'users', user.uid);
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

    // 9. Create staff record for owner
    const staffRef = doc(this.db, 'tenants', tenantId, 'staff', user.uid);
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

    // 10. Create default pages
    const pageRef = doc(this.db, 'tenants', tenantId, 'pages', 'home');
    await setDoc(pageRef, {
      slug: 'home',
      title: 'الرئيسية',
      isDefault: true,
      status: 'published',
      content: {
        sections: [
          { 
            id: 'hero_1', 
            type: 'hero', 
            props: { 
              title: `مرحباً في ${validated.academyName}`, 
              subtitle: 'ابدأ التعلم الآن' 
            } 
          }
        ]
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 11. Return user data
    return { user, tenantId, slug: validated.username.toLowerCase() };
  }

  async login(email: string, password: string) {
    const validated = loginSchema.parse({ email, password });
    const userCredential = await signInWithEmailAndPassword(this.auth, validated.email, validated.password);
    return userCredential.user;
  }

  async logout() {
    await signOut(this.auth);
  }

  async sendVerificationEmail(user: User) {
    await sendEmailVerification(user);
  }

  async resetPassword(email: string) {
    // We'll add this later
    throw new Error('Not implemented yet');
  }

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

export const authService = new AuthService();
