import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const fetchSavedPostIds = async (userId: string) => {
    const { data, error } = await supabase
      .from("post_saves")
      .select("post_id")
      .eq("user_id", userId);

    if (!error && data) {
      setSavedPostIds(data.map((row: any) => row.post_id));
    }
  };

  const fetchBlockedUserIds = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId);

    if (!error && data) {
      setBlockedUserIds(data.map((row: any) => row.blocked_id));
    }
  };

  const fetchUserStatusAndPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved, is_suspended")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setIsApproved(profile.is_approved === true);
        setIsSuspended(profile.is_suspended === true);
      }
      await fetchSavedPostIds(user.id);
      await fetchBlockedUserIds(user.id);
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
      const msg = String(error?.message || "");
      if (msg.includes("post_saves") || msg.includes("schema cache")) {
        alert("[ERROR] 저장 기능 DB 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 SQL 패치를 먼저 실행한 뒤 Vercel을 새로고침해 주세요.");
      } else {
        alert("[ERROR] 저장 처리 실패: " + error.message);
      }
    } finally {
      setSavingPostId(null);
    }
  };

  const handleReportPost = async (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    if (!currentUser || reportingId) {
      if (!currentUser) alert("[시스템] 신고하려면 로그인이 필요합니다.");
      return;
    }

    const reason = prompt("신고 사유를 입력하세요. 예: 욕설, 괴롭힘, 불법정보, 광고, 개인정보 노출 등");
    if (!reason?.trim()) return;

    setReportingId(post.id);
    const { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: "POST",
      target_id: String(post.id),
      target_user_id: post.author,
      reason: reason.trim(),
      status: "PENDING"
    });
    setReportingId(null);

    if (error) {
      alert(`[ERROR] 신고 접수 실패: ${error.message}`);
    } else {
      alert("[시스템] 신고가 접수되었습니다. 관리자가 확인합니다.");
    }
  };

  const visiblePosts = posts.filter(post => !blockedUserIds.includes(post.author));

  return (
    <div className="w-full flex flex-col gap-6 font-mono pb-20">
      <style>{`
        .otalk-save-btn {
          -webkit-appearance: none;
          appearance: none;
          border-radius: 0;
          background-color: #000000;
          color: #16a34a;
        }
        .otalk-save-btn.saved {
          background-color: rgba(34, 197, 94, 0.16);
          color: #86efac;
          border-color: #4ade80;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.25);
        }
      `}</style>
      <div className="flex justify-between items-end px-2 mt-4 md:mt-8 mb-4 border-b-2 border-green-900 pb-4">
        <div className="text-xl md:text-3xl font-bold text-green-500 tracking-tighter">
          [ COMM_FEED ]
        </div>
        {isApproved && !isSuspended ? (
          <div
            onClick={() => setLocation("/write")}
            className="border border-green-500 bg-green-950/20 text-green-400 px-4 py-2 hover:bg-green-500 hover:text-black font-bold text-sm cursor-pointer transition-none"
          >
            + NEW_TRANSMISSION
          </div>
        ) : null}
      </div>

      {isSuspended && (
        <div className="border-2 border-red-900/70 bg-red-950/10 text-red-400 p-4 text-sm font-bold leading-relaxed">
          [ SUSPENDED_READ_ONLY ] 현재 계정은 제재 상태입니다. 글 열람은 가능하지만 작성/댓글/채팅은 제한됩니다.
        </div>
      )}

      <div className="w-full flex flex-col border-t-2 border-green-500 bg-black">
        {visiblePosts.length === 0 ? (
          <div className="p-10 text-center text-green-700 animate-pulse font-bold tracking-widest">[ NO_DATA_FOUND ]</div>
        ) : (
          visiblePosts.map((post, index) => {
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
                  <span>No.{visiblePosts.length - index}</span>
                  <span className="md:hidden">{dateDisplay}</span>
                </div>
                <div className="flex-grow text-left truncate pl-0 md:pl-4 font-bold text-base md:text-lg text-green-400 group-hover:text-green-300">
                  <span className="text-green-800 mr-2 font-normal text-xs md:text-sm">
                    [{post.category || "일반"}]
                  </span>
                  {post.title}
                </div>
                <div className="flex justify-between md:justify-end items-center md:w-[22rem] mt-3 md:mt-0 shrink-0 gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => handleToggleSave(e, post.id)}
                    disabled={!currentUser || savingPostId === post.id}
                    className={`otalk-save-btn ${saved ? "saved" : ""} text-[10px] md:text-xs font-bold px-2 py-1 border border-green-800 hover:border-green-400 hover:bg-green-500/20 hover:text-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-none`}
                  >
                    {savingPostId === post.id ? "..." : saved ? "★ SAVED" : "☆ SAVE"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleReportPost(e, post)}
                    disabled={!currentUser || reportingId === post.id}
                    className="text-[10px] md:text-xs font-bold px-2 py-1 border border-red-900 text-red-500 bg-black hover:bg-red-500 hover:text-black disabled:opacity-40 transition-none"
                  >
                    {reportingId === post.id ? "..." : "REPORT"}
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
