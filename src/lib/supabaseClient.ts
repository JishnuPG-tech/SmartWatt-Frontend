import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasValidSupabaseConfig =
  !!rawSupabaseUrl &&
  !!rawSupabaseAnonKey &&
  rawSupabaseUrl !== "https://placeholder.supabase.co" &&
  rawSupabaseAnonKey !== "placeholder";

export const supabaseConfigError = hasValidSupabaseConfig
  ? null
  : "Supabase is not configured in this build. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before building the app.";

if (supabaseConfigError) {
  console.error(supabaseConfigError);
}

const supabaseUrl = rawSupabaseUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = rawSupabaseAnonKey || "placeholder";

// This is the "Key to the Vault".
// It initializes the connection to Supabase (our Database).
// We export this 'supabase' object so any file can use it to talk to the database.
// Ideally, we treat this as a Singleton (only created once).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
