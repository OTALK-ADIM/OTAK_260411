import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [, setLocation] = useLocation();
  const [hasNotification, setHasNotification] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    let channel: any;

    const initRadar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 초기 안 읽은 알림 확인
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("target_user_id", user.id)
        .eq("is_read", false);
      
      setNotifCount(count || 0);
      if (count && count > 0) setHasNotification(true);

      // 2. 💡 실시간 알림 채널 구독 (데이터베이스의 변화를 감지)
      channel = supabase.channel(`notif:${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `target_user_id=eq.${user.id}` },
          () => {
            setHasNotification(true);
            setNotifCount(prev => prev + 1);
            console.log(">> [SYSTEM_RADAR]: NEW_INCOMING_SIGNAL_DETECTED");
          }
        )
        .subscribe();
    };

    initRadar();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // 💡 알림 뱃지 클릭 시: 모두 읽음 처리하고 대화함으로 이동
  const handleAlertClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("notifications").update({ is_read: true }).eq("target_user_id", user.id);
    setHasNotification(false);
    setNotifCount(0);
    setLocation("/chat-list"); 
  };

  return (
    <header className="w-full border-b-2 border-green-500 bg-black p-4 flex justify-between items-center font-mono shrink-0">
      <div onClick={() => setLocation("/feed")} className="text-2xl font-bold text-green-500 cursor-pointer tracking-tighter hover:text-green-300">
        OTALK<span className="text-xs ml-2 opacity-50">v1.5</span>
      </div>

      <div className="flex items-center gap-6">
        {/* 💡 실시간 레이더 알림 뱃지 */}
        <div onClick={handleAlertClick} className="relative cursor-pointer group">
          <span className={`text-sm font-bold ${hasNotification ? "text-red-500 animate-pulse" : "text-green-900"}`}>
            {hasNotification ? `[ ALERT_${notifCount} ]` : "[ RADAR_IDLE ]"}
          </span>
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]"></div>
          )}
        </div>
        
        <div onClick={() => setLocation("/chat-list")} className="text-green-500 hover:text-white cursor-pointer text-sm font-bold">2. 대화함</div>
        <div onClick={() => setLocation("/profile")} className="text-green-500 hover:text-white cursor-pointer text-sm font-bold">3. 프로필</div>
      </div>
    </header>
  );
}