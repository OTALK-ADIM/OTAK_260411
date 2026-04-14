import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center justify-center gap-16 py-10">
      
      {/* 💡 OTALK 메인 로고 (글자 크기 대폭 확대 및 네온 효과 강화) */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-[6rem] md:text-[8rem] font-bold text-green-500 tracking-[0.2em] mb-4 drop-shadow-[0_0_25px_rgba(34,197,94,0.9)]">
          OTALK
        </h1>
        <p className="text-lg md:text-xl text-green-500 font-bold tracking-[0.4em] bg-green-900/40 px-4 py-2 border border-green-500/30">
          진짜들을 위한 장소
        </p>
      </div>

      {/* 💡 로그인 게이트웨이 (경고문 크기 확대 및 꽉 찬 초록색 버튼) */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <div className="text-xs md:text-sm text-green-500 animate-pulse font-bold tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
          :: AUTHENTICATION_REQUIRED ::
        </div>
        
        {/* bg-green-500과 text-black을 적용해 완벽한 초록색 솔리드 버튼으로 변경 */}
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-green-500 text-black py-6 text-3xl md:text-4xl font-bold hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(34,197,94,0.6)] active:scale-95 cursor-pointer"
        >
          [ 로 그 인 ]
        </button>

        {/* 하단 안내문구 크기 및 가독성 개선 */}
        <div className="mt-4 flex flex-col gap-2 text-[11px] md:text-xs text-green-600 opacity-80 text-center font-bold">
          <p>* 비인가자의 접근을 엄격히 금지합니다.</p>
          <p>* 모든 접속 로그는 시스템에 실시간 기록됩니다.</p>
        </div>
      </div>

    </div>
  );
}