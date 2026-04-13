import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10">
      
      {/* 1. OTALK 중앙 로고 박스 */}
      <div className="w-full max-w-lg border-2 border-green-500 py-16 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] mb-20 bg-black">
        <h1 className="text-6xl md:text-7xl font-bold text-green-500 tracking-[0.2em] mb-4 drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">
          OTALK
        </h1>
        <p className="text-xs text-green-700 tracking-[0.3em] font-mono uppercase font-bold">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 2. 거대한 시스템 접속(로그인) 버튼 */}
      <div className="flex flex-col items-center gap-6">
        <span className="text-[10px] md:text-xs text-green-700 font-bold tracking-widest animate-pulse">
          :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
        </span>
        
        <button 
          onClick={() => setLocation("/login")} 
          className="border-2 border-green-500 bg-black text-green-500 px-12 py-5 text-2xl font-bold hover:bg-green-500 hover:text-black transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ 시 스 템 접 속 ]
        </button>
      </div>

    </div>
  );
}