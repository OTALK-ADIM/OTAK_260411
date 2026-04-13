import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    // 💡 화면의 가운데에 잘 보이도록 flex-col 과 justify-center 적용
    <div className="w-full flex flex-col items-center gap-16 justify-center text-center"> 
      
      {/* 💡 1. 오타쿠 슬로건 (글로벌 프레임에서 이사 옴) */}
      <div className="w-full border-y-2 border-green-500 py-4">
        <h2 className="text-green-500 font-bold tracking-[0.5em] md:tracking-[1em] text-sm md:text-lg">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </h2>
      </div>

      {/* 💡 2. 거대한 OTALK 로고 (네온 감성 강화) */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-7xl md:text-[10rem] font-bold text-green-500 tracking-[0.25em] mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-xs md:text-sm text-green-900 tracking-[0.5em] font-mono uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 💡 3. 압도적인 입국 허가 요청 버튼 (START) */}
      <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-md">
        <p className="text-[10px] text-green-700 animate-pulse font-bold tracking-widest">
          :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
        </p>
        
        {/* 로그인 전 화면이므로 눌렀을 때 /login 으로 이동 */}
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-black text-green-500 p-6 text-3xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ S T A R T ]
        </button>
      </div>

    </div>
  );
}