import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");

  // 로그인된 유저 정보 가져오기 (항상 logged-in UX)
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.nickname) setNickname(profile.nickname);
      }
    };
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNickname("");
  };

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      {/* 상단 바 */}
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold tracking-widest text-lg">
        [ N E O _ G E E K _ S Y S T E M ]
      </div>

      {/* 메인 로고 + 환영 메시지 */}
      <div className="bg-[#0a0a0a] p-10 border border-green-500/50 flex flex-col items-center gap-3 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <h1 className="text-5xl md:text-7xl font-bold text-green-500 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
          OTALK
        </h1>
        <p className="text-xs opacity-50 tracking-widest uppercase">
          Neo_Geek_Network_System
        </p>
        {nickname && (
          <p className="text-green-400 text-sm mt-4 font-bold">WELCOME, {nickname}</p>
        )}
      </div>

      {/* 메뉴 리스트 (항상 로그인 후 화면) */}
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
          <span className="mr-4 text-green-500">▶</span> 2. 비밀 대화함
        </button>
        <button
          onClick={() => setLocation("/profile")}
          className="bg-[#0a0a0a] border border-green-500/30 p-4 text-left font-bold hover:bg-green-500 hover:text-black transition-colors flex items-center"
        >
          <span className="mr-4 text-green-500">▶</span> 3. 나의 데이터 (프로필)
        </button>
      </div>

      {/* 로그아웃 버튼 (항상 표시) */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="border border-green-500 px-4 py-2 text-xs font-bold hover:bg-green-500 hover:text-black transition-colors"
        >
          [ 접속 해제 (LOGOUT) ]
        </button>
      </div>
    </div>
  );
}