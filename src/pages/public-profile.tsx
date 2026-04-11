import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";

export default function PublicProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [stats, setStats] = useState({ posts: 0, comments: 0 });

  useEffect(() => {
    if (!params.userId) return;
    const allUsers = JSON.parse(localStorage.getItem("nerd_users") || "[]");
    
    // 💡 닉네임이나 ID로 유저 검색
    const user = allUsers.find((u: any) => u.nickname === params.userId || u.id === params.userId);
    
    const bio = localStorage.getItem(`bio_${params.userId}`) || "이 요원은 아직 자기소개를 기록하지 않았습니다.";
    const badge = localStorage.getItem(`badge_${params.userId}`) || "LV.1 요원";
    
    setTargetUser(user ? { ...user, bio, badge } : { id: params.userId, nickname: params.userId, bio, badge });

    let pCount = 0; 
    let cCount = 0;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("post_")) {
        const p = JSON.parse(localStorage.getItem(key) || "{}");
        if (p.author === params.userId) pCount++;
      }
      if (key.startsWith("comments_")) {
        const cs = JSON.parse(localStorage.getItem(key) || "[]");
        cs.forEach((c: any) => { if (c.author === params.userId) cCount++; });
      }
    });
    setStats({ posts: pCount, comments: cCount });
  }, [params.userId]);

  if (!targetUser) return <div className="p-6 text-green-500 font-mono">DATA LOADING...</div>;

  return (
    <div className="w-full flex flex-col gap-6 mt-6 font-mono pb-10">
      <div className="border-b-2 border-green-500 pb-2 flex justify-between items-center font-bold">
        <button onClick={() => setLocation("/feed")} className="text-xs border border-green-500 px-2 hover:bg-green-500 hover:text-black">{"< BACK"}</button>
        <span>[ USER_PROTOCOL_VIEW ]</span>
        <span className="text-[10px] opacity-50">ID: {targetUser.id}</span>
      </div>

      <div className="bg-[#0a0a0a] p-6 border-2 border-green-500/50 flex flex-col gap-4 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-green-400">{targetUser.nickname}</span>
          <span className="border border-green-500 px-2 py-1 text-xs">{targetUser.badge}</span>
        </div>
        <div className="border-t border-green-500/20 pt-4 italic text-sm opacity-80 whitespace-pre-wrap">"{targetUser.bio}"</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-green-500 p-4 text-center">
          <div className="text-[10px] opacity-50">POSTS</div>
          <div className="text-3xl font-bold mt-1">{stats.posts}</div>
        </div>
        <div className="border border-green-500 p-4 text-center">
          <div className="text-[10px] opacity-50">COMMENTS</div>
          <div className="text-3xl font-bold mt-1">{stats.comments}</div>
        </div>
      </div>

      <button onClick={() => setLocation(`/chat/dm-${targetUser.nickname}`)} className="bg-green-500 text-black py-2 font-bold hover:bg-green-400">[ 통신 요청 (DM) ]</button>
    </div>
  );
}