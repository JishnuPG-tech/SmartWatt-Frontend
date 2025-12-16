import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// This is the "Key to the Vault".
// It initializes the connection to Supabase (our Database).
// We export this 'supabase' object so any file can use it to talk to the database.
// Ideally, we treat this as a Singleton (only created once).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
