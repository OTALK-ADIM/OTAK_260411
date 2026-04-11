import { supabase } from "../lib/supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로그인 완료 후 다시 돌아올 우리 사이트 주소
        redirectTo: window.location.origin 
      }
    });

    if (error) {
      console.error("접속 에러:", error.message);
      alert("로그인 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono">
      <div className="border border-green-500 p-8 bg-black shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <h2 className="text-green-500 text-xl mb-6 text-center animate-pulse">
          :: USER_AUTHENTICATION ::
        </h2>
        
        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border-2 border-green-500 text-green-500 py-3 px-6 hover:bg-green-500 hover:text-black transition-all font-bold flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:animate-bounce">▶</span> 
          SIGN_IN_WITH_GOOGLE
        </button>

        <p className="text-green-900 text-[10px] mt-6 text-center">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </p>
      </div>
    </div>
  );
}