import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

const bannedWords = ["바보", "멍청이", "도박", "광고", "테스트금지어"];

export default function WritePost() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("일반");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("[ERROR] 제목과 본문을 입력하십시오.");
      return;
    }

    const hasBannedWord = bannedWords.some(word => title.includes(word) || content.includes(word));
    if (hasBannedWord) {
      alert("[시스템 경고] 비속어 또는 금지어가 포함되어 있어 등록을 차단합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("인증이 필요합니다.");
        setLocation("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_approved !== true) {
        alert("[시스템] 관리자 승인 후 게시글 작성이 가능합니다.");
        setLocation("/pending");
        return;
      }

      const { error } = await supabase.from("posts").insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author: user.id
      });

      if (error) throw error;
      setLocation("/feed");
    } catch (error: any) {
      alert(`[ERROR] 전송 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20">
      <div className="w-full border-b-2 border-green-500 pb-4 mb-6 flex justify-between items-end">
        <h1 className="text-2xl md:text-4xl font-bold text-green-500 tracking-tighter">
          [ EDITOR_MODE ]
        </h1>
        <span className="text-xs text-green-700 animate-pulse tracking-widest">&gt; READY_FOR_INPUT</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black border-2 border-green-900 text-green-500 p-3 outline-none focus:border-green-500 font-bold tracking-widest text-sm cursor-pointer"
          >
            <option value="일반">일반</option>
            <option value="정보">정보</option>
            <option value="질문">질문</option>
            <option value="덕질">덕질</option>
          </select>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="> 제목을 입력하십시오."
            className="flex-grow bg-black border-2 border-green-900 text-green-400 p-3 outline-none focus:border-green-500 font-bold text-base md:text-lg"
          />
        </div>

        <div className="relative w-full border-2 border-green-900 focus-within:border-green-500 bg-green-950/10 transition-colors">
          <div className="absolute top-0 left-0 w-8 md:w-10 h-full border-r border-green-900 bg-black flex flex-col items-center py-4 text-[10px] text-green-900 select-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="> 당신의 과몰입을 텍스트로 증명하십시오. 길고 깊을수록 좋습니다..."
            className="w-full bg-transparent text-green-400 p-4 pl-12 md:pl-16 text-base md:text-lg h-[50vh] outline-none resize-none font-mono leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <button
            type="button"
            onClick={() => setLocation("/feed")}
            className="border-2 border-green-900 bg-black text-green-700 px-4 md:px-6 py-3 font-bold hover:text-green-400 hover:border-green-700 transition-none tracking-widest text-sm md:text-base"
          >
            [ CANCEL ]
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="border-2 border-green-500 bg-black text-green-400 px-6 md:px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-none tracking-widest text-sm md:text-base disabled:opacity-50"
          >
            {isSubmitting ? "[ TRANSMITTING... ]" : "[ UPLOAD_DATA ]"}
          </button>
        </div>
      </form>
    </div>
  );
}
