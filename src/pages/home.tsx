import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center mt-2">
      
      {/* OTALK 네온 박스 */}
      <div className="w-full border border-green-500 py-10 flex flex-col items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-black">
        <h1 className="text-6xl md:text-7xl font-bold text-green-400 tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
          OTALK
        </h1>
        <p className="text-[10px] md:text-xs text-green-600 tracking-[0.3em] uppercase">
          NEO_GEEK_NETWORK_SYSTEM
        </p>
      </div>

      {/* 경고 문구 */}
      <p className="text-[10px] text-green-600 font-bold tracking-widest animate-pulse mb-8">
        :: RESTRICTED AREA - AUTHENTICATION REQUIRED ::
      </p>

      {/* 💡 거대하고 누르기 편한 START 버튼 */}
      <button 
        onClick={() => setLocation("/login")}
        className="border-2 border-green-500 bg-black text-green-400 px-16 py-4 text-2xl font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.4)]"
      >
        [ S T A R T ]
      </button>

    </div>
  );
}