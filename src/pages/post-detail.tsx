import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    const { data: postData } = await supabase.from("posts").select("*").eq("id", params?.id).maybeSingle();
    if (postData) {
      setPost(postData);
      // 수정 제한 시간 계산 (10분)
      const diff = (new Date().getTime() - new Date(postData.created_at).getTime()) / (1000 * 60);
      setTimeLeft(Math.max(0, 10 - diff));
    }

    if (user) {
      const { data: saved } = await supabase.from("saved_posts").select("*").eq("user_id", user.id).eq("post_id", params?.id).maybeSingle();
      setIsSaved(!!saved);
    }
  };

  useEffect(() => { fetchData(); }, [params?.id]);

  const toggleSave = async () => {
    if (!currentUser) return;
    if (isSaved) {
      await supabase.from("saved_posts").delete().eq("user_id", currentUser.id).eq("post_id", post.id);
    } else {
      await supabase.from("saved_posts").insert({ user_id: currentUser.id, post_id: post.id });
    }
    setIsSaved(!isSaved);
  };

  return (
    <div className="w-full flex flex-col font-mono p-2 text-green-500 pb-20">
      <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-2">
        <div className="text-[10px] text-green-800 uppercase tracking-widest">&gt; SIGNAL_ID: {params?.id?.slice(0,8)}</div>
        <div className="flex gap-2">
          {/* 10분 내에만 수정 버튼 노출 */}
          {currentUser?.id === post?.author && timeLeft > 0 && (
            <button onClick={() => setLocation(`/edit/${post.id}`)} className="border border-green-500 px-2 py-1 text-[10px] hover:bg-green-500 hover:text-black">
              [ EDIT_LOCK: {Math.floor(timeLeft)}m ]
            </button>
          )}
          <button onClick={toggleSave} className={`border px-2 py-1 text-[10px] font-bold ${isSaved ? "bg-green-500 text-black" : "border-green-800 text-green-700"}`}>
            {isSaved ? "[ ARCHIVED ]" : "[ SAVE ]"}
          </button>
        </div>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-green-400">{post?.title}</h1>
      <div className="min-h-[30vh] border-l-2 border-green-900 pl-4 py-2 bg-black text-lg md:text-xl leading-relaxed whitespace-pre-wrap mb-10">
        {post?.content}
      </div>
      
      {/* 댓글 영역은 기존 코드 유지 */}
      <div className="mt-10 border-t border-dashed border-green-900 pt-10">
        <button onClick={() => setLocation("/feed")} className="text-xs text-green-800 hover:text-green-500">&lt; RETURN_TO_FEED</button>
      </div>
    </div>
  );
}