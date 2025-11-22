import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, Product, Category, Order } from './firebase';

export const firestoreService = {
  async getProducts(activeOnly = true) {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      if (activeOnly) {
        products = products.filter(p => p.is_active === true);
      }

      products.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const now = new Date().toISOString();
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, {
        ...product,
        created_at: now,
        updated_at: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: Partial<Product>) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...product,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));

      categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  async getCategory(id: string) {
    try {
      const docRef = doc(db, 'categories', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Category;
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  },

  async addCategory(category: Omit<Category, 'id' | 'created_at'>) {
    try {
      const categoriesRef = collection(db, 'categories');
      const docRef = await addDoc(categoriesRef, {
        ...category,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<Category>) {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, category);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId: string) {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      products = products.filter(p =>
        p.category_id === categoryId && p.is_active === true
      );

      products.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  },

  async getOrders(status?: string) {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = [];

      for (const orderDoc of snapshot.docs) {
        const orderData = orderDoc.data();

        if (status && orderData.payment_status !== status) {
          continue;
        }

        const productDoc = await getDoc(doc(db, 'products', orderData.product_id));

        orders.push({
          id: orderDoc.id,
          ...orderData,
          products: productDoc.exists() ? { title: productDoc.data().title } : { title: 'Unknown' }
        });
      }

      orders.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async addOrder(order: Omit<Order, 'id' | 'created_at'>) {
    try {
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...order,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  async updateOrder(id: string, order: Partial<Order>) {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, order);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async getOrderByToken(token: string) {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);

      const orderDoc = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.download_token === token && data.payment_status === 'completed';
      });

      if (orderDoc) {
        return {
          id: orderDoc.id,
          ...orderDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting order by token:', error);
      throw error;
    }
  },

  async getSettings() {
    try {
      const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

      if (!firebaseProjectId || !firebaseApiKey) {
        console.error('Firebase configuration missing');
        return null;
      }

      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

      const response = await fetch(firestoreUrl);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        const fields = doc.fields || {};

        return {
          id: doc.name.split('/').pop(),
          paymentEnabled: fields.paymentEnabled?.booleanValue ?? false,
          cryptomusEnabled: fields.cryptomusEnabled?.booleanValue ?? true,
          paypalEnabled: fields.paypalEnabled?.booleanValue ?? false,
          created_at: fields.created_at?.timestampValue,
          updated_at: fields.updated_at?.timestampValue,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  async updateSettings(settings: any) {
    try {
      console.log('🔧 Starting updateSettings with:', settings);

      const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

      if (!firebaseProjectId || !firebaseApiKey) {
        console.error('❌ Firebase configuration missing');
        throw new Error('Firebase configuration missing');
      }

      console.log('📋 Fetching existing settings document using REST API...');

      const listUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

      let docId = null;

      try {
        const listResponse = await fetch(listUrl);

        if (listResponse.ok) {
          const listData = await listResponse.json();

          if (listData.documents && listData.documents.length > 0) {
            const docPath = listData.documents[0].name;
            docId = docPath.split('/').pop();
            console.log('📄 Found existing document with ID:', docId);
          } else {
            console.log('📄 No existing document found, will create new one');
          }
        } else {
          console.log('📄 No documents in collection yet, will create new one');
        }
      } catch (listError) {
        console.warn('⚠️ Could not list documents, will attempt to create new one:', listError);
      }

      const firestoreUrl = docId
        ? `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings/${docId}?key=${firebaseApiKey}`
        : `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings?key=${firebaseApiKey}`;

      const paymentEnabledValue = Boolean(settings.paymentEnabled);
      const cryptomusEnabledValue = Boolean(settings.cryptomusEnabled);
      const paypalEnabledValue = Boolean(settings.paypalEnabled);

      console.log('💾 Saving payment settings:', {
        paymentEnabled: paymentEnabledValue,
        cryptomusEnabled: cryptomusEnabledValue,
        paypalEnabled: paypalEnabledValue,
      });

      const settingsData = {
        fields: {
          paymentEnabled: { booleanValue: paymentEnabledValue },
          cryptomusEnabled: { booleanValue: cryptomusEnabledValue },
          paypalEnabled: { booleanValue: paypalEnabledValue },
          updated_at: { timestampValue: new Date().toISOString() },
        },
      };

      console.log('🌐 Making API request to:', docId ? 'PATCH' : 'POST', firestoreUrl);
      console.log('📦 Request body:', JSON.stringify(settingsData, null, 2));

      const response = await fetch(firestoreUrl, {
        method: docId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(docId ? settingsData : {
          ...settingsData,
          fields: {
            ...settingsData.fields,
            created_at: { timestampValue: new Date().toISOString() },
          }
        }),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Firestore API error response:', errorText);
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Settings saved successfully. Response:', responseData);
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
};
