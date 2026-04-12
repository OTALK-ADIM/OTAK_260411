import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full flex flex-col items-center space-y-12"> 
      
      {/* OTALK 중앙 박스 - 이미지와 동일한 비율 */}
      <div className="w-full border-2 border-green-500 py-16 text-center shadow-[0_0_30px_rgba(34,197,94,0.15)] bg-black relative">
        <h2 className="text-7xl md:text-8xl font-bold tracking-[0.3em] text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">
          OTALK
        </h2>
        <div className="text-[10px] opacity-30 tracking-[0.5em] mt-4 uppercase">
          Neo_Geek_Network_System
        </div>
      </div>

      {/* 메뉴 리스트 - 정렬 고정 */}
      <div className="w-full max-w-2xl flex flex-col gap-8 self-start md:self-center pl-4">
        <button onClick={() => setLocation("/rules")} className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-4 py-1 text-2xl font-bold italic">
          <span className="mr-6 group-hover:text-black transition-colors">▶</span> 0. NERD_PROTOCOL (규칙)
        </button>
        <button onClick={() => setLocation("/feed")} className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-4 py-1 text-2xl font-bold italic">
          <span className="mr-6 group-hover:text-black transition-colors">▶</span> 1. 활동 모집 피드
        </button>
        <button onClick={() => setLocation("/chat-list")} className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-4 py-1 text-2xl font-bold italic">
          <span className="mr-6 opacity-0">▶</span> 2. 비밀 대화함 (수락전)
        </button>
        <button onClick={() => setLocation("/profile")} className="group flex items-center text-left text-green-500 hover:text-black hover:bg-green-500 transition-all w-max px-4 py-1 text-2xl font-bold italic">
          <span className="mr-6 opacity-0">▶</span> 3. 나의 데이터 (프로필)
        </button>
      </div>
    </div>
  );
}