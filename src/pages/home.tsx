import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center gap-16 py-10">
      
      {/* 💡 메인 로고 섹션 */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-8xl md:text-[10rem] font-bold text-green-500 tracking-[0.2em] mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.7)]">
          OTALK
        </h1>
        <p className="text-sm md:text-base text-green-700 tracking-[0.4em] font-bold uppercase">
          진짜들을 위한 장소
        </p>
      </div>

      {/* 💡 거대한 로그인 버튼 섹션 */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-[10px] text-green-800 animate-pulse font-bold tracking-widest">
          :: AUTHENTICATION_REQUIRED ::
        </div>
        
        <button 
          onClick={() => setLocation("/login")}
          className="w-full border-2 border-green-500 bg-black text-green-500 p-8 text-3xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_25px_rgba(34,197,94,0.4)] active:scale-95"
        >
          [ 로 그 인 ]
        </button>

        <p className="text-[10px] text-green-900 opacity-50 text-center leading-relaxed">
          * 비인가자의 접근을 엄격히 금지합니다.<br />
          * 모든 접속 로그는 시스템에 기록됩니다.
        </p>
      </div>

    </div>
  );
}