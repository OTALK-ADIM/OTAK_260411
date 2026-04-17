import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) return;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        alert("[에러] 데이터를 불러올 수 없습니다.");
        setLocation("/feed");
        return;
      }
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [params?.id]);

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ DATA_LOADING... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-20">
      
      {/* 상단 헤더 영역 */}
      <div className="w-full border-b-2 border-green-900 pb-6 mb-8">
        <div className="text-green-700 text-xs md:text-sm mb-4 tracking-tighter">
          &gt; FILE_ID: {post.id}<br/>
          {/* 💡 날짜와 시간을 모두 정밀하게 표기 */}
          &gt; TIMESTAMP: {new Date(post.created_at).toLocaleString('ko-KR', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
          })}
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-green-900/30 text-green-400 px-3 py-1 text-sm font-bold border border-green-800">
            [{post.category || '일반'}]
          </span>
        </div>

        {/* 💡 제목 크기 대폭 확대 */}
        <h1 className="text-3xl md:text-5xl font-bold text-green-500 leading-tight">
          {post.title}
        </h1>
      </div>

      {/* 💡 본문 내용 크기 대폭 확대 및 가독성 조정 */}
      <div className="w-full bg-black border-l-4 border-green-900 pl-6 py-4 mb-12">
        <p className="text-xl md:text-3xl text-green-400 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      <div className="flex justify-start">
        <div 
          onClick={() => setLocation("/feed")}
          className="border-2 border-green-900 text-green-700 px-8 py-4 text-xl hover:text-green-400 hover:border-green-500 cursor-pointer transition-none font-bold tracking-widest"
        >
          [ &lt; RETURN_TO_FEED ]
        </div>
      </div>
    </div>
  );
}