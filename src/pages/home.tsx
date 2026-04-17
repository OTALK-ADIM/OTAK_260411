import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full flex flex-col">
      
      <style>{`
        .nuke-start-container {
          display: flex; flex-direction: column; align-items: center;
          margin-top: 6rem;
          gap: 4rem;
          padding: 0 1rem;
        }
        .nuke-warning-text {
          color: #22c55e; letter-spacing: 0.15em;
          font-weight: bold; text-align: center; line-height: 2.5;
          font-size: 1rem;
        }
        .nuke-start-btn {
          border: 2px solid #22c55e; background-color: black;
          color: #4ade80; padding: 1.5rem 5rem; font-size: 1.5rem;
          letter-spacing: 0.4em; font-weight: bold; cursor: pointer;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
        }
        .nuke-start-btn:hover { background-color: #22c55e; color: black; }

        .nuke-menu-container {
          display: flex; flex-direction: column;
          gap: 1.8rem; margin-top: 2rem;
          width: 100%; max-width: 40rem; margin-left: auto; margin-right: auto;
          padding: 0 1.5rem;
        }
        .nuke-menu-item {
          font-size: 1.2rem; padding: 1rem 0;
          cursor: pointer; display: flex; align-items: center;
          text-align: left; color: #22c55e; font-weight: bold;
        }
        .nuke-menu-item:hover { color: #86efac; }
        .nuke-menu-icon { margin-right: 1rem; color: #4ade80; }
        .nuke-menu-item:hover .nuke-menu-icon { color: #86efac; }

        @media (min-width: 768px) {
          .nuke-start-container { margin-top: 8rem; gap: 5rem; }
          .nuke-warning-text { font-size: 1.2rem; }
          .nuke-start-btn { padding: 2rem 6rem; font-size: 2rem; }

          .nuke-menu-container { gap: 2.5rem; margin-top: 3rem; padding: 0; }
          .nuke-menu-item { font-size: 1.8rem; padding: 1.5rem 0; }
          .nuke-menu-icon { margin-right: 1.5rem; }
        }
      `}</style>

      {!user ? (
        <div className="nuke-start-container">
          <p className="nuke-warning-text animate-pulse">
            :: WARNING: UNAUTHORIZED ACCESS IS PROHIBITED ::<br/>
            접속을 위해 시스템 스타트 명령을 실행하십시오.
          </p>
          <div 
            onClick={() => setLocation("/login")}
            className="nuke-start-btn"
          >
            [ S T A R T ]
          </div>
        </div>
      ) : (
        <div className="nuke-menu-container">
          {/* 💡 중복되던 h2 타이틀 제거됨 */}
          <div onClick={() => setLocation("/rules")} className="nuke-menu-item transition-none group">
            <span className="nuke-menu-icon">▶</span> 0. NERD_PROTOCOL (규칙)
          </div>

          <div onClick={() => setLocation("/feed")} className="nuke-menu-item transition-none group">
            <span className="nuke-menu-icon">▶</span> 1. 활동 모집 피드
          </div>

          <div onClick={() => setLocation("/chat-list")} className="nuke-menu-item transition-none group">
            <span className="nuke-menu-icon">▶</span> 2. 비밀 대화함 (수락전)
          </div>

          <div onClick={() => setLocation("/profile")} className="nuke-menu-item transition-none group">
            <span className="nuke-menu-icon">▶</span> 3. 나의 데이터 (프로필)
          </div>
        </div>
      )}
    </div>
  );
}