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
    <div className="w-full flex flex-col items-center">
      
      {!user ? (
        <div className="flex flex-col items-center gap-6 mt-10">
          <p className="text-xs md:text-sm text-green-500 tracking-widest font-bold animate-pulse">
            :: SYSTEM LOCKED - AUTHENTICATION REQUIRED ::
          </p>
          {/* 💡 button 대신 div 사용으로 아이폰 둥근 흰색 배경 버그 원천 차단 */}
          <div 
            onClick={() => setLocation("/login")}
            className="border-2 border-green-500 bg-black text-green-400 px-16 py-5 text-2xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-none shadow-[0_0_15px_rgba(34,197,94,0.4)] font-bold cursor-pointer inline-block"
          >
            [ S T A R T ]
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4 text-green-400 font-bold">
          <h2 className="text-xl text-green-500 border-b-2 border-dashed border-green-800 pb-2 mb-2 tracking-widest bg-black">
            root@otalk:~# ls -l
          </h2>
          
          {/* 💡 button 태그 삭제! div로 완전히 교체하여 모바일 기본 스타일 무력화 */}
          <div onClick={() => setLocation("/rules")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [0] NERD_PROTOCOL (규칙)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </div>

          <div onClick={() => setLocation("/feed")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [1] DATA_FEED (활동 피드)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </div>

          <div onClick={() => setLocation("/chat-list")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [2] SECURE_COMMS (비밀 대화)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </div>

          <div onClick={() => setLocation("/profile")} className="w-full border border-green-900 bg-black p-4 text-left text-base md:text-lg text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-black flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-800 group-hover:text-black mr-2">&gt;</span> [3] MY_ARCHIVE (프로필)</span>
            <span className="hidden group-hover:block animate-pulse">█</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
