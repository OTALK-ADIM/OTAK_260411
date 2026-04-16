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
        /* 💡 테두리를 싹 없애고 큼직한 텍스트 리스트 형태로 재복구 */
        <div className="w-full max-w-xl mx-auto flex flex-col gap-12 md:gap-16 text-green-500 font-bold mt-12 md:mt-20 px-6 md:px-0">
          
          <div onClick={() => setLocation("/rules")} className="text-left text-2xl md:text-4xl hover:text-green-300 cursor-pointer flex items-center transition-none group">
            <span className="mr-4 text-green-400 group-hover:text-green-300">▶</span> 0. NERD_PROTOCOL (규칙)
          </div>

          <div onClick={() => setLocation("/feed")} className="text-left text-2xl md:text-4xl hover:text-green-300 cursor-pointer flex items-center transition-none group">
            <span className="mr-4 text-green-400 group-hover:text-green-300">▶</span> 1. 활동 모집 피드
          </div>

          <div onClick={() => setLocation("/chat-list")} className="text-left text-2xl md:text-4xl hover:text-green-300 cursor-pointer flex items-center transition-none group">
            <span className="mr-4 text-green-400 group-hover:text-green-300">▶</span> 2. 비밀 대화함 (수락전)
          </div>

          <div onClick={() => setLocation("/profile")} className="text-left text-2xl md:text-4xl hover:text-green-300 cursor-pointer flex items-center transition-none group">
            <span className="mr-4 text-green-400 group-hover:text-green-300">▶</span> 3. 나의 데이터 (프로필)
          </div>
          
        </div>
      )}
      
    </div>
  );
}