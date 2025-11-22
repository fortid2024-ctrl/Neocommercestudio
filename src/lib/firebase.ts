import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBHiaVW7LteeuHf6oacHo_1uaeUzK5FaQE",
  authDomain: "neocommercestudio-29a5a.firebaseapp.com",
  projectId: "neocommercestudio-29a5a",
  storageBucket: "neocommercestudio-29a5a.firebasestorage.app",
  messagingSenderId: "1098033630526",
  appId: "1:1098033630526:web:12d5e511cd131ae7fab06f",
  measurementId: "G-8RL25M7WCX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export interface Product {
  id?: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  category_id: string | null;
  cover_image_url: string;
  pdf_file_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Order {
  id?: string;
  order_number: string;
  product_id: string;
  customer_email: string;
  amount_paid: number;
  currency: string;
  payment_status: string;
  cryptomus_payment_id: string | null;
  download_token: string;
  download_expires_at: string;
  downloaded_at: string | null;
  created_at: string;
}
