import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);

  const fetchSavedPostIds = async (userId: string) => {
    const { data, error } = await supabase
      .from("post_saves")
      .select("post_id")
      .eq("user_id", userId);

    if (!error && data) {
      setSavedPostIds(data.map((row: any) => row.post_id));
    }
  };

  const fetchUserStatusAndPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) setIsApproved(profile.is_approved);
      await fetchSavedPostIds(user.id);
    }

    const { data: fetchedPosts } = await supabase
      .from("posts")
      .select("*, comments(count)")
      .order("created_at", { ascending: false });

    if (fetchedPosts) setPosts(fetchedPosts);
  };

  useEffect(() => {
    fetchUserStatusAndPosts();
  }, []);

  const handleToggleSave = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser || savingPostId) return;

    setSavingPostId(postId);
    const alreadySaved = savedPostIds.includes(postId);

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from("post_saves")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("post_id", postId);
        if (error) throw error;
        setSavedPostIds(prev => prev.filter(id => id !== postId));
      } else {
        const { error } = await supabase
          .from("post_saves")
          .insert({ user_id: currentUser.id, post_id: postId });
        if (error) throw error;
        setSavedPostIds(prev => [...prev, postId]);
      }
    } catch (error: any) {
      alert(`[ERROR] 저장 처리 실패: ${error.message}`);
    } finally {
      setSavingPostId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-mono pb-20">
      <div className="flex justify-between items-end px-2 mt-4 md:mt-8 mb-4 border-b-2 border-green-900 pb-4">
        <div className="text-xl md:text-3xl font-bold text-green-500 tracking-tighter">
          [ COMM_FEED ]
        </div>
        {isApproved ? (
          <div
            onClick={() => setLocation("/write")}
            className="border border-green-500 bg-green-950/20 text-green-400 px-4 py-2 hover:bg-green-500 hover:text-black font-bold text-sm cursor-pointer transition-none"
          >
            + NEW_TRANSMISSION
          </div>
        ) : null}
      </div>

      <div className="w-full flex flex-col border-t-2 border-green-500 bg-black">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-green-700 animate-pulse font-bold tracking-widest">[ NO_DATA_FOUND ]</div>
        ) : (
          posts.map((post, index) => {
            let dateDisplay = "N/A";
            if (post.created_at) {
              const d = new Date(post.created_at);
              if (d.getFullYear() > 1970) {
                dateDisplay = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
              }
            }

            const signalCount = post.comments?.[0]?.count || 0;
            const saved = savedPostIds.includes(post.id);

            return (
              <div
                key={post.id}
                onClick={() => setLocation(`/post/${post.id}`)}
                className="flex flex-col md:flex-row border-b border-green-900 text-green-500 p-4 hover:bg-green-950/40 transition-none cursor-pointer group"
              >
                <div className="flex justify-between md:w-32 text-xs md:text-sm text-green-700 font-bold mb-2 md:mb-0 shrink-0">
                  <span>No.{posts.length - index}</span>
                  <span className="md:hidden">{dateDisplay}</span>
                </div>
                <div className="flex-grow text-left truncate pl-0 md:pl-4 font-bold text-base md:text-lg text-green-400 group-hover:text-green-300">
                  <span className="text-green-800 mr-2 font-normal text-xs md:text-sm">
                    [{post.category || "일반"}]
                  </span>
                  {post.title}
                </div>
                <div className="flex justify-between md:justify-end items-center md:w-64 mt-3 md:mt-0 shrink-0 gap-2">
                  <button
                    onClick={(e) => handleToggleSave(e, post.id)}
                    disabled={!currentUser || savingPostId === post.id}
                    className={`${saved ? "border-yellow-500 bg-yellow-500 text-black" : "border-yellow-700 text-yellow-500 bg-yellow-950/10"} text-[10px] md:text-xs font-bold px-2 py-1 border hover:bg-yellow-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {savingPostId === post.id ? "..." : saved ? "★ SAVED" : "☆ SAVE"}
                  </button>
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-1 border ${signalCount > 0 ? "border-green-500 text-green-400" : "border-green-900 text-green-800"}`}>
                    SIGNALS: {signalCount}
                  </span>
                  <span className="hidden md:inline-block text-xs font-bold text-green-700 ml-2 w-20 text-right">
                    {dateDisplay}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
