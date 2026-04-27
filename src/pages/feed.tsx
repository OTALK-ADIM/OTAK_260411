import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserStatusAndPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
        if (profile) setIsApproved(profile.is_approved);
      }
      
      // 💡 게시글과 함께 댓글 개수(신호 수)도 조인해서 가져옵니다.
      const { data: fetchedPosts } = await supabase.from("posts").select("*, comments(count)").order("created_at", { ascending: false });
      if (fetchedPosts) setPosts(fetchedPosts);
    };
    fetchUserStatusAndPosts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 font-mono pb-20">
      
      <div className="flex justify-between items-end px-2 mt-4 md:mt-8 mb-4 border-b-2 border-green-900 pb-4">
        <div className="text-xl md:text-3xl font-bold text-green-500 tracking-tighter">
          [ COMM_FEED ]
        </div>
        {isApproved ? (
          <div 
            onClick={() => setLocation("/write")}
            className="border border-green-500 bg-green-950/20 text-green-400 px-4 py-2 hover:bg-green-500 hover:text-black font-bold text-sm cursor-pointer transition-none"
          >
            + NEW_TRANSMISSION
          </div>
        ) : null}
      </div>

      <div className="w-full flex flex-col border-t-2 border-green-500 bg-black">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-green-700 animate-pulse font-bold tracking-widest">[ NO_DATA_FOUND ]</div>
        ) : (
          posts.map((post, index) => {
            let dateDisplay = "N/A";
            if (post.created_at) {
              const d = new Date(post.created_at);
              if (d.getFullYear() > 1970) {
                dateDisplay = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
              }
            }
            
            // 💡 댓글 개수를 시그널로 표시
            const signalCount = post.comments?.[0]?.count || 0;
            
            return (
              <div 
                key={post.id} 
                onClick={() => setLocation(`/post/${post.id}`)}
                className="flex flex-col md:flex-row border-b border-green-900 text-green-500 p-4 hover:bg-green-950/40 transition-none cursor-pointer group"
              >
                <div className="flex justify-between md:w-32 text-xs md:text-sm text-green-700 font-bold mb-2 md:mb-0 shrink-0">
                  <span>No.{posts.length - index}</span>
                  <span className="md:hidden">{dateDisplay}</span>
                </div>
                <div className="flex-grow text-left truncate pl-0 md:pl-4 font-bold text-base md:text-lg text-green-400 group-hover:text-green-300">
                  <span className="text-green-800 mr-2 font-normal text-xs md:text-sm">
                    [{post.category || '일반'}]
                  </span>
                  {post.title}
                </div>
                <div className="flex justify-between md:justify-end items-center md:w-48 mt-3 md:mt-0 shrink-0">
                  {/* 💡 조회수 대신 SIGNALS(댓글 수) 표시 */}
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-1 border ${signalCount > 0 ? "border-green-500 text-green-400" : "border-green-900 text-green-800"}`}>
                    SIGNALS: {signalCount}
                  </span>
                  <span className="hidden md:inline-block text-xs font-bold text-green-700 ml-4 w-20 text-right">
                    {dateDisplay}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
