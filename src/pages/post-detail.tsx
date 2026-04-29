import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchSaveState = async (userId: string, postId: string) => {
    const { data, error } = await supabase
      .from("post_saves")
      .select("post_id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (!error) setIsSaved(!!data);
  };

  const fetchBlocks = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId);

    if (!error && data) setBlockedUserIds(data.map((row: any) => row.blocked_id));
  };

  const fetchPostAndComments = async () => {
    if (!params?.id) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setMyProfile(profile);
      await fetchSaveState(user.id, params.id);
      await fetchBlocks(user.id);
    }

    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (!postData) {
      setLocation("/feed");
      return;
    }
    setPost(postData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", postData.author)
      .maybeSingle();
    if (profileData) setAuthorProfile(profileData);

    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    if (commentData && commentData.length > 0) {
      const userIds = [...new Set(commentData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", userIds);
      const profilesMap = profilesData?.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
      setComments(commentData.map(c => ({ ...c, nickname: profilesMap[c.user_id] || "UNKNOWN" })));
    } else {
      setComments([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchPostAndComments(); }, [params?.id]);

  const handleToggleSave = async () => {
    if (!params?.id || !currentUser || isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("post_saves")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("post_id", params.id);
        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from("post_saves")
          .insert({ user_id: currentUser.id, post_id: params.id });
        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error: any) {
      const msg = String(error?.message || "");
      if (msg.includes("post_saves") || msg.includes("schema cache")) {
        alert("[ERROR] 저장 기능 DB 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 SQL 패치를 먼저 실행한 뒤 Vercel을 새로고침해 주세요.");
      } else {
        alert("[ERROR] 저장 처리 실패: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReport = async (targetType: "POST" | "COMMENT" | "USER", targetId: string, targetUserId?: string | null) => {
    if (!currentUser || workingId) {
      if (!currentUser) alert("[시스템] 신고하려면 로그인이 필요합니다.");
      return;
    }
    if (targetUserId && targetUserId === currentUser.id) {
      alert("[시스템] 자신의 데이터는 신고할 수 없습니다.");
      return;
    }

    const reason = prompt("신고 사유를 입력하세요. 예: 욕설, 괴롭힘, 불법정보, 광고, 개인정보 노출 등");
    if (!reason?.trim()) return;

    setWorkingId(`report-${targetType}-${targetId}`);
    const { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: targetType,
      target_id: String(targetId),
      target_user_id: targetUserId || null,
      reason: reason.trim(),
      status: "PENDING"
    });
    setWorkingId(null);

    if (error) alert(`[ERROR] 신고 접수 실패: ${error.message}`);
    else alert("[시스템] 신고가 접수되었습니다. 관리자가 확인합니다.");
  };

  const handleToggleBlock = async (targetUserId: string, nickname?: string) => {
    if (!currentUser || workingId || targetUserId === currentUser.id) return;
    const alreadyBlocked = blockedUserIds.includes(targetUserId);
    const msg = alreadyBlocked
      ? `${nickname || "이 유저"}의 차단을 해제하시겠습니까?`
      : `${nickname || "이 유저"}를 차단하시겠습니까? 차단하면 해당 유저의 글/댓글이 숨겨지고 DM 요청을 받지 않습니다.`;
    if (!confirm(msg)) return;

    setWorkingId(`block-${targetUserId}`);
    if (alreadyBlocked) {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", currentUser.id)
        .eq("blocked_id", targetUserId);
      if (error) alert(`[ERROR] 차단 해제 실패: ${error.message}`);
      else setBlockedUserIds(prev => prev.filter(id => id !== targetUserId));
    } else {
      const { error } = await supabase
        .from("user_blocks")
        .insert({ blocker_id: currentUser.id, blocked_id: targetUserId });
      if (error) alert(`[ERROR] 차단 실패: ${error.message}`);
      else setBlockedUserIds(prev => [...prev, targetUserId]);
    }
    setWorkingId(null);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("[시스템] 로그인이 필요합니다.");
        setLocation("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved, is_suspended, nickname")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_suspended === true) {
        alert("[시스템] 제재 상태에서는 댓글 작성이 제한됩니다.");
        return;
      }

      if (profile?.is_approved !== true) {
        alert("[시스템] 관리자 승인 후 댓글 작성이 가능합니다.");
        setLocation("/pending");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      if (post.author !== user.id) {
        const { error: notifError } = await supabase.from("notifications").insert({
          target_user_id: post.author,
          from_nickname: profile?.nickname || "UNKNOWN",
          type: "COMMENT",
          related_id: post.id,
          is_read: false
        });

        if (notifError) console.error("[notification insert failed]", notifError.message);
      }

      setNewComment("");
      fetchPostAndComments();
    } catch (error: any) {
      alert(`[ERROR] 댓글 전송 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuote = (nickname: string, content: string) => {
    setNewComment(prev => `${prev ? prev + "\n" : ""}> ${nickname} : ${content}\n\n`);
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ ACCESSING_DATA... ]</div>;

  const canEdit = currentUser && post && (post.author === currentUser.id || myProfile?.is_admin === true || myProfile?.role === "admin");
  const canComment = currentUser && myProfile?.is_approved === true && myProfile?.is_suspended !== true;
  const isAuthorBlocked = post?.author && blockedUserIds.includes(post.author);
  const visibleComments = comments.filter(c => !blockedUserIds.includes(c.user_id));

  if (isAuthorBlocked) {
    return (
      <div className="w-full flex flex-col gap-6 font-mono mt-8 text-green-500">
        <div className="border-2 border-red-900 bg-red-950/10 p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">[ BLOCKED_USER_CONTENT ]</h2>
          <p className="text-sm text-red-300/80 leading-relaxed mb-6">차단한 유저의 게시글입니다. 내용을 보려면 차단을 해제하세요.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setLocation("/feed")} className="border border-green-800 text-green-500 px-4 py-2 text-xs font-bold hover:bg-green-500 hover:text-black">[ BACK_FEED ]</button>
            <button onClick={() => handleToggleBlock(post.author, authorProfile?.nickname)} className="border border-red-500 text-red-400 px-4 py-2 text-xs font-bold hover:bg-red-500 hover:text-black">[ UNBLOCK ]</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-32">
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
      <div className="w-full border-b-2 border-green-900 pb-6 mb-10">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="text-green-700 text-xs font-bold tracking-widest">&gt; CATEGORY: [{post.category || "GENERAL"}]</div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={!currentUser || isSaving}
              className={`otalk-save-btn ${isSaved ? "saved" : ""} border border-green-800 px-3 py-1 cursor-pointer hover:border-green-400 hover:bg-green-500/20 hover:text-green-200 font-bold text-[10px] tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-none`}
            >
              {isSaving ? "[ ... ]" : isSaved ? "[ ★ SAVED ]" : "[ ☆ SAVE ]"}
            </button>
            {currentUser && post.author !== currentUser.id && (
              <>
                <button onClick={() => handleReport("POST", post.id, post.author)} className="border border-red-900 bg-black px-3 py-1 text-red-500 cursor-pointer hover:bg-red-500 hover:text-black font-bold text-[10px] tracking-widest">[ REPORT ]</button>
                <button onClick={() => handleToggleBlock(post.author, authorProfile?.nickname)} className="border border-red-900 bg-black px-3 py-1 text-red-500 cursor-pointer hover:bg-red-500 hover:text-black font-bold text-[10px] tracking-widest">[ BLOCK_USER ]</button>
              </>
            )}
            {canEdit && (
              <button
                onClick={() => setLocation(`/edit/${post.id}`)}
                className="border border-yellow-700 bg-yellow-950/20 px-3 py-1 text-yellow-500 cursor-pointer hover:bg-yellow-500 hover:text-black font-bold text-[10px] tracking-widest"
              >
                [ EDIT ]
              </button>
            )}
            <div onClick={() => setLocation(`/profile/${authorProfile?.id}`)} className="border border-green-800 bg-green-950/30 px-3 py-1 text-green-400 cursor-pointer hover:bg-green-500 hover:text-black font-bold text-[10px] tracking-widest">
              AUTHOR: {authorProfile?.nickname}
            </div>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-green-500 leading-snug">{post.title}</h1>
      </div>

      <div className="text-lg md:text-2xl text-green-400 leading-relaxed whitespace-pre-wrap min-h-[30vh] mb-16 p-4 border-l-2 border-green-800 bg-black">
        {post.content}
      </div>

      <div className="w-full border-t-2 border-green-900 pt-10">
        <h3 className="text-lg md:text-xl font-bold text-green-600 mb-8 tracking-widest">
          [ SIGNAL_LOGS ] ({visibleComments.length})
        </h3>

        <div className="flex flex-col gap-6 mb-10">
          {visibleComments.map((c) => (
            <div key={c.id} className="border border-green-900 p-4 bg-black relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-none">
                <button
                  onClick={() => handleQuote(c.nickname, c.content)}
                  className="text-[10px] border border-green-800 text-green-700 px-2 py-1 hover:bg-green-800 hover:text-black transition-none font-bold"
                >
                  [ QUOTE ]
                </button>
                {currentUser && c.user_id !== currentUser.id && (
                  <>
                    <button onClick={() => handleReport("COMMENT", c.id, c.user_id)} className="text-[10px] border border-red-900 text-red-500 px-2 py-1 hover:bg-red-500 hover:text-black transition-none font-bold">[ REPORT ]</button>
                    <button onClick={() => handleToggleBlock(c.user_id, c.nickname)} className="text-[10px] border border-red-900 text-red-500 px-2 py-1 hover:bg-red-500 hover:text-black transition-none font-bold">[ BLOCK ]</button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3 pr-48">
                <span onClick={() => setLocation(`/profile/${c.user_id}`)} className="font-bold text-green-500 cursor-pointer hover:underline underline-offset-4 decoration-dashed">@{c.nickname}</span>
                <span className="text-[10px] text-green-800">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-base md:text-lg text-green-400 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>

        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-green-950/10 border-2 border-green-900 text-green-400 p-4 text-base h-40 outline-none focus:border-green-500 resize-none font-mono leading-relaxed"
              placeholder="> 주파수 응답을 입력하십시오 (과몰입 환영)..."
            />
            <button type="submit" disabled={isSubmitting} className="self-end border-2 border-green-500 bg-black text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-none tracking-widest disabled:opacity-50">
              {isSubmitting ? "[ SENDING... ]" : "[ TRANSMIT_SIGNAL ]"}
            </button>
          </form>
        ) : (
          <div className="border-2 border-yellow-900/70 bg-yellow-950/10 text-yellow-500 p-4 text-sm leading-relaxed font-bold">
            [ READ_ONLY_MODE ] 승인 대기 또는 제재 상태에서는 글과 댓글을 볼 수 있지만, 댓글 작성은 제한됩니다. 글 저장은 가능합니다.
          </div>
        )}
      </div>
    </div>
  );
}
