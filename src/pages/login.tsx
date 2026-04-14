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
    <div className="w-full flex flex-col items-center mt-4">
      
      {/* 인증 경고 박스 */}
      <div className="w-full border border-green-500 py-10 flex flex-col items-center justify-center mb-10 shadow-[0_0_15px_rgba(34,197,94,0.1)] bg-black">
        <h2 className="text-3xl md:text-4xl text-green-400 tracking-widest mb-3">
          USER_AUTHENTICATION
        </h2>
        <p className="text-xs tracking-widest text-red-500 animate-pulse">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </p>
      </div>

      {/* 💡 구글 로그인 안내 코멘트 */}
      <div className="w-full max-w-lg border border-dashed border-green-700 p-8 mb-12 bg-green-950/10 text-center">
        <p className="text-green-500 text-lg mb-4 tracking-widest">:: 구글 계정 동기화 ::</p>
        <p className="text-green-600 text-sm leading-loose">
          안전한 입국 심사 및 데이터 보존을 위해 <br />
          <span className="text-white border-b border-white px-1">Google 계정</span> 인증이 필요합니다.<br />
          아래 버튼을 눌러 시스템에 접속해 주십시오.
        </p>
      </div>

      {/* 구글 접속 버튼 */}
      <button
        onClick={handleGoogleLogin}
        className="border border-green-500 bg-black text-green-400 px-10 py-3 text-xl tracking-widest hover:bg-green-500 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
      >
        [ 구글 계정으로 접속 ]
      </button>

    </div>
  );
}