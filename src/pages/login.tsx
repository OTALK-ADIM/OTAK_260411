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
    <div className="w-full flex flex-col items-center gap-12 py-10">
      
      {/* 안내 박스 */}
      <div className="w-full border border-green-500/50 p-8 text-center bg-[#0a0a0a] shadow-[0_0_20px_rgba(0,255,0,0.05)]">
        <h2 className="text-2xl md:text-3xl font-bold text-green-500 mb-4 tracking-widest">
          :: USER_AUTH ::
        </h2>
        
        <div className="text-[11px] md:text-xs text-green-700 leading-relaxed font-bold border-t border-green-900/50 pt-6 mt-4">
          [오타쿠 아카이브]는 <span className="text-green-400">Google 계정</span>을 통해<br />
          유저의 신원을 안전하게 식별합니다.<br />
          아래 버튼을 눌러 구글 인증을 진행하십시오.
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-4 w-full px-2">
        {/* 💡 하얀색 깡통 방지: 구글 로그인 버튼 초록색 강제 박제 */}
        <button 
          onClick={handleGoogleLogin}
          style={{ backgroundColor: "#22c55e", color: "black", borderColor: "#22c55e" }}
          className="w-full border-2 py-4 text-lg md:text-xl font-bold hover:opacity-80 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
        >
          [ 구글 계정으로 접속 ]
        </button>

        {/* 💡 하얀색 깡통 방지: 돌아가기 버튼 투명 배경 & 초록 글씨 강제 박제 */}
        <button 
          onClick={() => window.history.back()}
          style={{ backgroundColor: "transparent", color: "#16a34a", border: "none" }}
          className="text-xs hover:text-green-400 underline py-2 cursor-pointer"
        >
          돌아가기
        </button>
      </div>

    </div>
  );
}