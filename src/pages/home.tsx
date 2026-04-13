import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* OTALK 중앙 박스 (이미지와 동일한 네온 느낌) */}
      <div className="w-full border-2 border-green-500 py-16 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)] mb-16 bg-black">
        <h1 className="text-6xl md:text-8xl font-bold text-green-500 tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
          OTALK
        </h1>
        <p className="text-xs md:text-sm text-green-900 tracking-widest font-mono">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 메뉴 리스트 (이미지와 정확히 동일한 스타일) */}
      <div className="w-full max-w-2xl flex flex-col gap-8 text-xl md:text-2xl font-bold pl-4 md:pl-10">
        <button 
          onClick={() => setLocation("/rules")} 
          className="flex items-center text-left hover:underline text-green-500 bg-transparent border-none outline-none w-fit"
        >
          <span className="text-green-500 mr-4">▶</span> 0. NERD_PROTOCOL (규칙)
        </button>
        
        <button 
          onClick={() => setLocation("/feed")} 
          className="flex items-center text-left hover:underline text-green-500 bg-transparent border-none outline-none w-fit"
        >
          <span className="text-green-500 mr-4">▶</span> 1. 활동 모집 피드
        </button>
        
        <button 
          onClick={() => setLocation("/chat-list")} 
          className="flex items-center text-left hover:underline text-green-500 bg-transparent border-none outline-none ml-9 w-fit"
        >
          2. 비밀 대화함 (수락전)
        </button>
        
        <button 
          onClick={() => setLocation("/profile")} 
          className="flex items-center text-left hover:underline text-green-500 bg-transparent border-none outline-none ml-9 w-fit"
        >
          3. 나의 데이터 (프로필)
        </button>
      </div>

    </div>
  );
}