import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchPostAndComments = async () => {
    if (!params?.id) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setMyProfile(profile);
    }

    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (!postData) {
      setLocation("/feed");
      return;
    }
    setPost(postData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", postData.author)
      .maybeSingle();
    if (profileData) setAuthorProfile(profileData);

    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    if (commentData && commentData.length > 0) {
      const userIds = [...new Set(commentData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", userIds);
      const profilesMap = profilesData?.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
      setComments(commentData.map(c => ({ ...c, nickname: profilesMap[c.user_id] || "UNKNOWN" })));
    } else {
      setComments([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchPostAndComments(); }, [params?.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("[시스템] 로그인이 필요합니다.");
        setLocation("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved, nickname")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_approved !== true) {
        alert("[시스템] 관리자 승인 후 댓글 작성이 가능합니다.");
        setLocation("/pending");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      if (post.author !== user.id) {
        await supabase.from("notifications").insert({
          target_user_id: post.author,
          from_nickname: profile?.nickname || "UNKNOWN",
          type: "COMMENT",
          related_id: post.id
        });
      }

      setNewComment("");
      fetchPostAndComments();
    } catch (error: any) {
      alert(`[ERROR] 댓글 전송 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuote = (nickname: string, content: string) => {
    setNewComment(prev => `${prev ? prev + "\n" : ""}> ${nickname} : ${content}\n\n`);
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ ACCESSING_DATA... ]</div>;

  const canEdit = currentUser && post && (post.author === currentUser.id || myProfile?.is_admin === true || myProfile?.role === "admin");
  const canComment = currentUser && myProfile?.is_approved === true;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-32">
      <div className="w-full border-b-2 border-green-900 pb-6 mb-10">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="text-green-700 text-xs font-bold tracking-widest">&gt; CATEGORY: [{post.category || "GENERAL"}]</div>
          <div className="flex gap-2 shrink-0">
            {canEdit && (
              <button
                onClick={() => setLocation(`/edit/${post.id}`)}
                className="border border-yellow-700 bg-yellow-950/20 px-3 py-1 text-yellow-500 cursor-pointer hover:bg-yellow-500 hover:text-black font-bold text-[10px] tracking-widest"
              >
                [ EDIT ]
              </button>
            )}
            <div onClick={() => setLocation(`/profile/${authorProfile?.id}`)} className="border border-green-800 bg-green-950/30 px-3 py-1 text-green-400 cursor-pointer hover:bg-green-500 hover:text-black font-bold text-[10px] tracking-widest">
              AUTHOR: {authorProfile?.nickname}
            </div>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-green-500 leading-snug">{post.title}</h1>
      </div>

      <div className="text-lg md:text-2xl text-green-400 leading-relaxed whitespace-pre-wrap min-h-[30vh] mb-16 p-4 border-l-2 border-green-800 bg-black">
        {post.content}
      </div>

      <div className="w-full border-t-2 border-green-900 pt-10">
        <h3 className="text-lg md:text-xl font-bold text-green-600 mb-8 tracking-widest">
          [ SIGNAL_LOGS ] ({comments.length})
        </h3>

        <div className="flex flex-col gap-6 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="border border-green-900 p-4 bg-black relative group">
              <button
                onClick={() => handleQuote(c.nickname, c.content)}
                className="absolute top-2 right-2 text-[10px] border border-green-800 text-green-700 px-2 py-1 opacity-0 group-hover:opacity-100 hover:bg-green-800 hover:text-black transition-none font-bold"
              >
                [ QUOTE ]
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span onClick={() => setLocation(`/profile/${c.user_id}`)} className="font-bold text-green-500 cursor-pointer hover:underline underline-offset-4 decoration-dashed">@{c.nickname}</span>
                <span className="text-[10px] text-green-800">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-base md:text-lg text-green-400 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>

        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-green-950/10 border-2 border-green-900 text-green-400 p-4 text-base h-40 outline-none focus:border-green-500 resize-none font-mono leading-relaxed"
              placeholder="> 주파수 응답을 입력하십시오 (과몰입 환영)..."
            />
            <button type="submit" disabled={isSubmitting} className="self-end border-2 border-green-500 bg-black text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-none tracking-widest disabled:opacity-50">
              {isSubmitting ? "[ SENDING... ]" : "[ TRANSMIT_SIGNAL ]"}
            </button>
          </form>
        ) : (
          <div className="border-2 border-yellow-900/70 bg-yellow-950/10 text-yellow-500 p-4 text-sm leading-relaxed font-bold">
            [ READ_ONLY_MODE ] 입국 심사 중에는 글과 댓글을 볼 수 있지만, 댓글 작성은 관리자 승인 후 가능합니다.
          </div>
        )}
      </div>
    </div>
  );
}
