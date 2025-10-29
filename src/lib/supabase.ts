import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  target_stock: number;
  minimum_stock: number;
  current_stock: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
}

export interface ProductionLog {
  id: string;
  product_id: string;
  quantity: number;
  produced_by: string;
  production_date: string;
  notes: string;
  created_at: string;
}

export interface LossLog {
  id: string;
  product_id?: string;
  ingredient_id?: string;
  quantity: number;
  reason: string;
  loss_date: string;
  reported_by: string;
  created_at: string;
}
