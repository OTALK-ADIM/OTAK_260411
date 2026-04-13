// ⚠️ 주의: 성민님이 기존에 사용하시던 로그인 코드의 내용은 그대로 두고, 
// 디자인만 아래처럼 바꾸는 것입니다.

import { supabase } from "../lib/supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });

    if (error) {
      alert("로그인 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-10">
      
      {/* 💡 로그인 전/후를 맞추기 위한 일관된 상단 제목 */}
      <div className="border border-green-500 p-6 text-center shadow-[0_0_15px_rgba(34,197,94,0.1)] bg-[#0a0a0a]">
        <h2 className="text-4xl font-bold tracking-tighter text-green-500 mb-2">
          OTALK :: AUTHENTICATION
        </h2>
        <div className="text-xs text-green-900 font-mono tracking-wider">SECURE_ACCESS_PROTOCOL_V1.8</div>
      </div>

      {/* 💡 성민님이 요청하신 '구글 로그인 과정' 피드백 코멘트 */}
      <div className="mt-8 p-6 bg-green-950/20 border-2 border-dashed border-green-500 text-green-500 leading-loose max-w-sm text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <div className="flex gap-2 items-center mb-3 justify-center">
          <span className="text-xl animate-pulse text-green-500">SYSTEM:</span>
          <span className="text-green-400">WAITING FOR USER CERTIFICATION</span>
        </div>
        [오타쿠 아카이브]는 <span className="text-white px-1 hover:bg-green-500">Google 계정</span>을 통해 안전하게 유저를 인증합니다. 아래 <span className="bg-green-500 text-black px-1 font-bold">[ 구글로 접속 ]</span> 버튼을 누르면 구글 로그인 창으로 이동합니다.
      </div>

      {/* 💡 로그인 버튼 (START 버튼과 일관성 유지) */}
      <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-sm">
        <p className="text-[10px] text-red-500 font-bold tracking-widest animate-pulse">
          :: WARNING: ATTEMPTING TO ACCESS SECURE TERMINAL ::
        </p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full border-2 border-green-500 bg-black text-green-500 p-5 text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ 구글로 접속 ]
        </button>
      </div>

    </div>
  );
}