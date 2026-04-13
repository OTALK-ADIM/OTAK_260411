import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-16">
      
      {/* 오타쿠 슬로건 */}
      <div className="w-full border-y-2 border-green-500 py-4 text-center">
        <h2 className="text-green-500 font-bold tracking-[0.5em] md:tracking-[1em] text-sm md:text-lg">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </h2>
      </div>

      {/* 거대한 OTALK 로고 */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-7xl md:text-[9rem] font-bold text-green-500 tracking-[0.25em] mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-xs md:text-sm text-green-900 tracking-[0.5em] font-mono uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 유일한 출입구 (로그인 버튼) */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <p className="text-[10px] text-green-700 animate-pulse font-bold tracking-widest">
          :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
        </p>
        
        <button 
          onClick={() => setLocation("/login")}
          className="border-2 border-green-500 bg-black text-green-500 px-12 py-4 text-xl md:text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ 시 스 템 접 속 ]
        </button>
      </div>

    </div>
  );
}