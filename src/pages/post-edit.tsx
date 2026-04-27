import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

const bannedWords = ["바보", "멍청이", "도박", "광고", "테스트금지어"];

export default function PostEdit() {
  const [, params] = useRoute("/edit/:id");
  const [, setLocation] = useLocation();

  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLocation("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_approved !== true) {
        alert("[시스템] 승인 완료 후 게시글 수정이 가능합니다.");
        setLocation("/pending");
        return;
      }

      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !postData) {
        alert("[시스템] 존재하지 않는 게시글입니다.");
        setLocation("/feed");
        return;
      }

      const isAdmin = profile?.is_admin === true || profile?.role === "admin";
      if (postData.author !== user.id && !isAdmin) {
        alert("[시스템] 본인이 작성한 게시글만 수정할 수 있습니다.");
        setLocation(`/post/${params.id}`);
        return;
      }

      setPost(postData);
      setTitle(postData.title || "");
      setContent(postData.content || "");
      setLoading(false);
    };

    fetchPost();
  }, [params?.id, setLocation]);

  const handleSave = async () => {
    if (!params?.id || !post || isSaving) return;

    if (!title.trim() || !content.trim()) {
      alert("[시스템 경고] 제목과 본문을 모두 입력하십시오.");
      return;
    }

    const hasBannedWord = bannedWords.some(word => title.includes(word) || content.includes(word));
    if (hasBannedWord) {
      alert("[시스템 경고] 비속어 또는 금지어가 포함되어 있어 저장을 차단합니다.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ title: title.trim(), content: content.trim() })
        .eq("id", params.id);

      if (error) throw error;

      alert("[시스템] 게시글이 성공적으로 수정되었습니다.");
      setLocation(`/post/${params.id}`);
    } catch (error: any) {
      alert(`[ERROR] 수정 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ LOADING_EDIT_DATA... ]</div>;
  }

  return (
    <div className="w-full flex flex-col gap-4 font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20">
      <div className="border-b-2 border-green-500 pb-2 mb-2 text-center font-bold tracking-widest">
        [ DATA_EDIT_MODE ]
      </div>

      <div className="flex flex-col gap-4 bg-[#0a0a0a] p-4 border border-green-500/50">
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70">TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none focus:bg-green-900/30 font-bold w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70">CONTENT</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none focus:bg-green-900/30 min-h-[350px] resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => setLocation(`/post/${params?.id}`)}
          className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black transition-none"
        >
          [ CANCEL ]
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 text-black px-4 py-2 font-bold hover:bg-green-400 transition-none disabled:opacity-50"
        >
          {isSaving ? "[ SAVING... ]" : "[ SAVE_TO_DB ]"}
        </button>
      </div>
    </div>
  );
}
