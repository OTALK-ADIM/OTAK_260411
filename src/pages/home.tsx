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
      
      {/* 💡 Tailwind 엔진 무시! 강제 크기/간격 주입 (절대 실패 불가) */}
      <style>{`
        .nuke-menu-container {
          display: flex; flex-direction: column;
          gap: 3rem; margin-top: 3rem;
          width: 100%; max-width: 40rem; margin: 3rem auto 0 auto;
          padding: 0 1.5rem;
        }
        .nuke-menu-item {
          font-size: 1.8rem; padding: 1.5rem 0;
          cursor: pointer; display: flex; align-items: center;
          text-align: left; color: #22c55e; font-weight: bold;
        }
        .nuke-menu-item:hover { color: #86efac; }
        .nuke-menu-icon { margin-right: 1.5rem; color: #4ade80; }
        .nuke-menu-item:hover .nuke-menu-icon { color: #86efac; }
        .nuke-prompt {
          font-size: 1.5rem; color: #22c55e; border-bottom: 2px dashed #166534;
          padding-bottom: 1rem; margin-bottom: 0.5rem; letter-spacing: 0.1em;
        }
        @media (min-width: 768px) {
          .nuke-menu-container { gap: 4.5rem; margin-top: 5rem; padding: 0; }
          .nuke-menu-item { font-size: 3rem; padding: 2.5rem 0; }
          .nuke-prompt { font-size: 2.25rem; border-bottom: 4px dashed #166534; padding-bottom: 1.5rem; }
          .nuke-menu-icon { margin-right: 2.5rem; }
        }
      `}</style>

      {!user ? (
        <div className="flex flex-col items-center gap-10 mt-16">
          <p className="text-sm md:text-base text-green-500 tracking-widest font-bold animate-pulse text-center leading-loose">
            :: WARNING: UNAUTHORIZED ACCESS IS PROHIBITED ::<br/>
            접속을 위해 시스템 스타트 명령을 실행하십시오.
          </p>
          <div 
            onClick={() => setLocation("/login")}
            className="border-2 border-green-500 bg-black text-green-400 px-20 py-8 text-3xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-none shadow-[0_0_20px_rgba(34,197,94,0.4)] font-bold cursor-pointer inline-block text-center"
          >
            [ S T A R T ]
          </div>
        </div>
      ) : (
        <div className="nuke-menu-container">
          
          <h2 className="nuke-prompt bg-black">
            root@otalk:~# ls -l
          </h2>

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