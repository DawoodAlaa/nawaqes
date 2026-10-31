import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const TABLE = 'shortages';

/** null when the env keys are missing: the app then works from IndexedDB only. */
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

if (!supabase) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY مش متعرفين، التطبيق شغال محليًا بس.');
}
