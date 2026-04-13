import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  // 피드의 게시글 리스트와 동일한 디자인 DNA를 가진 메뉴 구조
  const menuItems = [
    { id: "0", cat: "PROTOCOL", title: "NERD_PROTOCOL (규칙)", path: "/rules" },
    { id: "1", cat: "ARCHIVE", title: "활동 모집 피드", path: "/feed" },
    { id: "2", cat: "COMMS", title: "비밀 대화함 (수락전)", path: "/chat-list" },
    { id: "3", cat: "USER_DATA", title: "나의 데이터 (프로필)", path: "/profile" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      {/* 중앙 로고: 피드의 검색바/카테고리와 동일한 박스 모델 적용 */}
      <div className="bg-[#0a0a0a] border-2 border-green-500 p-8 text-center shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <h2 className="text-5xl md:text-6xl font-bold tracking-[0.2em] text-green-500 mb-2">
          OTALK
        </h2>
        <p className="text-[10px] opacity-40 tracking-widest uppercase">
          Neo_Geek_Network_System
        </p>
      </div>

      {/* 메뉴 섹션 헤더 */}
      <div className="border-b border-green-500 pb-1 flex justify-between items-center">
        <span className="text-xs font-bold font-mono text-green-700">[ MAIN_MENU_LIST ]</span>
        <span className="text-[10px] opacity-40">TOTAL_ITEMS: 04</span>
      </div>

      {/* 피드 리스트와 100% 동일한 버튼 리스트 디자인 */}
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setLocation(item.path)}
            className="flex flex-col border-b border-green-500/20 pb-2 cursor-pointer group"
          >
            <div className="flex justify-between items-center group-hover:bg-green-500/10 p-2 transition-all">
              <div className="truncate text-sm md:text-base font-bold text-green-500">
                <span className="opacity-50 mr-2 text-xs group-hover:text-black">[{item.cat}]</span>
                {item.title}
              </div>
              <div className="text-[10px] opacity-40 self-center ml-2 group-hover:text-green-500">
                {">>>"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 시스템 하단 메시지 */}
      <div className="mt-4 p-3 bg-green-900/10 border border-green-900/30 text-[10px] opacity-60 leading-relaxed text-center">
        * 주의: 모든 접근 로그는 중앙 서버에 영구 기록됩니다.<br />
        인증되지 않은 소스 코드는 시스템 마비의 원인이 될 수 있습니다.
      </div>
    </div>
  );
}