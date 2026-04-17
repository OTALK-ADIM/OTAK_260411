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
      // 1. 현재 접속 중인 유저의 진짜 정보(UUID)를 가져옵니다.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("인증된 유저를 찾을 수 없습니다.");

      // 2. DB에 전송 (에러 원인 완벽 차단!)
      // "익명"이라는 글자 대신, user.id (진짜 UUID 바코드)를 넣어야 에러가 안 납니다.
      const { error } = await supabase.from("posts").insert({
        title,
        content,
        author_id: user.id // 💡 데이터베이스에 따라 여기가 user_id 일 수도 있습니다. 에러 나면 user_id로 바꿔보세요!
      });

      if (error) throw error;

      alert("[시스템] 데이터 기록 완료.");
      setLocation("/feed"); // 글쓰기 성공 시 피드로 귀환

    } catch (error: any) {
      alert(`[통신 에러] 기록 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0">
      
      {/* 상단 타이틀 */}
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-green-500 tracking-widest bg-black inline-block pr-4">
          root@otalk:~# ./write_data.sh
        </h2>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 md:gap-12 max-w-3xl mx-auto">
        
        {/* 제목 입력 */}
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

        {/* 내용 입력 */}
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

        {/* 하단 컨트롤 버튼 */}
        <div className="flex justify-between items-center mt-4">
          <div 
            onClick={() => setLocation("/feed")}
            className="border border-green-900 text-green-700 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl hover:text-green-400 hover:border-green-500 cursor-pointer transition-none font-bold tracking-widest"
          >
            [ 취 소 ]
          </div>
          
          {/* button 태그 유지 (form submit 용도) 하되 디자인은 통일 */}
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