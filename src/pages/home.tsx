import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full space-y-12"> 
      
      {/* OTALK 중앙 타이틀 박스 - App.tsx의 프레임 안에서 정밀하게 배치 */}
      <div className="border-2 border-green-500 py-12 text-center shadow-[0_0_20px_rgba(34,197,94,0.2)] bg-green-950/5 relative overflow-hidden">
        {/* 아주 미세한 스캔라인 효과 추가 (테크니컬 아티스트 감성) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
        
        <h2 className="text-6xl md:text-7xl font-bold tracking-[0.25em] mb-4 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
          OTALK
        </h2>
        <div className="text-[10px] md:text-xs opacity-40 tracking-[0.4em] font-mono uppercase">
          Neo_Geek_Network_System
        </div>
      </div>

      {/* 메인 메뉴 리스트 - 간격과 정렬 최적화 */}
      <div className="flex flex-col gap-8 pl-2 md:pl-12">
        <button 
          onClick={() => setLocation("/rules")} 
          className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-3 py-1 text-xl md:text-2xl font-bold italic"
        >
          <span className="mr-6 text-green-500 group-hover:text-black">▶</span> 
          0. NERD_PROTOCOL (규칙)
        </button>

        <button 
          onClick={() => setLocation("/feed")} 
          className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-3 py-1 text-xl md:text-2xl font-bold italic"
        >
          <span className="mr-6 text-green-500 group-hover:text-black">▶</span> 
          1. 활동 모집 피드
        </button>

        <button 
          onClick={() => setLocation("/chat-list")} 
          className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-3 py-1 text-xl md:text-2xl font-bold italic"
        >
          <span className="mr-6 opacity-0">▶</span> 
          2. 비밀 대화함 (수락전)
        </button>

        <button 
          onClick={() => setLocation("/profile")} 
          className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-3 py-1 text-xl md:text-2xl font-bold italic"
        >
          <span className="mr-6 opacity-0">▶</span> 
          3. 나의 데이터 (프로필)
        </button>
      </div>

    </div>
  );
}