import { createClient } from '@supabase/supabase-js';

// 💡 Supabase 설정 페이지(Settings > API)에서 URL과 Anon Key를 복사해 넣으세요!
const supabaseUrl = '당신의_SUPABASE_URL';
const supabaseAnonKey = '당신의_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);