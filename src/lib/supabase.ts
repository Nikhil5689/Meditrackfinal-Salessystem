import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These should be in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Use dummy values if missing to prevent "Url is required" crash
// This allows the app to load and show a setup warning instead of a blank screen
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Check if the user has actually configured the project
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  !supabaseUrl.includes('placeholder-project')
);

export const supabase = createClient<Database>(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);
