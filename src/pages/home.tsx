import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      {/* 💡 admin.tsx / feed.tsx와 완벽하게 동일한 상단 바 구조 */}
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold tracking-widest text-lg">
        [ N E O _ G E E K _ S Y S T E M ]
      </div>

      {/* 💡 profile.tsx와 동일한 컨테이너 패널 구조 */}
      <div className="bg-[#0a0a0a] p-10 border border-green-500/50 flex flex-col items-center gap-3 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <h1 className="text-5xl md:text-7xl font-bold text-green-500 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
          OTALK
        </h1>
        <p className="text-xs opacity-50 tracking-widest uppercase">
          Neo_Geek_Network_System
        </p>
      </div>

      {/* 💡 메뉴 리스트: 일반 게시판 스타일로 통일 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setLocation("/rules")}
          className="bg-[#0a0a0a] border border-green-500/30 p-4 text-left font-bold hover:bg-green-500 hover:text-black transition-colors flex items-center"
        >
          <span className="mr-4 text-green-500">▶</span> 0. NERD_PROTOCOL (규칙)
        </button>
        <button
          onClick={() => setLocation("/feed")}
          className="bg-[#0a0a0a] border border-green-500/30 p-4 text-left font-bold hover:bg-green-500 hover:text-black transition-colors flex items-center"
        >
          <span className="mr-4 text-green-500">▶</span> 1. 활동 모집 피드
        </button>
        <button
          onClick={() => setLocation("/chat-list")}
          className="bg-[#0a0a0a] border border-green-500/30 p-4 text-left font-bold hover:bg-green-500 hover:text-black transition-colors flex items-center"
        >
          <span className="mr-4 opacity-0">▶</span> 2. 비밀 대화함 (수락전)
        </button>
        <button
          onClick={() => setLocation("/profile")}
          className="bg-[#0a0a0a] border border-green-500/30 p-4 text-left font-bold hover:bg-green-500 hover:text-black transition-colors flex items-center"
        >
          <span className="mr-4 opacity-0">▶</span> 3. 나의 데이터 (프로필)
        </button>
      </div>

      {/* 💡 하단 제어 버튼: feed.tsx의 버튼 방식과 동일 */}
      <div className="mt-4 flex justify-end">
        {isLoggedIn ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setIsLoggedIn(false);
            }}
            className="border border-green-500 px-4 py-2 text-xs font-bold hover:bg-green-500 hover:text-black transition-colors"
          >
            [ 접속 해제 (LOGOUT) ]
          </button>
        ) : (
          <button
            onClick={() => setLocation("/login")}
            className="border border-green-500 px-4 py-2 text-xs font-bold hover:bg-green-500 hover:text-black transition-colors"
          >
            [ 시스템 접속 (LOGIN) ]
          </button>
        )}
      </div>
    </div>
  );
}