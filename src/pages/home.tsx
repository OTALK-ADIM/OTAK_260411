import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(3).then(({ data: posts }) => {
          if (posts) setRecentPosts(posts);
        });
      }
    });
  }, []);

  return (
    <div className="w-full flex flex-col font-mono text-green-500">
      <style>{`
        .nuke-menu-item { font-size: 1.5rem; padding: 1.2rem 0; cursor: pointer; color: #22c55e; font-weight: bold; border-bottom: 1px dashed #064e3b; }
        .nuke-menu-item:hover { color: #86efac; }
      `}</style>
      
      {!user ? (
        <div className="flex flex-col items-center mt-20 gap-10">
          <p className="text-green-500 animate-pulse text-center">[ UNAUTHORIZED_ACCESS ]</p>
          <button onClick={() => setLocation("/login")} className="border-2 border-green-500 p-6 text-2xl">[ S T A R T ]</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-10 max-w-2xl mx-auto w-full px-4">
          {/* 최근 활동 섹션 */}
          <div className="mb-6 border border-green-900 p-4 bg-green-950/10">
            <h3 className="text-[10px] font-bold text-green-600 mb-2 tracking-widest">[ RECENT_SIGNALS ]</h3>
            {recentPosts.map(p => (
              <div key={p.id} onClick={() => setLocation(`/post/${p.id}`)} className="text-xs mb-1 hover:text-green-400 cursor-pointer truncate">
                &gt; {p.title}
              </div>
            ))}
          </div>

          <div onClick={() => setLocation("/feed")} className="nuke-menu-item">▶ 1. 지하 통신망 피드</div>
          <div onClick={() => setLocation("/chat-list")} className="nuke-menu-item">▶ 2. 대화함</div>
          <div onClick={() => setLocation("/profile")} className="nuke-menu-item">▶ 3. 나의 데이터</div>
          <div onClick={() => setLocation("/archive")} className="nuke-menu-item text-green-400 font-black">▶ 4. 아카이브 (저장됨)</div>
          <button onClick={() => supabase.auth.signOut()} className="mt-10 text-xs text-green-900 hover:text-red-900 text-left">[ LOGOUT ]</button>
        </div>
      )}
    </div>
  );
}