import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isInvalid = !supabaseUrl || supabaseUrl === 'paste_here';
if (isInvalid) {
  console.warn("Supabase URL and Anon Key are missing or invalid. Please set them in .env.local");
}

const finalUrl = !isInvalid ? supabaseUrl : 'https://placeholder.supabase.co'

export const supabase = createClient(finalUrl, supabaseAnonKey || 'placeholder')
