import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [, setLocation] = useLocation();
  const [notifs, setNotifs] = useState<any[]>([]); // 알림 리스트
  const [isLogOpen, setIsLogOpen] = useState(false); // 로그 창 열림 상태
  const [currentUser, setCurrentUser] = useState<any>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // 1. 알림 데이터 가져오기
  const fetchNotifs = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10); // 최근 10개만 표시
    if (data) setNotifs(data);
  };

  useEffect(() => {
    let channel: any;

    const initRadar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
      fetchNotifs(user.id);

      // 실시간 알림 감시
      channel = supabase.channel(`notif:${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `target_user_id=eq.${user.id}` },
          () => {
            fetchNotifs(user.id); // 새 알림 오면 리스트 갱신
            console.log(">> [SYSTEM_RADAR]: NEW_INCOMING_SIGNAL");
          }
        )
        .subscribe();
    };

    initRadar();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // 외부 클릭 시 알림창 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (logRef.current && !logRef.current.contains(e.target as Node)) {
        setIsLogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 알림 클릭 시 처리
  const handleNotifClick = async (notif: any) => {
    // 1. 읽음 처리
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setIsLogOpen(false);
    
    // 2. 이동 (DM 요청이면 대화함으로, 댓글이면 피드로 일단 이동 - 추후 게시글 ID 연동 가능)
    if (notif.type === 'DM_REQUEST') {
      setLocation("/chat-list");
    } else {
      setLocation("/feed"); 
    }
    fetchNotifs(currentUser.id);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <header className="w-full border-b-2 border-green-500 bg-black p-4 flex justify-between items-center font-mono shrink-0 relative z-50">
      {/* 로고 */}
      <div onClick={() => setLocation("/feed")} className="text-2xl font-bold text-green-500 cursor-pointer tracking-tighter hover:text-green-300">
        OTALK<span className="text-xs ml-2 opacity-50">v1.5</span>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* 💡 알림 레이더 아이콘 */}
        <div className="relative">
          <div 
            onClick={() => setIsLogOpen(!isLogOpen)}
            className={`cursor-pointer px-2 py-1 border transition-all ${
              unreadCount > 0 
                ? "border-red-500 text-red-500 animate-pulse bg-red-950/20" 
                : "border-green-900 text-green-900 bg-black"
            } text-[10px] md:text-xs font-bold`}
          >
            {unreadCount > 0 ? `[ ALERT_${unreadCount} ]` : "[ RADAR_IDLE ]"}
          </div>

          {/* 💡 알림 기록 팝업 (SIGNAL_LOG) */}
          {isLogOpen && (
            <div 
              ref={logRef}
              className="absolute right-0 mt-4 w-72 md:w-80 bg-black border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-[100]"
            >
              <div className="bg-green-900 text-black text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                Incoming_Signal_Logs
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-8 text-center text-green-900 text-xs italic">-- NO_SIGNALS_DETECTED --</div>
                ) : (
                  notifs.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotifClick(n)}
                      className={`p-3 border-b border-green-900 cursor-pointer hover:bg-green-500 hover:text-black transition-none ${!n.is_read ? "bg-green-950/20" : "opacity-40"}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-bold uppercase">
                          {n.type === 'COMMENT' ? "Type: COMMENT" : "Type: DM_REQUEST"}
                        </span>
                        <span className="text-[8px] opacity-70">
                          {new Date(n.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs font-bold">
                        &gt; {n.from_nickname}님이 {n.type === 'COMMENT' ? "댓글을 남겼습니다." : "통신을 요청했습니다."}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-green-900 text-center">
                <button 
                  onClick={() => setIsLogOpen(false)}
                  className="text-[10px] text-green-700 hover:text-green-400 font-bold"
                >
                  [ CLOSE_TERMINAL ]
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div onClick={() => setLocation("/chat-list")} className="text-green-500 hover:text-white cursor-pointer text-xs md:text-sm font-bold tracking-tighter uppercase underline decoration-dashed underline-offset-4">2. 대화함</div>
        <div onClick={() => setLocation("/profile")} className="text-green-500 hover:text-white cursor-pointer text-xs md:text-sm font-bold tracking-tighter uppercase underline decoration-dashed underline-offset-4">3. 프로필</div>
      </div>
    </header>
  );
}