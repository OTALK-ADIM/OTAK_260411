import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  const isAdminProfile = (profile: any) => profile?.is_admin === true || profile?.role === "admin";

  const fetchAdminData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!isAdminProfile(myProfile)) {
      alert("[시스템] 관리자 권한이 없습니다.");
      setLocation("/");
      return;
    }

    const { data: pending } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_approved", false);

    const { data: approved } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_approved", true)
      .limit(50);

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const userIds = [
      ...(pending || []).map((p: any) => p.id),
      ...(approved || []).map((p: any) => p.id),
      ...(posts || []).map((p: any) => p.author),
      ...(comments || []).map((c: any) => c.user_id),
    ].filter(Boolean);

    if (userIds.length > 0) {
      const uniqueIds = [...new Set(userIds)];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", uniqueIds);
      const map = profiles?.reduce((acc: Record<string, string>, p: any) => {
        acc[p.id] = p.nickname || "UNKNOWN";
        return acc;
      }, {}) || {};
      setProfileMap(map);
    }

    setPendingUsers(pending || []);
    setApprovedUsers(approved || []);
    setRecentPosts(posts || []);
    setRecentComments(comments || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveUser = async (userId: string) => {
    if (!confirm("이 유저의 입국 심사를 승인하시겠습니까?")) return;
    const { error } = await supabase.from("profiles").update({ is_approved: true }).eq("id", userId);
    if (error) return alert(`[에러] 승인 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleRestrictUser = async (userId: string) => {
    if (!confirm("이 유저를 다시 승인 대기 상태로 전환하시겠습니까?")) return;
    const { error } = await supabase.from("profiles").update({ is_approved: false }).eq("id", userId);
    if (error) return alert(`[에러] 제한 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("이 게시글을 삭제하시겠습니까? 관련 댓글도 함께 삭제될 수 있습니다.")) return;
    await supabase.from("comments").delete().eq("post_id", postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return alert(`[에러] 게시글 삭제 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) return alert(`[에러] 댓글 삭제 실패: ${error.message}`);
    fetchAdminData();
  };

  if (loading) {
    return <div className="text-red-500 animate-pulse p-10 font-mono text-center">[ ADMIN_CONSOLE_LOADING... ]</div>;
  }

  return (
    <div className="w-full flex flex-col gap-10 font-mono text-red-500 pb-20">
      <div className="border-b-2 border-red-500 pb-2 mb-2 text-center font-bold tracking-widest text-red-500">
        [ SYSTEM_ADMIN_CONSOLE ]
      </div>

      <section className="bg-[#0a0a0a] p-4 border border-yellow-500/50">
        <h3 className="text-yellow-500 font-bold mb-4 tracking-widest">:: 입국 심사 대기 유저 ::</h3>
        <div className="flex flex-col gap-2">
          {pendingUsers.length === 0 ? (
            <div className="text-center opacity-50 text-sm text-yellow-500 p-4">대기 중인 유저가 없습니다.</div>
          ) : pendingUsers.map(user => (
            <div key={user.id} className="flex flex-col md:flex-row justify-between gap-3 border-b border-yellow-500/30 pb-3">
              <div className="text-yellow-100 text-sm leading-relaxed">
                <div className="font-bold text-yellow-400">{user.nickname || "NO_NICKNAME"}</div>
                <div className="text-[10px] opacity-60 break-all">ID: {user.id}</div>
                <div className="text-xs opacity-80 whitespace-pre-wrap">{user.bio || "소개 없음"}</div>
              </div>
              <button
                onClick={() => handleApproveUser(user.id)}
                className="border border-green-500 text-green-400 px-4 py-2 text-xs hover:bg-green-500 hover:text-black transition-none whitespace-nowrap font-bold"
              >
                [ APPROVE ]
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] p-4 border border-red-500/50">
        <h3 className="text-red-500 font-bold mb-4 tracking-widest">:: 승인 유저 관리 ::</h3>
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {approvedUsers.map(user => (
            <div key={user.id} className="flex justify-between items-center border-b border-red-500/20 pb-2 gap-3">
              <div className="truncate text-sm text-red-100">
                <span className="text-red-400 font-bold mr-2">{user.nickname || "UNKNOWN"}</span>
                <span className="text-[10px] opacity-50">{user.id}</span>
              </div>
              <button
                onClick={() => handleRestrictUser(user.id)}
                className="border border-yellow-600 text-yellow-500 px-2 py-1 text-[10px] hover:bg-yellow-500 hover:text-black transition-none whitespace-nowrap font-bold"
              >
                [ RESTRICT ]
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] p-4 border border-red-500/50">
        <h3 className="text-red-500 font-bold mb-4 tracking-widest">:: 게시물 관리 ::</h3>
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {recentPosts.length === 0 ? (
            <div className="text-center opacity-50 text-sm text-red-500 p-4">게시글이 없습니다.</div>
          ) : recentPosts.map(post => (
            <div key={post.id} className="flex justify-between items-center border-b border-red-500/30 pb-2 gap-3">
              <div onClick={() => setLocation(`/post/${post.id}`)} className="truncate text-sm mr-2 text-red-100 cursor-pointer hover:underline">
                <span className="text-red-500 mr-2">[{post.category || "일반"}]</span>
                {post.title}
                <span className="text-[10px] opacity-50 ml-2">by {profileMap[post.author] || "UNKNOWN"}</span>
              </div>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="border border-red-500 text-red-500 px-2 py-1 text-xs hover:bg-red-500 hover:text-black transition-none whitespace-nowrap font-bold"
              >
                [ DELETE ]
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] p-4 border border-red-500/50">
        <h3 className="text-red-500 font-bold mb-4 tracking-widest">:: 댓글 관리 ::</h3>
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {recentComments.length === 0 ? (
            <div className="text-center opacity-50 text-sm text-red-500 p-4">댓글이 없습니다.</div>
          ) : recentComments.map(comment => (
            <div key={comment.id} className="flex justify-between items-center border-b border-red-500/30 pb-2 gap-3">
              <div onClick={() => setLocation(`/post/${comment.post_id}`)} className="truncate text-sm mr-2 text-red-100 cursor-pointer hover:underline">
                <span className="text-[10px] opacity-50 mr-2">{profileMap[comment.user_id] || "UNKNOWN"}</span>
                “{comment.content}”
              </div>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="border border-red-500 text-red-500 px-2 py-1 text-xs hover:bg-red-500 hover:text-black transition-none whitespace-nowrap font-bold"
              >
                [ DELETE ]
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={() => setLocation("/feed")}
        className="self-end border border-green-500 text-green-500 px-4 py-2 hover:bg-green-500 hover:text-black transition-none mt-4"
      >
        [ 일반 모드로 복귀 ]
      </button>
    </div>
  );
}
