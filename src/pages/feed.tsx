import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
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
    <div className="w-full flex flex-col gap-6">
      
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col md:flex-row justify-between items-center border border-[#c0c0c0] p-4 bg-[#000080] gap-4 shadow-[5px_5px_0px_#000000]">
        <h2 className="text-2xl font-bold tracking-widest text-[#ffff00]">
          :: [1] DATA_FEED ::
        </h2>
        
        {isApproved ? (
          <button 
            onClick={() => setLocation("/write")}
            className="border-2 border-[#c0c0c0] bg-[#000080] text-[#ffff00] px-6 py-2 hover:bg-[#c0c0c0] hover:text-[#000080] transition-colors font-bold shadow-[3px_3px_0px_#000000]"
          >
            [ + 새 데이터 기록 ]
          </button>
        ) : (
          <div className="text-xs text-[#ffff00] border-2 border-dashed border-[#ffff00] px-4 py-2 text-center">
            ** 활동 권한 제한됨 (입국 심사 중) **
          </div>
        )}
      </div>

      {/* 게시글 목록 (게시판 형태) */}
      <div className="border border-[#c0c0c0] bg-black">
        {/* 헤더 */}
        <div className="flex border-b border-[#c0c0c0] text-[#ffff00] text-sm p-3 font-bold bg-[#000080]">
          <div className="w-16 text-center">NO</div>
          <div className="flex-grow text-center">SUBJECT</div>
          <div className="w-32 text-center">DATE</div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#c0c0c0]">
            NO_DATA_FOUND
          </div>
        ) : (
          posts.map((post, index) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="flex border-b border-[#c0c0c0] text-[#c0c0c0] text-sm p-3 hover:bg-[#c0c0c0] hover:text-[#000080] transition-colors cursor-pointer group">
                <div className="w-16 text-center text-sm font-mono tracking-tighter">{posts.length - index}</div>
                <div className="flex-grow text-left truncate pl-4 group-hover:underline">{post.title}</div>
                <div className="w-32 text-center text-xs font-mono">{new Date(post.created_at).toLocaleDateString()}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
