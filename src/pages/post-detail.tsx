import { useEffect, useState } from "react";
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

  const fetchPostAndComments = async () => {
    if (!params?.id) return;
    const { data: postData } = await supabase.from("posts").select("*").eq("id", params.id).maybeSingle();
    if (!postData) return setLocation("/feed");
    setPost(postData);

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", postData.author).maybeSingle();
    if (profileData) setAuthorProfile(profileData);

    const { data: commentData } = await supabase.from("comments").select("*").eq("post_id", params.id).order("created_at", { ascending: true });
    if (commentData) {
      const userIds = [...new Set(commentData.map(c => c.user_id))];
      const { data: profilesData } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
      const profilesMap = profilesData?.reduce((acc, p) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
      setComments(commentData.map(c => ({ ...c, nickname: profilesMap[c.user_id] || "UNKNOWN" })));
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
      if (!user) return;

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment,
      });

      if (!error && post.author !== user.id) {
        const { data: myProfile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
        // 💡 알람에 related_id(현재 글 ID)를 함께 저장!
        await supabase.from("notifications").insert({
          target_user_id: post.author,
          from_nickname: myProfile?.nickname || "UNKNOWN",
          type: 'COMMENT',
          related_id: post.id 
        });
      }
      setNewComment("");
      fetchPostAndComments();
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ ACCESSING_DATA... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-32">
      <div className="w-full border-b-2 border-green-900 pb-6 mb-10">
        <div className="flex justify-between items-start mb-4">
          <div className="text-green-700 text-xs">&gt; CATEGORY: [{post.category || "GENERAL"}]</div>
          <div onClick={() => setLocation(`/profile/${authorProfile?.id}`)} className="border border-green-800 bg-green-950/30 px-3 py-1 text-green-400 cursor-pointer hover:bg-green-500 hover:text-black font-bold text-sm">AUTHOR: {authorProfile?.nickname}</div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-green-500">{post.title}</h1>
      </div>
      <div className="text-2xl md:text-4xl text-green-400 leading-relaxed whitespace-pre-wrap min-h-[30vh] mb-16">{post.content}</div>
      <div className="w-full border-t-2 border-dashed border-green-900 pt-10">
        <h3 className="text-xl font-bold text-green-600 mb-6">[ COMMENTS_LOG ] ({comments.length})</h3>
        <div className="flex flex-col gap-6 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="border-l-4 border-green-800 pl-4 py-2">
              <p className="text-lg md:text-xl text-green-400 mb-2">{c.content}</p>
              <div className="flex justify-between text-xs text-green-800">
                <span>{new Date(c.created_at).toLocaleString()}</span>
                <span onClick={() => setLocation(`/profile/${c.user_id}`)} className="font-bold text-green-600 cursor-pointer">@{c.nickname}</span>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full bg-black border-2 border-green-900 text-green-500 p-4 text-lg h-32 outline-none focus:border-green-500" placeholder="시스템 코멘트 입력..." />
          <button type="submit" className="self-end border-2 border-green-500 bg-black text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-none">[ ADD_COMMENT ]</button>
        </form>
      </div>
    </div>
  );
}