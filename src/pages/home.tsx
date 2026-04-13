import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const menuItems = [
    { id: "0", cat: "PROTOCOL", title: "NERD_PROTOCOL (규칙)", path: "/rules" },
    { id: "1", cat: "ARCHIVE", title: "활동 모집 피드", path: "/feed" },
    { id: "2", cat: "COMMS", title: "비밀 대화함 (수락전)", path: "/chat-list" },
    { id: "3", cat: "USER_DATA", title: "나의 데이터 (프로필)", path: "/profile" },
  ];

  return (
    <div className="w-full flex flex-col gap-8 font-mono">
      {/* 중앙 메인 박스: 피드 페이지의 패널 스타일 적용 */}
      <div className="bg-[#0a0a0a] border-2 border-green-500 p-12 text-center shadow-[0_0_20px_rgba(0,255,0,0.15)] relative overflow-hidden">
        {/* 미세한 그리드 효과 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        
        <h2 className="text-6xl md:text-7xl font-bold tracking-[0.25em] text-green-500 mb-2 relative z-10 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
          OTALK
        </h2>
        <p className="text-[10px] opacity-40 tracking-[0.5em] uppercase relative z-10">
          Neo_Geek_Network_System
        </p>
      </div>

      {/* 메뉴 리스트: 피드의 게시판 목록과 1:1 대응 디자인 */}
      <div className="flex flex-col gap-2">
        <div className="border-b border-green-500/50 pb-1 mb-2">
          <span className="text-[10px] font-bold text-green-700">[ SELECT_BOOT_SEQUENCE ]</span>
        </div>
        
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setLocation(item.path)}
            className="group flex justify-between items-center border-b border-green-500/10 pb-3 pt-1 cursor-pointer hover:bg-green-500/5 transition-all px-2"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs text-green-900 group-hover:text-green-500">{item.id}.</span>
              <span className="text-base md:text-xl font-bold group-hover:underline">
                <span className="text-[10px] opacity-40 mr-2">[{item.cat}]</span>
                {item.title}
              </span>
            </div>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">RUN_CMD {">"}</span>
          </div>
        ))}
      </div>

      <div className="bg-green-900/10 border border-green-900/30 p-4 text-[10px] opacity-50 leading-relaxed">
        * NOTICE: ALL CONNECTIONS ARE SECURED VIA NERD_PROTOCOL.<br />
        * UNAUTHORIZED DATA MODIFICATION MAY RESULT IN SYSTEM LOCKDOWN.
      </div>
    </div>
  );
}