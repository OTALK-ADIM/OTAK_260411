import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserStatusAndPosts = async () => {
      // 1. 현재 유저의 승인 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_approved")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) setIsApproved(profile.is_approved);
      }

      // 2. 게시글 목록 불러오기 (임시 더미 로직, 실제 posts 테이블 연동 필요)
      const { data: fetchedPosts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (fetchedPosts) setPosts(fetchedPosts);
    };

    fetchUserStatusAndPosts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col md:flex-row justify-between items-center border border-green-900 p-4 bg-black gap-4">
        <h2 className="text-xl font-bold tracking-widest text-green-500">
          [ DATA_FEED ]
        </h2>
        
        {/* 💡 승인 상태에 따른 글쓰기 버튼 노출 분기 */}
        {isApproved ? (
          <button 
            onClick={() => setLocation("/write")}
            className="border border-green-500 bg-green-950/30 px-6 py-2 text-green-400 hover:bg-green-500 hover:text-black transition-colors font-bold"
          >
            + 새 데이터 기록
          </button>
        ) : (
          <div className="text-xs text-red-500 border border-red-900 bg-red-950/20 px-4 py-2 text-center animate-pulse">
            글 작성 권한이 없습니다. (입국 심사 중)
          </div>
        )}
      </div>

      {/* 심사 중인 유저를 위한 대문짝만한 안내 배너 */}
      {!isApproved && (
        <div className="w-full border-2 border-dashed border-red-900 p-6 text-center bg-red-950/10">
          <p className="text-red-500 font-bold mb-2 tracking-widest">:: TEMPORARY ACCESS GRANTED ::</p>
          <p className="text-red-400 text-sm leading-loose">
            현재 임시 거주증으로 시스템을 열람하고 있습니다.<br/>
            게시글 및 댓글 작성 기능은 <span className="text-white">관리자의 최종 승인 이후</span> 활성화됩니다.
          </p>
        </div>
      )}

      {/* 게시글 목록 출력 영역 */}
      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-green-800 border border-green-900/50">
            NO_DATA_FOUND
          </div>
        ) : (
          posts.map(post => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="border border-green-900 p-4 hover:border-green-500 transition-colors cursor-pointer bg-black group">
                <h3 className="text-green-400 text-lg group-hover:text-green-300">{post.title}</h3>
                <p className="text-green-700 text-xs mt-2">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}