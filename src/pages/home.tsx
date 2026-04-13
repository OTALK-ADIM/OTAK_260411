import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. OTALK 중앙 박스 (첨부 이미지와 100% 동일) */}
      <div className="w-full border border-green-500 py-16 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] mb-12 bg-black">
        <h1 className="text-6xl md:text-8xl font-bold text-green-500 tracking-[0.2em] mb-4 drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">
          OTALK
        </h1>
        <p className="text-[10px] md:text-xs text-green-700 tracking-[0.3em] font-mono uppercase font-bold">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 💡 2. 새로 추가된 거대 로그인 버튼 (가운데 뙇!) */}
      <div className="w-full flex justify-center mb-16">
        <button 
          onClick={() => setLocation("/login")} 
          className="border-2 border-green-500 bg-black text-green-500 px-10 py-4 text-xl md:text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse flex items-center gap-4 cursor-pointer"
        >
          <span className="text-green-500 animate-bounce">▶</span> 
          [ 시 스 템 접 속 ]
        </button>
      </div>

      {/* 3. 오리지널 메뉴 리스트 (첨부 이미지의 들여쓰기와 기호 완벽 복제) */}
      <div className="w-full flex flex-col gap-8 text-xl md:text-2xl font-bold pl-4 md:pl-12">
        <button 
          onClick={() => setLocation("/login")} 
          className="flex items-center text-left hover:text-white text-green-500 bg-transparent border-none outline-none w-fit group cursor-pointer"
        >
          <span className="text-green-500 mr-4 group-hover:text-white transition-colors">▶</span> 0. NERD_PROTOCOL (규칙)
        </button>
        
        <button 
          onClick={() => setLocation("/login")} 
          className="flex items-center text-left hover:text-white text-green-500 bg-transparent border-none outline-none w-fit group cursor-pointer"
        >
          <span className="text-green-500 mr-4 group-hover:text-white transition-colors">▶</span> 1. 활동 모집 피드
        </button>
        
        {/* 2번과 3번은 이미지처럼 화살표 없이 안쪽으로 들여쓰기 됨 */}
        <button 
          onClick={() => setLocation("/login")} 
          className="flex items-center text-left hover:text-white text-green-500 bg-transparent border-none outline-none ml-8 md:ml-9 w-fit cursor-pointer"
        >
          2. 비밀 대화함 (수락전)
        </button>
        
        <button 
          onClick={() => setLocation("/login")} 
          className="flex items-center text-left hover:text-white text-green-500 bg-transparent border-none outline-none ml-8 md:ml-9 w-fit cursor-pointer"
        >
          3. 나의 데이터 (프로필)
        </button>
      </div>

    </div>
  );
}