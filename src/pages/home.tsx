import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let channel: any;
    const initRadar = async () => {
      if (!user) return;
      const fetchNotifs = async () => {
        const { data } = await supabase.from("notifications").select("*").eq("target_user_id", user.id).order("created_at", { ascending: false }).limit(10);
        if (data) setNotifs(data);
      };
      await fetchNotifs();

      const uniqueChannelName = `notif:${user.id}-${Date.now()}`;
      channel = supabase.channel(uniqueChannelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `target_user_id=eq.${user.id}` }, () => {
          fetchNotifs();
        })
        .subscribe();
    };
    initRadar();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user]);

  // 💡 알람 클릭 시 '순간이동' 처리 함수
  const handleNotifClick = async (notif: any) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setIsLogOpen(false);
    
    // 💡 관련 ID가 있으면 해당 페이지로, 없으면 기본 목록으로 이동
    if (notif.type === 'DM_REQUEST') {
      setLocation("/chat-list"); // DM 신청은 목록으로
    } else if (notif.type === 'COMMENT' && notif.related_id) {
      setLocation(`/post/${notif.related_id}`); // 댓글 알람은 해당 글로 순간이동!
    } else {
      setLocation("/feed");
    }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="w-full flex flex-col font-mono relative">
      <style>{`
        .nuke-start-container { display: flex; flex-direction: column; align-items: center; margin-top: 6rem; gap: 4rem; padding: 0 1rem; }
        .nuke-warning-text { color: #22c55e; letter-spacing: 0.15em; font-weight: bold; text-align: center; line-height: 2.5; font-size: 1rem; }
        .nuke-start-btn { border: 2px solid #22c55e; background-color: black; color: #4ade80; padding: 1.5rem 5rem; font-size: 1.5rem; letter-spacing: 0.4em; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .nuke-start-btn:hover { background-color: #22c55e; color: black; }
        .nuke-menu-container { display: flex; flex-direction: column; gap: 1.8rem; margin-top: 2rem; width: 100%; max-width: 40rem; margin-left: auto; margin-right: auto; padding: 0 1.5rem; }
        .nuke-menu-item { font-size: 1.2rem; padding: 1rem 0; cursor: pointer; display: flex; align-items: center; text-align: left; color: #22c55e; font-weight: bold; }
        .nuke-menu-item:hover { color: #86efac; }
        .nuke-menu-icon { margin-right: 1rem; color: #4ade80; }
        @media (min-width: 768px) {
          .nuke-start-container { margin-top: 8rem; gap: 5rem; }
          .nuke-warning-text { font-size: 1.2rem; }
          .nuke-start-btn { padding: 2rem 6rem; font-size: 2rem; }
          .nuke-menu-container { gap: 2.5rem; margin-top: 3rem; padding: 0; }
          .nuke-menu-item { font-size: 1.8rem; padding: 1.5rem 0; }
        }
      `}</style>

      {!user ? (
        <div className="nuke-start-container">
          <p className="nuke-warning-text animate-pulse">:: WARNING: UNAUTHORIZED ACCESS IS PROHIBITED ::<br/>접속을 위해 시스템 스타트 명령을 실행하십시오.</p>
          <div onClick={() => setLocation("/login")} className="nuke-start-btn">[ S T A R T ]</div>
        </div>
      ) : (
        <div className="nuke-menu-container">
          <div className="w-full mb-8 relative" ref={logRef}>
            <div onClick={() => setIsLogOpen(!isLogOpen)} className={`w-full border-2 p-4 cursor-pointer flex justify-between items-center ${unreadCount > 0 ? "border-red-500 bg-red-950/20 text-red-500" : "border-green-900 bg-black text-green-900"}`}>
              <div className="flex flex-col">
                <span className="text-xs uppercase mb-1">Incoming_Signals</span>
                <span className="text-xl md:text-2xl font-bold">{unreadCount > 0 ? `[ ALERT_DETECTED : ${unreadCount} ]` : "[ RADAR_IDLE ]"}</span>
              </div>
              <div className={`w-4 h-4 rounded-full ${unreadCount > 0 ? "bg-red-500 animate-pulse" : "bg-green-900"} border border-black`}></div>
            </div>
            {isLogOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-black border-2 border-green-500 z-50">
                <div className="bg-green-900 text-black text-xs font-bold px-3 py-2 uppercase">Signal_Logs</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifs.length === 0 ? <div className="p-8 text-center text-green-900 text-sm italic">-- NO_SIGNALS --</div> : 
                    notifs.map(n => (
                      <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 border-b border-green-900 cursor-pointer hover:bg-green-500 hover:text-black ${!n.is_read ? "bg-green-950/20 text-green-400" : "opacity-40 text-green-600"}`}>
                        <div className="flex justify-between text-[10px] mb-2 font-bold uppercase">
                          <span>{n.type}</span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm md:text-base font-bold">&gt; {n.from_nickname}님이 {n.type === 'COMMENT' ? "댓글을 남겼습니다." : "통신을 요청했습니다."}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
          <div onClick={() => setLocation("/rules")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 0. NERD_PROTOCOL</div>
          <div onClick={() => setLocation("/feed")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 1. 활동 모집 피드</div>
          <div onClick={() => setLocation("/chat-list")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 2. 대화함</div>
          <div onClick={() => setLocation("/profile")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 3. 나의 데이터</div>
        </div>
      )}
    </div>
  );
}