import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]); // 💡 최근 활동 글 상태 추가
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

      // 💡 최근 올라온 글 3개 가져오기
      const fetchRecentPosts = async () => {
        const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(3);
        if (data) setRecentPosts(data);
      };

      await fetchNotifs();
      await fetchRecentPosts();

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

  const handleNotifClick = async (notif: any) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setIsLogOpen(false);
    if (notif.type === 'DM_REQUEST') {
      setLocation("/chat-list");
    } else if (notif.type === 'COMMENT' && notif.related_id) {
      setLocation(`/post/${notif.related_id}`);
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
        .nuke-start-btn { border: 2px solid #22c55e; background-color: black; color: #4ade80; padding: clamp(1rem, 4vw, 1.5rem) clamp(2rem, 12vw, 5rem); font-size: clamp(1.1rem, 6vw, 1.5rem); letter-spacing: clamp(0.16em, 1.8vw, 0.4em); font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); white-space: nowrap; max-width: 100%; box-sizing: border-box; }
        .nuke-start-btn:hover { background-color: #22c55e; color: black; }
        .nuke-menu-container { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; width: 100%; max-width: 40rem; margin-left: auto; margin-right: auto; padding: 0 1.5rem; }
        .nuke-menu-item { font-size: 1.2rem; padding: 1rem 0; cursor: pointer; display: flex; align-items: center; text-align: left; color: #22c55e; font-weight: bold; border-bottom: 1px dashed #064e3b; }
        .nuke-menu-item:hover { color: #86efac; }
        .nuke-menu-icon { margin-right: 1rem; color: #4ade80; }
        @media (min-width: 768px) {
          .nuke-start-container { margin-top: 8rem; gap: 5rem; }
          .nuke-warning-text { font-size: 1.2rem; }
          .nuke-start-btn { padding: 2rem 6rem; font-size: 2rem; letter-spacing: 0.4em; }
          .nuke-menu-container { gap: 2rem; margin-top: 3rem; padding: 0; }
          .nuke-menu-item { font-size: 1.5rem; padding: 1.2rem 0; }
        }
      `}</style>

      {!user ? (
        <div className="nuke-start-container">
          <p className="nuke-warning-text animate-pulse">:: WARNING: UNAUTHORIZED ACCESS IS PROHIBITED ::<br/>접속을 위해 시스템 스타트 명령을 실행하십시오.</p>
          <div onClick={() => setLocation("/login")} className="nuke-start-btn">[ S T A R T ]</div>
        </div>
      ) : (
        <div className="nuke-menu-container">
          {/* 레이더 */}
          <div className="w-full mb-4 relative" ref={logRef}>
            <div onClick={() => setIsLogOpen(!isLogOpen)} className={`w-full border-2 p-4 cursor-pointer flex justify-between items-center ${unreadCount > 0 ? "border-red-500 bg-red-950/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-green-900 bg-black text-green-900"}`}>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase mb-1 font-bold">Incoming_Signals</span>
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
                        <div className="flex justify-between text-[10px] mb-2 font-bold uppercase"><span>{n.type}</span><span>{new Date(n.created_at).toLocaleString()}</span></div>
                        <div className="text-sm md:text-base font-bold">&gt; {n.from_nickname}님이 {n.type === 'COMMENT' ? "댓글을 남겼습니다." : "통신을 요청했습니다."}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* 💡 최근 수신된 신호 (최근 글) */}
          <div className="w-full mb-8 border border-green-900 p-4 bg-green-950/10">
            <h3 className="text-xs font-bold text-green-600 mb-3 tracking-widest flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              [ RECENT_TRANSMISSION ]
            </h3>
            <div className="flex flex-col gap-2">
              {recentPosts.map(post => (
                <div key={post.id} onClick={() => setLocation(`/post/${post.id}`)} className="text-sm text-green-400 hover:text-green-300 cursor-pointer truncate">
                  <span className="text-green-700 mr-2 text-[10px]">{new Date(post.created_at).toLocaleTimeString()}</span>
                  &gt; {post.title}
                </div>
              ))}
            </div>
          </div>

          <div onClick={() => setLocation("/rules")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 0. NERD_PROTOCOL</div>
          <div onClick={() => setLocation("/feed")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 1. 지하 통신망 피드</div>
          <div onClick={() => setLocation("/chat-list")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 2. 대화함</div>
          <div onClick={() => setLocation("/profile")} className="nuke-menu-item group"><span className="nuke-menu-icon">▶</span> 3. 나의 데이터</div>
        </div>
      )}
    </div>
  );
}
