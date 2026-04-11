import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col gap-8 mt-4"> 
      
      {/* OTALK 중앙 타이틀 박스 */}
      <div className="border-2 border-green-500 py-10 text-center shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-green-950/10">
        <h2 className="text-4xl md:text-6xl font-bold tracking-[0.2em] mb-3 text-green-400">
          OTALK
        </h2>
        <div className="text-xs opacity-60 tracking-widest font-mono">NEO_GEEK_NETWORK_SYSTEM</div>
      </div>

      {/* 메인 메뉴 리스트 */}
      <div className="flex flex-col gap-6 pl-4 md:pl-10 font-bold text-xl md:text-2xl">
        <button onClick={() => setLocation("/rules")} className="flex items-center text-left text-green-300 hover:text-black hover:bg-green-500 transition-all w-max px-2 py-1">
          <span className="mr-4 text-green-500">▶</span> 0. NERD_PROTOCOL (규칙)
        </button>
        <button onClick={() => setLocation("/feed")} className="flex items-center text-left hover:text-black hover:bg-green-500 transition-all w-max px-2 py-1">
          <span className="mr-4 text-green-500">▶</span> 1. 활동 모집 피드
        </button>
        <button onClick={() => setLocation("/chat")} className="flex items-center text-left hover:text-black hover:bg-green-500 transition-all w-max px-2 py-1">
          <span className="mr-4 invisible">▶</span> 2. 비밀 대화함 (수락전)
        </button>
        <button onClick={() => setLocation("/profile")} className="flex items-center text-left hover:text-black hover:bg-green-500 transition-all w-max px-2 py-1">
          <span className="mr-4 invisible">▶</span> 3. 나의 데이터 (프로필)
        </button>
      </div>
    </div>
  );
}