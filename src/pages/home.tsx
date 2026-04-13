import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    // 💡 화면의 가운데에 잘 보이도록 flex-col 과 justify-center 적용
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-16 text-center"> 
      
      {/* 💡 거대한 OTALK 로고 (네온 감성 강화) */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-7xl md:text-[10rem] font-bold text-green-500 tracking-[0.25em] mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-xs md:text-sm text-green-900 tracking-[0.5em] font-mono uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 💡 압도적인 입국 허가 요청 버튼 (LOGIN) */}
      <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-sm">
        <p className="text-[10px] text-green-700 animate-pulse font-bold tracking-widest">
          :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
        </p>
        
        {/* 로그인 전 화면이므로 눌렀을 때 /login 으로 이동 */}
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-black text-green-500 p-6 text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer"
        >
          [ LOGIN ]
        </button>
      </div>

    </div>
  );
}