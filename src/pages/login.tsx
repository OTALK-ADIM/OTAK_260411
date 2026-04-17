import { supabase } from "../lib/supabase";

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center px-4 font-mono mt-8 md:mt-16">
      
      {/* 💡 캐시와 Tailwind 버그를 뚫어버리는 무적의 레이아웃 코드 */}
      <style>{`
        .login-container {
          display: flex; flex-direction: column; align-items: center;
          gap: 3rem; /* 전체 요소들 사이의 간격을 시원하게 벌림 */
          width: 100%; max-width: 48rem;
          text-align: center;
        }
        .login-warning {
          color: #22c55e; letter-spacing: 0.15em;
          font-weight: bold; border-bottom: 2px dashed #166534;
          padding-bottom: 1.5rem; width: 100%; font-size: 1.1rem;
        }
        .login-notice {
          color: #4ade80; line-height: 2.2; font-size: 1rem;
          word-break: keep-all; text-align: center;
        }
        .login-btn-wrapper {
          display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
          margin-top: 1rem;
        }
        .login-btn {
          border: 2px solid #22c55e; background-color: black; color: #4ade80;
          padding: 1.2rem 2.5rem; font-size: 1.3rem; font-weight: bold;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.1em;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
        }
        .login-btn:hover { background-color: #22c55e; color: black; box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
        .login-logs {
          width: 100%; text-align: left; margin-top: 3rem;
          font-size: 0.75rem; color: #166534; line-height: 2;
        }
        @media (min-width: 768px) {
          .login-container { gap: 4rem; }
          .login-warning { font-size: 1.3rem; }
          .login-notice { font-size: 1.2rem; }
          .login-btn { padding: 1.5rem 4rem; font-size: 1.6rem; }
          .login-logs { font-size: 0.85rem; margin-top: 4rem; }
        }
      `}</style>

      <div className="login-container">
        
        {/* 💡 중복되던 USER_AUTHENTICATION 제목은 삭제하고 경고문만 남김 */}
        <div className="login-warning">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </div>

        <div className="login-notice">
          :: SYSTEM NOTICE ::<br/>
          [오타쿠 아카이브]는 <span className="underline decoration-green-800 underline-offset-4">Google OAuth 2.0</span> 인증 프로토콜을 사용하여 유저의 신원을 확인합니다.<br/><br/>
          아래 버튼을 클릭하면 구글 로그인 게이트웨이로 연결되며,<br/>
          인증 완료 시 자동으로 입국 심사(Onboarding) 단계로 진입합니다.
        </div>

        <div className="login-btn-wrapper">
          <span className="text-xs md:text-sm text-green-700 animate-pulse tracking-widest">
            WAITING FOR USER CERTIFICATE...
          </span>
          {/* 💡 버튼 태그를 div로 교체하여 애플 흰색 배경 꼼수 차단 */}
          <div onClick={handleLogin} className="login-btn">
            [ 구글 계정으로 시스템 접속 ]
          </div>
        </div>

        <div className="login-logs">
          &gt; INITIALIZING AUTH_PROTOCOL...<br/>
          &gt; REQUESTING REDIRECT_URL: https://oauth2.googleapis.com/...<br/>
          &gt; READY_TO_HANDSHAKE...
        </div>
      </div>
    </div>
  );
}