import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Archive() {
  const [, setLocation] = useLocation();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLocation("/login");

      // 저장된 글 정보를 가져와서 원본 글 데이터와 합침
      const { data } = await supabase
        .from('saved_posts')
        .select('post_id, posts(*, comments(count))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const formatted = data.map((item: any) => item.posts).filter(post => post !== null);
        setSavedPosts(formatted);
      }
      setLoading(false);
    };
    fetchSavedPosts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 font-mono pb-20 text-green-500">
      <div className="flex justify-between items-end border-b-2 border-green-500 pb-4 mt-6">
        <div>
          <span className="text-[10px] text-green-700 tracking-widest">&gt; VAULT_ACCESS</span>
          <h1 className="text-2xl font-bold tracking-tighter">[ ARCHIVED_SIGNALS ]</h1>
        </div>
        <button onClick={() => setLocation("/")} className="text-xs underline decoration-dashed underline-offset-4 hover:text-green-400">BACK_TO_HOME</button>
      </div>

      <div className="flex flex-col border-t border-green-500 bg-black">
        {loading ? (
          <div className="p-10 text-center animate-pulse">[ ACCESSING_VAULT... ]</div>
        ) : savedPosts.length === 0 ? (
          <div className="p-10 text-center text-green-900 italic font-bold">-- NO_SAVED_DATA_FOUND --</div>
        ) : (
          savedPosts.map((p, i) => (
            <div key={p.id} onClick={() => setLocation(`/post/${p.id}`)} className="flex items-center p-4 border-b border-green-900 hover:bg-green-950/40 cursor-pointer group">
              <span className="w-12 text-[10px] text-green-900">No.{savedPosts.length - i}</span>
              <span className="flex-grow font-bold text-green-400 truncate">
                <span className="opacity-50 font-normal mr-2">[{p.category}]</span>
                {p.title}
              </span>
              <span className="text-[10px] border border-green-900 px-2 text-green-800">SIG: {p.comments?.[0]?.count || 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}