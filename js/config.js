import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://eaiitxfoqlkmykyqqapg.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_3sU4_opgqfZ5tPzk1bW5Ig_6XlX97pm"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);