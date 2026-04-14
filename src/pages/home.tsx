import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center justify-center gap-12 py-10">
      
      {/* OTALK 메인 로고 */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-7xl font-bold text-green-500 tracking-[0.2em] mb-3 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-sm text-green-700 font-bold tracking-[0.3em] bg-green-950/20 px-2 py-1">
          진짜들을 위한 장소
        </p>
      </div>

      {/* 로그인 게이트웨이 버튼 */}
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="text-[10px] text-green-800 animate-pulse font-bold tracking-[0.2em]">
          :: AUTHENTICATION_REQUIRED ::
        </div>
        
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-black text-green-500 py-6 text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95 cursor-pointer"
        >
          [ 로 그 인 ]
        </button>

        <div className="mt-4 flex flex-col gap-2 text-[10px] text-green-900 opacity-60 text-center font-bold">
          <p>* 비인가자의 접근을 엄격히 금지합니다.</p>
          <p>* 모든 접속 로그는 시스템에 실시간 기록됩니다.</p>
        </div>
      </div>

    </div>
  );
}