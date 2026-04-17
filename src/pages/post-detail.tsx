import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostAndComments = async () => {
    if (!params?.id) return;
    
    // 1. 게시글 가져오기
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (!postData) {
      alert("[에러] 데이터를 찾을 수 없습니다.");
      setLocation("/feed");
      return;
    }
    setPost(postData);

    // 2. 댓글 가져오기 (댓글 테이블이 'comments'라고 가정)
    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    if (commentData) setComments(commentData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [params?.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment,
        // 💡 닉네임 등을 프로필에서 가져와 넣을 수도 있습니다.
      });

      if (error) throw error;
      setNewComment("");
      fetchPostAndComments(); // 댓글 목록 새로고침
    } catch (error: any) {
      alert(`[시스템 에러] 댓글 등록 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ ACCESSING_DATABASE... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-32">
      
      {/* 💡 헤더: 시간 버그 방어 로직 적용 */}
      <div className="w-full border-b-2 border-green-900 pb-6 mb-10">
        <div className="text-green-700 text-xs md:text-sm mb-4">
          &gt; ACCESS_TIME: {post.created_at ? new Date(post.created_at).toLocaleString('ko-KR') : "TIME_UNKNOWN"}<br/>
          &gt; CATEGORY: [{post.category || "GENERAL"}]
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-green-500 leading-tight">
          {post.title}
        </h1>
      </div>

      {/* 💡 본문: 시원하게 크기 확대 */}
      <div className="w-full mb-16">
        <div className="text-2xl md:text-4xl text-green-400 leading-relaxed whitespace-pre-wrap min-h-[30vh]">
          {post.content}
        </div>
      </div>

      {/* 💡 댓글 섹션 추가 */}
      <div className="w-full border-t-2 border-dashed border-green-900 pt-10 mb-10">
        <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-6 tracking-widest">
          [ COMMENTS_SECTION ]
        </h3>

        {/* 댓글 목록 */}
        <div className="flex flex-col gap-6 mb-10">
          {comments.length === 0 ? (
            <p className="text-green-900 italic text-sm">-- NO_COMMENTS_YET --</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-l-2 border-green-800 pl-4 py-2 bg-green-950/5">
                <p className="text-lg md:text-xl text-green-400">{c.content}</p>
                <span className="text-[10px] text-green-900 mt-2 block">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력창 */}
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="SYSTEM: 코멘트를 입력하십시오..."
            className="w-full bg-black border-2 border-green-900 text-green-500 p-4 text-lg md:text-xl outline-none focus:border-green-500 resize-none h-32"
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="border-2 border-green-500 bg-black text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-none"
            >
              {isSubmitting ? "SENDING..." : "[ ADD_COMMENT ]"}
            </button>
          </div>
        </form>
      </div>

      {/* 💡 뒤로가기 버튼: 가장 하단 배치 */}
      <div className="flex justify-center mt-10">
        <div 
          onClick={() => setLocation("/feed")}
          className="w-full text-center border-2 border-green-900 text-green-700 px-8 py-6 text-xl md:text-2xl hover:text-green-400 hover:border-green-500 cursor-pointer font-bold tracking-[0.5em]"
        >
          [ RETURN_TO_FEED ]
        </div>
      </div>
    </div>
  );
}