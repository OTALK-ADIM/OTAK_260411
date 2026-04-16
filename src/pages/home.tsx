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
    <div className="w-full flex flex-col items-center mt-4">
      
      {/* 💡 타이틀 로고 (네온 그린 매트릭스 감성 복구) */}
      <div className="w-full border-2 border-green-500 py-12 md:py-16 flex flex-col items-center justify-center bg-black mb-12 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative overflow-hidden">
        {/* 미세한 스캔라인 효과 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
        
        <h1 className="text-7xl md:text-[8rem] text-green-400 tracking-[0.2em] mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] font-bold relative z-10">
          OTALK
        </h1>
        <p className="text-[10px] md:text-xs text-green-600 tracking-[0.4em] uppercase relative z-10 font-bold">
          [ Neo_Geek_Network_System ]
        </p>
      </div>

      {!user ? (
        <div className="flex flex-col items-center gap-6 mt-4">
          <p className="text-xs md:text-sm text-green-500 tracking-widest font-bold animate-pulse">
            :: SYSTEM LOCKED - AUTHENTICATION REQUIRED ::
          </p>
          <button 
            onClick={() => setLocation("/login")}
            className="border-2 border-green-500 bg-black text-green-400 px-16 py-5 text-2xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-none shadow-[0_0_15px_rgba(34,197,94,0.4)] font-bold cursor-pointer"
          >
            [ S T A R T ]
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg flex flex-col gap-4 text-green-400 font-bold md:px-0">
          <h2 className="text-xl text-green-500 border-b-2 border-dashed border-green-800 pb-2 mb-2 tracking-widest">
            root@otalk:~# ls -l
          </h2>
          
          {/* 💡 완전히 새로 디자인된 해커 터미널 메뉴 버튼들 */}
          <button onClick={() => setLocation("/rules")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [0] NERD_PROTOCOL (규칙)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </button>

          <button onClick={() => setLocation("/feed")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [1] DATA_FEED (활동 피드)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </button>

          <button onClick={() => setLocation("/chat-list")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [2] SECURE_COMMS (비밀 대화)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </button>

          <button onClick={() => setLocation("/profile")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [3] MY_ARCHIVE (프로필)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </button>
        </div>
      )}
      
    </div>
  );
}
