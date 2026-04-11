import { createClient } from '@supabase/supabase-js';

// 💡 중요: Vite 프로젝트에서는 import.meta.env를 통해 환경변수를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 주소가 잘 들어왔는지 확인용 (에러 방지)
if (!supabaseUrl || supabaseUrl === '당신의_SUPABASE_URL') {
  console.error("⚠️ Supabase URL이 설정되지 않았습니다! Vercel의 Environment Variables를 확인하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);