import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* OTALK 네온 박스 (1번 이미지) */}
      <div className="w-full border border-green-500 py-16 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.15)] mb-12 bg-black">
        <h1 className="text-7xl md:text-[8rem] text-green-400 tracking-[0.2em] mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-xs md:text-sm text-green-600 tracking-[0.4em] uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* START 버튼 영역 (1번 이미지) */}
      <div className="flex flex-col items-center gap-6 mt-4">
        <p className="text-xs md:text-sm text-green-500 tracking-widest">
          :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
        </p>
        
        <button 
          onClick={() => setLocation("/login")}
          className="border border-green-500 bg-black text-green-400 px-12 py-3 text-2xl tracking-[0.3em] hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          [ S T A R T ]
        </button>
      </div>

    </div>
  );
}