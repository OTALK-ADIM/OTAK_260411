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
    <div className="w-full flex flex-col items-center mt-2">
      
      {/* 인증 경고 박스 */}
      <div className="w-full border border-green-500 py-8 flex flex-col items-center justify-center mb-8 bg-black">
        <h2 className="text-2xl md:text-3xl font-bold text-green-400 tracking-widest mb-2">
          USER_AUTHENTICATION
        </h2>
        <p className="text-[10px] tracking-widest text-red-500 animate-pulse">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </p>
      </div>

      {/* 💡 구글 로그인 안내 코멘트 창 */}
      <div className="w-full border border-dashed border-green-600 p-6 mb-10 bg-green-950/20 text-green-500 text-sm leading-relaxed text-center">
        <div className="font-bold text-lg mb-2">:: 구글 계정 동기화 ::</div>
        안전한 입국 심사 및 데이터 보존을 위해 <br />
        <span className="text-white">Google 계정 인증</span>이 필요합니다.<br />
        아래 버튼을 눌러 인증을 진행해 주십시오.
      </div>

      {/* 구글 접속 버튼 */}
      <button
        onClick={handleGoogleLogin}
        className="border-2 border-green-500 bg-black text-green-400 px-10 py-3 text-xl font-bold hover:bg-green-500 hover:text-black transition-all"
      >
        [ 구글 계정으로 접속 ]
      </button>

    </div>
  );
}