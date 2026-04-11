import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase"; // 💡 Supabase 클라이언트 불러오기

export default function WritePost() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // 카테고리 및 해시태그 상태
  const [category, setCategory] = useState("일반");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [hashtags, setHashtags] = useState("");
  const [existingCategories, setExistingCategories] = useState(["일반", "뉴스", "정보", "명일방주"]);

  // 💡 기존에 쓰인 카테고리 목록을 서버에서 실시간으로 가져옵니다.
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('posts').select('category');
      if (data) {
        const cats = new Set(["일반", "뉴스", "정보", "명일방주"]);
        data.forEach(item => { if (item.category) cats.add(item.category); });
        setExistingCategories(Array.from(cats));
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    // 1. 금지어 및 빈칸 체크
    const bannedWords = ["바보", "멍청이", "도박", "광고"];
    const finalCategory = isCustom ? customCategory : category;

    if (bannedWords.some(w => title.includes(w) || content.includes(w) || hashtags.includes(w))) {
      alert("[시스템 경고] 프로토콜 위반: 금지어가 포함되어 있습니다.");
      return;
    }
    if (!title.trim() || !content.trim() || (isCustom && !customCategory.trim())) {
      alert("[시스템 경고] 데이터 부족: 모든 항목을 입력하십시오.");
      return;
    }

    // 2. 해시태그 정리
    const tagArray = hashtags.split(/[ ,#]+/).filter(t => t.length > 0);

    // 3. 현재 로그인된 유저 정보 (localStorage에서 일단 가져옴)
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    // 💡 4. Supabase 서버에 데이터 전송 (INSERT)
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          title, 
          content, 
          category: finalCategory, 
          tags: tagArray, 
          author: currentUser.nickname || "익명",
          likes: 0 
        }
      ])
      .select(); // 등록된 데이터 정보를 다시 받아옵니다.

    if (error) {
      alert(`[통신 에러] 기록 실패: ${error.message}`);
      console.error(error);
    } else {
      alert(`[시스템] 데이터가 서버 아카이브에 성공적으로 기록되었습니다.`);
      // 등록된 글의 상세 페이지(id)로 이동
      if (data && data[0]) {
        setLocation(`/post/${data[0].id}`);
      } else {
        setLocation("/feed");
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      <div className="border-b-2 border-green-500 pb-2 mb-2 text-center font-bold tracking-widest">
        [ DATA_UPLOADER ]
      </div>
      
      <div className="flex flex-col gap-4 bg-[#0a0a0a] p-4 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        {/* 카테고리 선택 */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">CATEGORY_ID</label>
          <div className="flex gap-2">
            {!isCustom ? (
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black border border-green-500 text-green-500 p-2 focus:outline-none flex-1"
              >
                {existingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            ) : (
              <input 
                type="text"
                placeholder="NEW_CATEGORY..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none flex-1"
              />
            )}
            <button 
              onClick={() => setIsCustom(!isCustom)}
              className="border border-green-500 px-3 text-xs hover:bg-green-500 hover:text-black transition-colors"
            >
              {isCustom ? "[ CANCEL ]" : "[ NEW ]"}
            </button>
          </div>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">SUBJECT</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-bold w-full"
            placeholder="제목을 입력하십시오..."
          />
        </div>

        {/* 해시태그 */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">TAGS</label>
          <input 
            type="text" 
            value={hashtags} 
            onChange={(e) => setHashtags(e.target.value)} 
            placeholder="#TAG1 #TAG2..."
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none text-sm w-full"
          />
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">CONTENT_BODY</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none min-h-[250px] resize-none"
            placeholder="내용을 기록하십시오..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button 
          onClick={() => setLocation("/feed")} 
          className="border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors"
        >
          [ ABORT ]
        </button>
        <button 
          onClick={handleSave} 
          className="bg-green-500 text-black px-6 py-1 font-bold hover:bg-green-400 transition-colors"
        >
          [ EXECUTE_UPLOAD ]
        </button>
      </div>
    </div>
  );
}