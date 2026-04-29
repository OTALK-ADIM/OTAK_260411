import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [workingId, setWorkingId] = useState<string | null>(null);

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
      .limit(80);

    const { data: reportRows } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

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
      ...(reportRows || []).map((r: any) => r.reporter_id),
      ...(reportRows || []).map((r: any) => r.target_user_id),
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
    setReports(reportRows || []);
    setRecentPosts(posts || []);
    setRecentComments(comments || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveUser = async (userId: string) => {
    if (!confirm("이 유저의 입국 심사를 승인하시겠습니까?")) return;
    const { error } = await supabase.from("profiles").update({ is_approved: true, is_suspended: false }).eq("id", userId);
    if (error) return alert(`[에러] 승인 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleRestrictUser = async (userId: string) => {
    if (!confirm("이 유저를 다시 승인 대기 상태로 전환하시겠습니까?")) return;
    const { error } = await supabase.from("profiles").update({ is_approved: false }).eq("id", userId);
    if (error) return alert(`[에러] 제한 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleSuspendUser = async (userId: string, suspended: boolean) => {
    const message = suspended ? "이 유저의 제재를 해제하시겠습니까?" : "이 유저를 제재 상태로 전환하시겠습니까? 글쓰기/댓글/채팅이 제한됩니다.";
    if (!confirm(message)) return;
    const { error } = await supabase.from("profiles").update({ is_suspended: !suspended }).eq("id", userId);
    if (error) return alert(`[에러] 제재 상태 변경 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleWarnUser = async (userId: string, currentCount = 0) => {
    if (!confirm("이 유저에게 경고 카운트를 1회 추가하시겠습니까?")) return;
    const { error } = await supabase.from("profiles").update({ warning_count: Number(currentCount || 0) + 1 }).eq("id", userId);
    if (error) return alert(`[에러] 경고 추가 실패: ${error.message}`);
    fetchAdminData();
  };

  const handleReportStatus = async (reportId: string, status: "REVIEWING" | "RESOLVED" | "REJECTED") => {
    setWorkingId(reportId);
    const admin_note = status === "RESOLVED" ? prompt("처리 메모를 입력하세요. 빈칸도 가능합니다.") || "처리 완료" : undefined;
    const payload: any = { status };
    if (status === "RESOLVED" || status === "REJECTED") payload.resolved_at = new Date().toISOString();
    if (admin_note) payload.admin_note = admin_note;

    const { error } = await supabase.from("reports").update(payload).eq("id", reportId);
    setWorkingId(null);
    if (error) return alert(`[에러] 신고 상태 변경 실패: ${error.message}`);
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

  const targetLabel = (report: any) => {
    if (report.target_type === "POST") return `게시글 ${report.target_id}`;
    if (report.target_type === "COMMENT") return `댓글 ${report.target_id}`;
    if (report.target_type === "USER") return `유저 ${profileMap[report.target_user_id] || report.target_id}`;
    if (report.target_type === "DM_MESSAGE") return `DM ${report.target_id}`;
    return `${report.target_type} ${report.target_id}`;
  };

  if (loading) {
    return <div className="text-red-500 animate-pulse p-10 font-mono text-center">[ ADMIN_CONSOLE_LOADING... ]</div>;
  }

  return (
    <div className="w-full flex flex-col gap-10 font-mono text-red-500 pb-20">
      <div className="border-b-2 border-red-500 pb-2 mb-2 text-center font-bold tracking-widest text-red-500">
        [ SYSTEM_ADMIN_CONSOLE_v1.10 ]
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
        <h3 className="text-red-500 font-bold mb-4 tracking-widest">:: 신고 접수함 ::</h3>
        <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
          {reports.length === 0 ? (
            <div className="text-center opacity-50 text-sm text-red-500 p-4">접수된 신고가 없습니다.</div>
          ) : reports.map(report => (
            <div key={report.id} className={`border p-3 ${report.status === "PENDING" ? "border-red-500/60 bg-red-950/10" : "border-red-900/40 bg-black"}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                <div className="text-sm text-red-100 leading-relaxed">
                  <div className="font-bold text-red-400">[{report.status}] {report.target_type} / {targetLabel(report)}</div>
                  <div className="text-[10px] opacity-70">신고자: {profileMap[report.reporter_id] || report.reporter_id}</div>
                  <div className="text-[10px] opacity-70">대상 유저: {profileMap[report.target_user_id] || report.target_user_id || "N/A"}</div>
                  <div className="mt-2 whitespace-pre-wrap text-red-200">{report.reason}</div>
                  {report.admin_note && <div className="mt-2 text-[10px] text-yellow-400">ADMIN_NOTE: {report.admin_note}</div>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {report.target_type === "POST" && <button onClick={() => setLocation(`/post/${report.target_id}`)} className="border border-green-500 text-green-400 px-2 py-1 text-[10px] font-bold hover:bg-green-500 hover:text-black">OPEN</button>}
                  {report.target_user_id && <button onClick={() => setLocation(`/profile/${report.target_user_id}`)} className="border border-green-500 text-green-400 px-2 py-1 text-[10px] font-bold hover:bg-green-500 hover:text-black">USER</button>}
                  {report.target_user_id && <button onClick={() => handleWarnUser(report.target_user_id, 0)} className="border border-yellow-500 text-yellow-500 px-2 py-1 text-[10px] font-bold hover:bg-yellow-500 hover:text-black">WARN</button>}
                  {report.target_user_id && <button onClick={() => handleSuspendUser(report.target_user_id, false)} className="border border-red-500 text-red-500 px-2 py-1 text-[10px] font-bold hover:bg-red-500 hover:text-black">SUSPEND</button>}
                  <button disabled={workingId === report.id} onClick={() => handleReportStatus(report.id, "REVIEWING")} className="border border-blue-500 text-blue-400 px-2 py-1 text-[10px] font-bold hover:bg-blue-500 hover:text-black disabled:opacity-40">REVIEW</button>
                  <button disabled={workingId === report.id} onClick={() => handleReportStatus(report.id, "RESOLVED")} className="border border-green-500 text-green-400 px-2 py-1 text-[10px] font-bold hover:bg-green-500 hover:text-black disabled:opacity-40">RESOLVE</button>
                  <button disabled={workingId === report.id} onClick={() => handleReportStatus(report.id, "REJECTED")} className="border border-red-900 text-red-400 px-2 py-1 text-[10px] font-bold hover:bg-red-900 hover:text-white disabled:opacity-40">REJECT</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] p-4 border border-red-500/50">
        <h3 className="text-red-500 font-bold mb-4 tracking-widest">:: 승인 유저 관리 ::</h3>
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
          {approvedUsers.map(user => (
            <div key={user.id} className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-red-500/20 pb-2 gap-3">
              <div className="truncate text-sm text-red-100">
                <span className="text-red-400 font-bold mr-2">{user.nickname || "UNKNOWN"}</span>
                <span className="text-[10px] opacity-50">경고 {user.warning_count || 0} / {user.is_suspended ? "SUSPENDED" : "ACTIVE"}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleWarnUser(user.id, user.warning_count || 0)} className="border border-yellow-600 text-yellow-500 px-2 py-1 text-[10px] hover:bg-yellow-500 hover:text-black transition-none whitespace-nowrap font-bold">[ WARN ]</button>
                <button onClick={() => handleSuspendUser(user.id, user.is_suspended === true)} className="border border-red-500 text-red-500 px-2 py-1 text-[10px] hover:bg-red-500 hover:text-black transition-none whitespace-nowrap font-bold">{user.is_suspended ? "[ UNSUSPEND ]" : "[ SUSPEND ]"}</button>
                <button onClick={() => handleRestrictUser(user.id)} className="border border-yellow-600 text-yellow-500 px-2 py-1 text-[10px] hover:bg-yellow-500 hover:text-black transition-none whitespace-nowrap font-bold">[ RESTRICT ]</button>
              </div>
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
