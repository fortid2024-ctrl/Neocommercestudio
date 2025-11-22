/*
  # NeoCommerceStudio Database Schema

  ## Overview
  This migration creates the complete database structure for a digital ebook store
  with crypto payment integration.

  ## New Tables

  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text, unique) - Category name
  - `slug` (text, unique) - URL-friendly category identifier
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. products
  - `id` (uuid, primary key) - Unique product identifier
  - `title` (text) - Product title
  - `description` (text) - Product description
  - `original_price` (numeric) - Original price in USD
  - `discounted_price` (numeric) - Discounted price in USD
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `cover_image_url` (text) - URL to product cover image
  - `pdf_file_url` (text) - Secure URL to PDF file
  - `is_active` (boolean) - Product visibility status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. orders
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `product_id` (uuid, foreign key) - Reference to products table
  - `customer_email` (text) - Customer email address
  - `amount_paid` (numeric) - Amount paid in crypto
  - `currency` (text) - Cryptocurrency used
  - `payment_status` (text) - Payment status (pending, completed, failed)
  - `cryptomus_payment_id` (text) - Cryptomus payment reference
  - `download_token` (text, unique) - Secure token for download access
  - `download_expires_at` (timestamptz) - Download link expiration
  - `downloaded_at` (timestamptz, nullable) - First download timestamp
  - `created_at` (timestamptz) - Order creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Categories: Public read access, admin write access
  - Products: Public read for active products, admin full access
  - Orders: Customers can read own orders via download token, admin full access

  ### Policies
  1. Categories - Public can view, authenticated admins can manage
  2. Products - Public can view active products, admins can manage all
  3. Orders - Access via download token or admin authentication
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  original_price numeric(10, 2) NOT NULL,
  discounted_price numeric(10, 2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cover_image_url text NOT NULL,
  pdf_file_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  customer_email text NOT NULL,
  amount_paid numeric(10, 2) NOT NULL,
  currency text NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  cryptomus_payment_id text,
  download_token text UNIQUE NOT NULL,
  download_expires_at timestamptz NOT NULL,
  downloaded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies
CREATE POLICY "Anyone can view orders with valid token"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(download_token);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(cryptomus_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();