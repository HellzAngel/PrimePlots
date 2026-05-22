import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nrgwtmethautjfsrizer.supabase.co';
const supabaseAnonKey = 'sb_publishable_ONkdaWWfKaxq6UcV25f4hg_QwtzWGJM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
