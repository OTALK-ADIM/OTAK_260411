import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center justify-center gap-16 py-10">
      
      {/* OTALK 메인 로고 섹션 */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-[6.5rem] md:text-[8.5rem] font-bold text-green-500 tracking-[0.15em] mb-4 drop-shadow-[0_0_25px_rgba(34,197,94,0.9)]">
          OTALK
        </h1>
        <div className="text-base md:text-lg text-green-500 font-bold tracking-[0.4em] bg-green-950/30 px-6 py-2 border border-green-500/30">
          진짜들을 위한 장소
        </div>
      </div>

      {/* 로그인 섹션 */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <div className="text-[10px] md:text-xs text-green-500 animate-pulse font-bold tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
          :: AUTHENTICATION_REQUIRED ::
        </div>
        
        {/* 💡 흰색 라인을 초록색으로: bg-green-500 강제 적용 */}
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-green-500 text-black py-5 text-2xl md:text-3xl font-bold hover:bg-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transition-all active:scale-95 cursor-pointer"
        >
          [ 로 그 인 ]
        </button>

        <div className="mt-4 flex flex-col gap-1 text-[10px] md:text-[11px] text-green-600 opacity-70 text-center font-bold">
          <p>* 비인가자의 접근을 엄격히 금지합니다.</p>
          <p>* 모든 접속 로그는 시스템에 실시간 기록됩니다.</p>
        </div>
      </div>

    </div>
  );
}