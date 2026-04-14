import { supabase } from "../lib/supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert("접속 에러: " + error.message);
  };

  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="w-full border border-green-500/50 p-10 text-center bg-[#0a0a0a] shadow-[0_0_20px_rgba(0,255,0,0.05)]">
        <h2 className="text-3xl font-bold text-green-500 mb-4">:: USER_AUTH ::</h2>
        
        {/* 💡 구글 로그인 안내 코멘트 */}
        <div className="text-sm text-green-700 leading-relaxed font-bold border-t border-green-900/50 pt-4 mt-4">
          [오타쿠 아카이브]는 <span className="text-green-400">Google 계정</span>을 통해<br />
          유저의 신원을 안전하게 식별합니다.<br />
          아래 버튼을 눌러 구글 인증을 진행하십시오.
        </div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="border-2 border-green-500 bg-black text-green-500 px-12 py-4 text-xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
      >
        [ 구글 계정으로 접속 ]
      </button>

      <button 
        onClick={() => window.history.back()}
        className="text-xs text-green-900 hover:text-green-500 underline"
      >
        돌아가기
      </button>
    </div>
  );
}