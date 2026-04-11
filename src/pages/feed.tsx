import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase"; // 💡 Supabase 연결 클라이언트 임포트

export default function Feed() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("최신글");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  // 무한 스크롤 및 데이터 관리
  const [visibleCount, setVisibleCount] = useState(30);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 💡 1. 서버(Supabase)에서 실제 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      
      // posts 테이블에서 모든 데이터를 가져오되, ID 역순(최신순)으로 정렬
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("[시스템 에러] 데이터 수신 실패:", error.message);
      } else if (data) {
        setAllPosts(data);

        // 카테고리별 개수 실시간 집계 (서버 데이터 기준)
        const counts: Record<string, number> = { ALL: data.length };
        data.forEach(p => {
          const cat = p.category || "일반";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  // 💡 2. 무한 스크롤 감지 (기존 로직 유지)
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading) {
      setVisibleCount((prev) => prev + 20);
    }
  }, [isLoading]);

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // 💡 3. 필터링 및 검색 로직 (서버 데이터를 브라우저에서 필터링)
  let filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;
    
    // 제목, 태그 중 검색어 포함 여부 확인
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // 관리자가 삭제한 글 제외 (localStorage 유지)
    const deletedSaved = localStorage.getItem("deleted_posts");
    const deletedIds = deletedSaved ? JSON.parse(deletedSaved) : [];
    
    return matchesCategory && matchesSearch && !deletedIds.includes(post.id);
  });

  // 정렬 로직 (탭 선택에 따른 결과)
  if (activeTab === "베스트") filteredPosts.sort((a, b) => b.likes - a.likes);
  else if (activeTab === "랜덤") filteredPosts.sort(() => Math.random() - 0.5);

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  // 999+ 변환 함수
  const formatCount = (count: number) => count > 999 ? "999+" : count;

  // 날짜 변환 함수 (Supabase의 timestamptz를 MM/DD 형식으로)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 relative font-mono">
      {/* 플로팅 버튼 (TOP / MAIN) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-black border border-green-500 text-green-500 w-12 h-12 text-[10px] font-bold hover:bg-green-500 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        >
          TOP
        </button>
        <button 
          onClick={() => setLocation("/")}
          className="bg-black border border-green-500 text-green-500 w-12 h-12 text-[10px] font-bold hover:bg-green-500 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        >
          MAIN
        </button>
      </div>

      {/* 검색 바 */}
      <div className="flex border border-green-500 p-1 bg-[#0a0a0a]">
        <span className="px-2 self-center text-xs opacity-70">SEARCH_CMD:</span>
        <input 
          type="text"
          placeholder="데이터 검색어 입력..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-green-500 p-1 flex-1 focus:outline-none"
        />
      </div>

      {/* 카테고리 영역 (999+ 로직 적용) */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs scrollbar-hide">
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setVisibleCount(30); }}
            className={`border px-2 py-1 whitespace-nowrap transition-all ${
              selectedCategory === cat ? "bg-green-500 text-black font-bold" : "border-green-500/50 hover:bg-green-900/30"
            }`}
          >
            {cat} ({formatCount(count)})
          </button>
        ))}
      </div>

      {/* 탭 & 글쓰기 버튼 */}
      <div className="flex justify-between items-center border-b border-green-500 pb-2">
        <div className="flex gap-2">
          {["최신글", "베스트", "랜덤"].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setVisibleCount(30); }} className={`px-2 text-sm ${activeTab === tab ? "bg-green-500 text-black font-bold" : "hover:text-green-300"}`}>
              {tab === "최신글" ? ">최신<" : `[${tab}]`}
            </button>
          ))}
        </div>
        <button onClick={() => setLocation("/write")} className="border border-green-500 px-3 py-1 text-xs font-bold hover:bg-green-500 hover:text-black transition-colors">
          [+새 글 기록]
        </button>
      </div>

      {/* 목록 출력 */}
      <div className="flex flex-col gap-3 min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-green-500 animate-pulse">
            [ REQUESTING_DATA_FROM_SERVER... ]
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-20 opacity-30 text-sm">NO DATA FOUND.</div>
        ) : (
          displayedPosts.map((post) => (
            <div key={post.id} className="flex flex-col border-b border-green-500/20 pb-2">
              <div onClick={() => setLocation(`/post/${post.id}`)} className="flex justify-between cursor-pointer hover:bg-green-500/10 p-1 transition-all">
                <div className="truncate text-sm md:text-base font-bold">
                  <span className="opacity-50 mr-2 text-xs">[{post.category || "일반"}]</span>
                  {post.title}
                </div>
                <div className="text-[10px] opacity-60 self-center ml-2 flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLocation(`/profile/${post.author}`); }} 
                    className="hover:text-white hover:underline"
                  >
                    {post.author}
                  </button>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
              {/* 태그 표시 */}
              <div className="flex gap-2 px-1">
                {post.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] opacity-40">#{tag}</span>
                ))}
              </div>
            </div>
          ))
        )}
        
        {/* 무한 스크롤 트리거 */}
        {!isLoading && (
          <div ref={loaderRef} className="h-10 flex items-center justify-center text-[10px] opacity-30">
            {displayedPosts.length < filteredPosts.length ? "[ DATA LOADING... ]" : "[ END OF ARCHIVE ]"}
          </div>
        )}
      </div>
    </div>
  );
}