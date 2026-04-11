import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function PostEdit() {
  const params = useParams();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 💡 방에 들어올 때 '공용 메모리'에 저장된 글이 있는지 확인합니다.
  useEffect(() => {
    const savedData = localStorage.getItem(`post_${params.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTitle(parsed.title);
      setContent(parsed.content);
    } else {
      // 메모리에 없으면 기본 가짜 데이터 표시
      setTitle(`[기존 제목] ${params.id}번 글 수정 중...`);
      setContent("기존에 작성되어 있던 본문 내용입니다.\n여기서 내용을 수정할 수 있습니다.");
    }
  }, [params.id]);

  const handleSave = () => {
    // 👇 --- 여기서부터 딱 10줄, 필터링 방어막 추가 --- 👇
    const bannedWords = ["바보", "멍청이", "도박", "광고", "테스트금지어"]; // 💡 여기에 막고 싶은 단어를 계속 추가하세요!
    
    // 제목(title)이나 본문(content)에 금지어가 하나라도 있는지 검사합니다.
    const hasBannedWord = bannedWords.some(word => 
      title.includes(word) || content.includes(word)
    );

    if (hasBannedWord) {
      alert("[시스템 경고] 비속어 또는 금지어가 포함되어 있어 등록을 차단합니다.");
      return; // 🚨 여기서 기능을 강제로 멈춰서 저장을 막아버립니다!
    }
    // 👆 ------------------------------------------ 👆
    // 💡 핵심! 수정된 제목과 내용을 브라우저 '공용 메모리'에 저장합니다.
    localStorage.setItem(`post_${params.id}`, JSON.stringify({ title, content }));
    
    alert(`[시스템] ${params.id}번 게시글이 성공적으로 수정되었습니다.`);
    setLocation(`/post/${params.id}`); // 저장 후 복귀
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="border-b-2 border-green-500 pb-2 mb-2 text-center font-bold tracking-widest">
        [ 게 시 글 수 정 ]
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
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none focus:bg-green-900/30 min-h-[250px] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button 
          onClick={() => setLocation(`/post/${params.id}`)}
          className="border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors"
        >
          [ 취소 ]
        </button>
        <button 
          onClick={handleSave}
          className="bg-green-500 text-black px-4 py-1 font-bold hover:bg-green-400 transition-colors"
        >
          [ 저장 ]
        </button>
      </div>
    </div>
  );
}