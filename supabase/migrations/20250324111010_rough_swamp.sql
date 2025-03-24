/*
  # B2B Marketplace Initial Schema

  1. New Tables
    - `profiles`
      - Extended user profile information
      - Linked to auth.users
      - Stores user type (vendor/buyer) and company details
    
    - `products`
      - Product listings
      - Managed by vendors
      - Contains product details and pricing
    
    - `orders`
      - Order information
      - Links buyers and products
      - Tracks order status and payment
    
    - `stripe_accounts`
      - Stores Stripe connect account IDs
      - Links vendors to their Stripe accounts

  2. Security
    - RLS policies for each table
    - Vendor-specific access controls
    - Buyer-specific access controls
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  company_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('vendor', 'buyer')),
  contact_email text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  description text,
  price decimal NOT NULL CHECK (price > 0),
  stock_quantity integer NOT NULL DEFAULT 0,
  category text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  vendor_id uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  total_amount decimal NOT NULL,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stripe accounts table
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES profiles(id) NOT NULL UNIQUE,
  stripe_account_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Vendors can insert their products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'vendor'
    )
  );

CREATE POLICY "Vendors can update their products"
  ON products FOR UPDATE
  USING (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'vendor'
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'buyer'
    )
  );

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.vendor_id = auth.uid())
    )
  );

-- Stripe accounts policies
CREATE POLICY "Vendors can view their own stripe account"
  ON stripe_accounts FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their stripe account"
  ON stripe_accounts FOR INSERT
  WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'vendor'
    )
  );