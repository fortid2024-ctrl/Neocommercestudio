import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function setupFirestoreAdmin() {
  try {
    const adminEmail = 'neocommerce@admin.com';
    const adminPassword = 'Rahma1211';

    const usersRef = collection(db, 'admin_users');
    const q = query(usersRef, where('email', '==', adminEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(usersRef, {
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        created_at: new Date().toISOString(),
      });
      console.log('✅ Admin user created in Firestore!');
      console.log('📧 Email: neocommerce@admin.com');
      console.log('🔑 Password: Rahma1211');
    } else {
      console.log('ℹ️ Admin user already exists in Firestore');
    }
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  }
}

export async function createSampleCategory() {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      await addDoc(categoriesRef, {
        name: 'E-books',
        slug: 'ebooks',
        created_at: new Date().toISOString(),
      });
      console.log('✅ Sample category created!');
    }
  } catch (error) {
    console.error('Error creating sample category:', error);
  }
}

export async function initializePaymentSettings() {
  try {
    const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

    if (!firebaseProjectId || !firebaseApiKey) {
      console.error('❌ Firebase configuration missing for settings initialization');
      return;
    }

    console.log('🔧 Checking payment settings...');

    const listUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

    const listResponse = await fetch(listUrl);

    if (listResponse.ok) {
      const listData = await listResponse.json();

      if (!listData.documents || listData.documents.length === 0) {
        console.log('📦 Creating default payment settings document...');

        const createUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

        const settingsData = {
          fields: {
            paymentEnabled: { booleanValue: false },
            cryptomusEnabled: { booleanValue: true },
            paypalEnabled: { booleanValue: false },
            created_at: { timestampValue: new Date().toISOString() },
            updated_at: { timestampValue: new Date().toISOString() },
          },
        };

        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settingsData),
        });

        if (createResponse.ok) {
          console.log('✅ Payment settings initialized! Mode: TEST (payment disabled)');
        } else {
          const errorText = await createResponse.text();
          console.error('❌ Failed to create settings:', errorText);
        }
      } else {
        console.log('ℹ️ Payment settings already exist');
      }
    } else if (listResponse.status === 404) {
      console.log('📦 Creating settings collection and default document...');

      const createUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

      const settingsData = {
        fields: {
          paymentEnabled: { booleanValue: false },
          cryptomusEnabled: { booleanValue: true },
          paypalEnabled: { booleanValue: false },
          created_at: { timestampValue: new Date().toISOString() },
          updated_at: { timestampValue: new Date().toISOString() },
        },
      };

      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (createResponse.ok) {
        console.log('✅ Payment settings initialized! Mode: TEST (payment disabled)');
      } else {
        const errorText = await createResponse.text();
        console.error('❌ Failed to create settings:', errorText);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing payment settings:', error);
  }
}
