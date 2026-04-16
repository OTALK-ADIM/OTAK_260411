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
    <div className="w-full flex flex-col gap-6 font-mono">
      
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col md:flex-row justify-between items-center border border-green-500 p-4 bg-black gap-4 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
        <h2 className="text-xl md:text-2xl font-bold tracking-widest text-green-400">
          :: DATA_FEED ::
        </h2>
        
        {isApproved ? (
          /* 💡 button 태그를 div로 교체! */
          <div 
            onClick={() => setLocation("/write")}
            className="border-2 border-green-500 bg-black text-green-400 px-6 py-2 hover:bg-green-500 hover:text-black transition-none font-bold tracking-widest cursor-pointer inline-block text-center"
          >
            [ + 새 데이터 기록 ]
          </div>
        ) : (
          <div className="text-xs text-red-500 border border-red-900 bg-red-950/20 px-4 py-2 text-center animate-pulse">
            ** 글 작성 권한 제한됨 (입국 심사 중) **
          </div>
        )}
      </div>

      {/* 심사 중 안내 배너 */}
      {!isApproved && (
        <div className="w-full border-2 border-dashed border-red-900 p-4 text-center bg-black">
          <p className="text-red-500 font-bold mb-1 tracking-widest text-sm">:: TEMPORARY ACCESS GRANTED ::</p>
          <p className="text-red-800 text-xs leading-relaxed">
            현재 임시 거주증으로 열람 중입니다.<br/>
            게시글 작성은 관리자 승인 이후 활성화됩니다.
          </p>
        </div>
      )}

      {/* 게시글 목록 (터미널 게시판 형태) */}
      <div className="border border-green-800 bg-black">
        {/* 헤더 */}
        <div className="flex border-b-2 border-green-800 text-green-600 text-xs md:text-sm p-3 font-bold bg-green-950/20 tracking-widest">
          <div className="w-12 md:w-16 text-center">ID</div>
          <div className="flex-grow text-center">SUBJECT</div>
          <div className="w-24 md:w-32 text-center">DATE</div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-green-800 font-bold tracking-widest animate-pulse">
            NO_DATA_FOUND
          </div>
        ) : (
          posts.map((post, index) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="flex border-b border-green-900 text-green-500 text-sm p-3 hover:bg-green-500 hover:text-black transition-none cursor-pointer group">
                <div className="w-12 md:w-16 text-center text-xs md:text-sm opacity-50 group-hover:opacity-100">{posts.length - index}</div>
                <div className="flex-grow text-left truncate pl-2 md:pl-4 font-bold before:content-['>_'] before:mr-2 before:opacity-0 group-hover:before:opacity-100">{post.title}</div>
                <div className="w-24 md:w-32 text-center text-[10px] md:text-xs opacity-50 group-hover:opacity-100">{new Date(post.created_at).toLocaleDateString()}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
