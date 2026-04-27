import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from("posts").select("*, comments(count)").order("created_at", { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  let displayed = [...posts];
  if (filter !== "ALL") displayed = displayed.filter(p => p.category === filter);
  
  if (sort === "HOT") {
    displayed.sort((a, b) => (b.comments?.[0]?.count || 0) - (a.comments?.[0]?.count || 0));
  } else if (sort === "OLDEST") {
    displayed.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return (
    <div className="w-full flex flex-col font-mono pb-20 text-green-500">
      <div className="flex justify-between items-end border-b-2 border-green-900 pb-4 mb-4 mt-6">
        <h1 className="text-2xl font-bold tracking-tighter">[ COMM_FEED ]</h1>
        <button onClick={() => setLocation("/write")} className="border border-green-500 px-4 py-1 font-bold hover:bg-green-500 hover:text-black">+ NEW</button>
      </div>

      {/* 필터 & 정렬 바 */}
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-6 bg-black border border-green-900 p-2">
        <div className="flex gap-1 overflow-x-auto">
          {["ALL", "일반", "정보", "질문", "덕질"].map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-2 py-1 text-[10px] border shrink-0 ${filter === c ? "bg-green-500 text-black font-bold" : "border-green-900 text-green-700"}`}>
              {c}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-black border border-green-900 text-[10px] text-green-500 p-1 outline-none">
          <option value="NEWEST">최신순</option>
          <option value="OLDEST">오래된순</option>
          <option value="HOT">시그널(댓글)순</option>
        </select>
      </div>

      <div className="flex flex-col border-t border-green-500">
        {displayed.map((p, i) => (
          <div key={p.id} onClick={() => setLocation(`/post/${p.id}`)} className="flex items-center p-4 border-b border-green-900 hover:bg-green-950/40 cursor-pointer group">
            <span className="w-12 text-[10px] text-green-900">No.{displayed.length - i}</span>
            <span className="flex-grow font-bold text-green-400 truncate">
              <span className="opacity-50 font-normal mr-2">[{p.category || '일반'}]</span>
              {p.title}
            </span>
            <span className="text-[10px] border border-green-900 px-2 ml-2 text-green-800 group-hover:text-green-400 group-hover:border-green-400">
              SIG: {p.comments?.[0]?.count || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}