import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AdminUser {
  id?: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

class FirestoreAuthService {
  private currentUser: AdminUser | null = null;

  async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      const usersRef = collection(db, 'admin_users');
      const q = query(
        usersRef,
        where('email', '==', email),
        where('password', '==', password)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Invalid login credentials');
      }

      const userDoc = snapshot.docs[0];
      const user = {
        id: userDoc.id,
        ...userDoc.data()
      } as AdminUser;

      this.currentUser = user;
      localStorage.setItem('admin_user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('admin_user');
  }

  getCurrentUser(): AdminUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('admin_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('admin_user');
      }
    }

    return null;
  }

  async createAdminUser(email: string, password: string): Promise<string> {
    try {
      const usersRef = collection(db, 'admin_users');

      const existingQuery = query(usersRef, where('email', '==', email));
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        throw new Error('User already exists');
      }

      const docRef = await addDoc(usersRef, {
        email,
        password,
        role: 'admin',
        created_at: new Date().toISOString(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const firestoreAuth = new FirestoreAuthService();
