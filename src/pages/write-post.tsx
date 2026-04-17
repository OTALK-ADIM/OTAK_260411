import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function WritePost() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("[시스템 경고] 데이터가 비어있습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("인증된 유저를 찾을 수 없습니다.");

      // 💡 에러 원인 완벽 해결! author_id 대신 user_id 로 변경했습니다.
      const { error } = await supabase.from("posts").insert({
        title,
        content,
        user_id: user.id 
      });

      if (error) throw error;

      alert("[시스템] 데이터 기록 완료.");
      setLocation("/feed"); 

    } catch (error: any) {
      alert(`[통신 에러] 기록 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-green-500 tracking-widest bg-black inline-block pr-4">
          root@otalk:~# ./write_data.sh
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 md:gap-12 max-w-3xl mx-auto">
        
        <div className="flex flex-col gap-3">
          <label className="text-base md:text-xl font-bold text-green-600 tracking-widest flex items-center">
            <span className="text-green-400 mr-2">&gt;</span> [ SUBJECT / 제목 ]
          </label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기록할 제목을 입력하십시오..."
            className="w-full bg-black border-2 border-green-900 text-green-400 p-4 md:p-6 text-xl md:text-2xl outline-none focus:border-green-500 transition-none placeholder:text-green-900/50"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-base md:text-xl font-bold text-green-600 tracking-widest flex items-center">
            <span className="text-green-400 mr-2">&gt;</span> [ CONTENT / 내용 ]
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="기록할 내용을 상세히 입력하십시오..."
            className="w-full bg-black border-2 border-green-900 text-green-400 p-4 md:p-6 h-64 md:h-96 text-lg md:text-xl outline-none focus:border-green-500 transition-none resize-none leading-relaxed placeholder:text-green-900/50"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div 
            onClick={() => setLocation("/feed")}
            className="border border-green-900 text-green-700 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl hover:text-green-400 hover:border-green-500 cursor-pointer transition-none font-bold tracking-widest"
          >
            [ 취 소 ]
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="border-2 border-green-500 bg-black text-green-400 px-8 md:px-12 py-4 md:py-6 text-xl md:text-3xl tracking-[0.2em] hover:bg-green-500 hover:text-black transition-none font-bold cursor-pointer disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-green-400"
          >
            {isSubmitting ? "TRANSMITTING..." : "[ UPLOAD_DATA ]"}
          </button>
        </div>

      </form>
    </div>
  );
}