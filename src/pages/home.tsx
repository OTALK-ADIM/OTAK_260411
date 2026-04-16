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
      
      {/* 💡 타이틀 로고 (PC통신 접속 화면) */}
      <div className="w-full border-2 border-double border-[#c0c0c0] py-12 md:py-16 flex flex-col items-center justify-center bg-[#000080] mb-12 shadow-[5px_5px_0px_#000000]">
        <h1 className="text-7xl md:text-[8rem] text-[#ffff00] tracking-[0.2em] mb-4 font-bold">
          OTALK
        </h1>
        <p className="text-[10px] md:text-xs text-[#c0c0c0] tracking-[0.4em] uppercase">
          [ Neo_Geek_Network_System ]
        </p>
      </div>

      {/* 💡 로그인 여부에 따른 출력 분기 */}
      {!user ? (
        <div className="flex flex-col items-center gap-6 mt-4">
          <p className="text-xs md:text-sm text-[#c0c0c0] tracking-widest font-bold">
            *** 접속하려면 [ENTER] 키를 누르십시오 ***
          </p>
          <button 
            onClick={() => setLocation("/login")}
            className="border-2 border-[#c0c0c0] bg-[#000080] text-[#ffff00] px-16 py-5 text-3xl hover:bg-[#c0c0c0] hover:text-[#000080] transition-all shadow-[5px_5px_0px_#000000] font-bold"
          >
            [ E N T E R ]
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-10 text-xl tracking-[0.1em] text-[#c0c0c0] font-bold ml-4 md:ml-0">
          <h2 className="text-2xl text-[#ffff00] border-b-2 border-[#c0c0c0] pb-2 mb-4">:: MAIN_MENU ::</h2>
          <button onClick={() => setLocation("/rules")} className="text-left hover:text-[#ffff00] transition-colors">▶ 0. NERD_PROTOCOL (규칙)</button>
          <button onClick={() => setLocation("/feed")} className="text-left hover:text-[#ffff00] transition-colors">▶ 1. 활동 모집 피드</button>
          <button onClick={() => setLocation("/chat-list")} className="text-left hover:text-[#ffff00] transition-colors">▶ 2. 비밀 대화함 (수락전)</button>
          <button onClick={() => setLocation("/profile")} className="text-left hover:text-[#ffff00] transition-colors">▶ 3. 나의 데이터 (프로필)</button>
        </div>
      )}
      
    </div>
  );
}
