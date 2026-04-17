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
      const { data: fetchedPosts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (fetchedPosts) setPosts(fetchedPosts);
    };
    fetchUserStatusAndPosts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      
      <div className="flex justify-end items-center px-2 mt-4 md:mt-8">
        {isApproved ? (
          <div 
            onClick={() => setLocation("/write")}
            className="border-2 border-green-500 bg-black text-green-400 px-6 py-2 hover:bg-green-500 hover:text-black transition-none font-bold tracking-widest cursor-pointer inline-block text-center shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          >
            [ + 새 데이터 기록 ]
          </div>
        ) : (
          <div className="text-xs text-red-500 border border-red-900 bg-red-950/20 px-4 py-2 text-center animate-pulse">
            ** 글 작성 권한 제한됨 (입국 심사 중) **
          </div>
        )}
      </div>

      <div className="border border-green-800 bg-black mt-2">
        <div className="flex border-b-2 border-green-800 text-green-600 text-xs md:text-sm p-3 font-bold bg-green-950/20 tracking-widest uppercase">
          <div className="w-12 md:w-16 text-center">ID</div>
          <div className="flex-grow text-center">SUBJECT</div>
          <div className="w-24 md:w-40 text-center">TIMESTAMP</div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-green-800 font-bold tracking-widest animate-pulse">
            NO_DATA_FOUND
          </div>
        ) : (
          posts.map((post, index) => {
            // 💡 날짜 표기를 YYYY-MM-DD HH:MM 형식으로 정밀하게 조정
            const dateObj = new Date(post.created_at);
            const dateStr = post.created_at 
              ? `${dateObj.getMonth()+1}/${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}`
              : 'N/A';
            
            return (
              <div 
                key={post.id} 
                onClick={() => setLocation(`/post/${post.id}`)}
                className="flex border-b border-green-900 text-green-500 text-sm p-3 hover:bg-green-500 hover:text-black transition-none cursor-pointer group"
              >
                <div className="w-12 md:w-16 text-center text-xs opacity-50 group-hover:opacity-100">
                  {posts.length - index}
                </div>
                <div className="flex-grow text-left truncate pl-2 md:pl-4 font-bold">
                  <span className="text-green-300 mr-2 group-hover:text-black font-normal">
                    [{post.category || '일반'}]
                  </span>
                  {post.title}
                </div>
                <div className="w-24 md:w-40 text-center text-[10px] md:text-xs opacity-50 group-hover:opacity-100">
                  {dateStr}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}