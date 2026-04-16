import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // 1. 현재 유저의 승인 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
        if (profile) setIsApproved(profile.is_approved);
      }

      // 2. 게시글 데이터 불러오기
      if (id) {
        const { data: fetchedPost } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
        if (fetchedPost) setPost(fetchedPost);
      }
    };
    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    alert("댓글 저장 로직 구현 필요!"); // 실제 댓글 DB 저장 로직 추가 위치
    setComment("");
  };

  if (!post) {
    return <div className="text-center py-20 animate-pulse text-green-700">LOADING_DATA...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <button onClick={() => setLocation("/feed")} className="text-xs text-green-600 hover:text-green-400 self-start">
        {"< [ 뒤 로 가 기 ]"}
      </button>

      {/* 게시글 본문 */}
      <div className="border border-green-500 p-6 bg-black shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <h1 className="text-2xl font-bold text-green-400 mb-4 pb-4 border-b border-green-900">
          {post.title}
        </h1>
        <div className="text-green-500 whitespace-pre-wrap leading-relaxed text-sm">
          {post.content}
        </div>
      </div>

      {/* 💡 댓글 입력 영역 (승인 상태에 따른 차단) */}
      <div className="border border-green-900 p-6 mt-4">
        <h3 className="text-green-500 font-bold mb-4">:: SYSTEM_COMMENTS ::</h3>
        
        {isApproved ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="여기에 코멘트를 입력하십시오..."
              className="w-full bg-black border border-green-700 text-green-400 p-3 h-20 resize-none outline-none focus:border-green-400"
            />
            <button type="submit" className="self-end border border-green-500 px-6 py-2 text-sm hover:bg-green-500 hover:text-black transition-colors font-bold">
              [ 코 멘 트 전 송 ]
            </button>
          </form>
        ) : (
          <div className="w-full p-4 border border-dashed border-red-900 bg-red-950/10 text-center text-red-500 text-xs leading-loose">
            현재 임시 거주 상태이므로 코멘트를 남길 수 없습니다.<br/>
            (관리자의 승인을 기다려 주십시오.)
          </div>
        )}
      </div>
    </div>
  );
}