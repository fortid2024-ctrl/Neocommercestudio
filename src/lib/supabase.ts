import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
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
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          original_price: number;
          discounted_price: number;
          category_id?: string | null;
          cover_image_url: string;
          pdf_file_url: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          original_price?: number;
          discounted_price?: number;
          category_id?: string | null;
          cover_image_url?: string;
          pdf_file_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
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
        };
        Insert: {
          id?: string;
          order_number: string;
          product_id: string;
          customer_email: string;
          amount_paid: number;
          currency: string;
          payment_status?: string;
          cryptomus_payment_id?: string | null;
          download_token: string;
          download_expires_at: string;
          downloaded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          product_id?: string;
          customer_email?: string;
          amount_paid?: number;
          currency?: string;
          payment_status?: string;
          cryptomus_payment_id?: string | null;
          download_token?: string;
          download_expires_at?: string;
          downloaded_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
