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
      
      {/* 💡 타이틀 로고 (공통 노출) */}
      <div className="w-full border border-green-500 py-12 md:py-16 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-black mb-12">
        <h1 className="text-7xl md:text-[8rem] text-green-400 tracking-[0.2em] mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] font-bold">
          OTALK
        </h1>
        <p className="text-[10px] md:text-xs text-green-600 tracking-[0.4em] uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 💡 로그인 여부에 따른 출력 분기 */}
      {!user ? (
        <div className="flex flex-col items-center gap-6 mt-4">
          <p className="text-xs md:text-sm text-green-500 tracking-widest font-bold">
            :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
          </p>
          <button 
            onClick={() => setLocation("/login")}
            className="border-2 border-green-500 bg-black text-green-400 px-12 py-4 text-2xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] font-bold"
          >
            [ S T A R T ]
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-8 text-xl tracking-[0.1em] text-green-400 font-bold ml-4 md:ml-0">
          <button onClick={() => setLocation("/rules")} className="text-left hover:text-white transition-colors">▶ 0. NERD_PROTOCOL (규칙)</button>
          <button onClick={() => setLocation("/feed")} className="text-left hover:text-white transition-colors">▶ 1. 활동 모집 피드</button>
          <button onClick={() => setLocation("/chat-list")} className="text-left hover:text-white transition-colors pl-8">2. 비밀 대화함 (수락전)</button>
          <button onClick={() => setLocation("/profile")} className="text-left hover:text-white transition-colors pl-8">3. 나의 데이터 (프로필)</button>
        </div>
      )}
      
    </div>
  );
}
