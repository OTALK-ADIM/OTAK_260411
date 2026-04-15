import { supabase } from "../lib/supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        // 💡 핵심: 현재 브라우저의 접속 주소(Vercel 주소)를 자동으로 파악하여 
        // 로그인 완료 후 이 주소로 티켓을 들고 돌아오게 만듭니다.
        redirectTo: `${window.location.origin}/` 
      }
    });

    if (error) {
      alert(`[보안 에러] 인증 서버 통신 실패: ${error.message}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-4">
      
      {/* 1. 인증 헤더 박스 (image_c9e194.png 감성 이식) */}
      <div className="w-full border border-green-500 py-10 flex flex-col items-center justify-center mb-10 shadow-[0_0_15px_rgba(34,197,94,0.1)] bg-black">
        <h2 className="text-3xl md:text-4xl font-bold text-green-400 tracking-widest mb-3">
          USER_AUTHENTICATION
        </h2>
        <p className="text-[10px] md:text-xs tracking-[0.3em] text-red-500 animate-pulse font-bold">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </p>
      </div>

      {/* 2. 💡 성민님이 요청하신 '구글 로그인 안내' 피드백 코멘트 영역 */}
      <div className="w-full max-w-lg border border-dashed border-green-700 p-8 mb-12 bg-green-950/10 text-center relative overflow-hidden">
        {/* 미세한 스캔라인 효과 (TA 감성) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none"></div>
        
        <p className="text-green-500 text-lg mb-4 tracking-widest font-bold">:: SYSTEM NOTICE ::</p>
        <div className="text-green-600 text-sm leading-loose text-left md:text-center">
          [오타쿠 아카이브]는 <span className="text-white border-b border-white px-1">Google OAuth 2.0</span> 인증 프로토콜을 사용하여 유저의 신원을 확인합니다.<br /><br />
          아래 버튼을 클릭하면 구글 로그인 게이트웨이로 연결되며, <br />
          인증 완료 시 자동으로 <span className="text-green-400 font-bold">입국 심사(Onboarding)</span> 단계로 진입합니다.
        </div>
      </div>

      {/* 3. 구글 접속 버튼 (START 버튼과 통일된 디자인) */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-[10px] text-green-800 font-bold tracking-widest">
          WAITING FOR USER CERTIFICATE...
        </p>
        
        <button
          onClick={handleGoogleLogin}
          className="border-2 border-green-500 bg-black text-green-400 px-12 py-4 text-xl md:text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ 구글 계정으로 시스템 접속 ]
        </button>
      </div>

      {/* 하단 장식용 로그 */}
      <div className="mt-16 w-full max-w-md text-[9px] text-green-900 font-mono space-y-1 opacity-50">
        <p>{">"} INITIALIZING AUTH_PROTOCOL...</p>
        <p>{">"} REQUESTING REDIRECT_URL: {window.location.origin}</p>
        <p>{">"} READY_TO_HANDSHAKE...</p>
      </div>

    </div>
  );
}
