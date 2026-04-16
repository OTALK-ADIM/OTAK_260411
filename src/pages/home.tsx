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
    <div className="w-full flex flex-col items-center mt-2 md:mt-6">
      
      {!user ? (
        <div className="flex flex-col items-center gap-8 mt-16">
          <p className="text-sm md:text-base text-green-500 tracking-widest font-bold animate-pulse">
            :: SYSTEM LOCKED - AUTHENTICATION REQUIRED ::
          </p>
          <div 
            onClick={() => setLocation("/login")}
            className="border-2 border-green-500 bg-black text-green-400 px-20 py-8 text-3xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-none shadow-[0_0_20px_rgba(34,197,94,0.4)] font-bold cursor-pointer inline-block"
          >
            [ S T A R T ]
          </div>
        </div>
      ) : (
        /* 💡 메뉴를 감싸는 통의 너비와 내부 간격(gap)을 넉넉하게 확장 */
        <div className="w-full max-w-2xl flex flex-col gap-6 text-green-400 font-bold px-2 md:px-0">
          
          {/* 터미널 프롬프트 글자 크기 확대 */}
          <h2 className="text-2xl md:text-3xl text-green-500 border-b-2 border-dashed border-green-800 pb-4 mb-2 tracking-widest bg-black">
            root@otalk:~# ls -l
          </h2>
          
          {/* 💡 각 버튼의 패딩(py-6), 글자 크기(text-lg md:text-2xl) 대폭 확대 */}
          <div onClick={() => setLocation("/rules")} className="w-full border-2 border-green-900 bg-black py-6 px-6 text-left text-lg md:text-2xl text-green-500 hover:border-green-400 hover:bg-green-900/30 flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-700 group-hover:text-green-400 mr-3">&gt;</span> [0] NERD_PROTOCOL (규칙)</span>
            <span className="hidden group-hover:block animate-pulse text-green-400">█</span>
          </div>

          <div onClick={() => setLocation("/feed")} className="w-full border-2 border-green-900 bg-black py-6 px-6 text-left text-lg md:text-2xl text-green-500 hover:border-green-400 hover:bg-green-900/30 flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-700 group-hover:text-green-400 mr-3">&gt;</span> [1] DATA_FEED (활동 피드)</span>
            <span className="hidden group-hover:block animate-pulse text-green-400">█</span>
          </div>

          <div onClick={() => setLocation("/chat-list")} className="w-full border-2 border-green-900 bg-black py-6 px-6 text-left text-lg md:text-2xl text-green-500 hover:border-green-400 hover:bg-green-900/30 flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-700 group-hover:text-green-400 mr-3">&gt;</span> [2] SECURE_COMMS (비밀 대화)</span>
            <span className="hidden group-hover:block animate-pulse text-green-400">█</span>
          </div>

          <div onClick={() => setLocation("/profile")} className="w-full border-2 border-green-900 bg-black py-6 px-6 text-left text-lg md:text-2xl text-green-500 hover:border-green-400 hover:bg-green-900/30 flex justify-between items-center group cursor-pointer transition-none">
            <span><span className="text-green-700 group-hover:text-green-400 mr-3">&gt;</span> [3] MY_ARCHIVE (프로필)</span>
            <span className="hidden group-hover:block animate-pulse text-green-400">█</span>
          </div>
        </div>
      )}
      
    </div>
  );
}