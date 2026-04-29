import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function PublicProfile() {
  const [, params] = useRoute("/profile/:userId");
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const fetchUserData = async () => {
    if (!params?.userId) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", params.userId).maybeSingle();
    if (!profileData) {
      alert("[시스템] 존재하지 않는 유저 데이터입니다.");
      setLocation("/feed");
      return;
    }
    if (profileData.profile_img_url) {
      const { data: imgData } = supabase.storage.from("profiles").getPublicUrl(profileData.profile_img_url);
      profileData.imageUrl = imgData.publicUrl;
    }
    setProfile(profileData);

    if (user && user.id !== params.userId) {
      const { data: blockData } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", params.userId)
        .maybeSingle();
      setIsBlocked(!!blockData);
    }

    const { data: postsData } = await supabase.from("posts").select("*").eq("author", params.userId).order("created_at", { ascending: false });
    if (postsData) setUserPosts(postsData);

    const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", params.userId).order("created_at", { ascending: false });
    if (commentsData) setUserComments(commentsData);

    if (user && user.id !== params.userId) {
      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("*")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${params.userId}),and(user1_id.eq.${params.userId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (roomData) {
        setRoomStatus(roomData.status);
        setRoomId(roomData.id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [params?.userId]);

  const handleRequestDM = async () => {
    if (!currentUser) return;
    if (isBlocked) {
      alert("[시스템] 차단한 유저에게는 DM 요청을 보낼 수 없습니다. 먼저 차단을 해제하세요.");
      return;
    }
    if (confirm("이 유저에게 비밀 통신망 연결을 요청하시겠습니까?")) {
      const { data, error } = await supabase.from("chat_rooms").insert({
        user1_id: currentUser.id,
        user2_id: params?.userId
      }).select().single();

      if (error) {
        alert(`[에러] 요청 실패: ${error.message}`);
      } else {
        const { data: myProfile } = await supabase.from("profiles").select("nickname").eq("id", currentUser.id).maybeSingle();
        await supabase.from("notifications").insert({
          target_user_id: params?.userId,
          from_nickname: myProfile?.nickname || "UNKNOWN",
          type: "DM_REQUEST"
        });

        alert("[시스템] 통신 연결 요청을 전송했습니다.");
        setRoomStatus("PENDING");
        setRoomId(data.id);
      }
    }
  };

  const handleReportUser = async () => {
    if (!currentUser || !params?.userId || isWorking) return;
    const reason = prompt("신고 사유를 입력하세요. 예: 괴롭힘, 사칭, 불법행위, 혐오표현, 광고 등");
    if (!reason?.trim()) return;

    setIsWorking(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: "USER",
      target_id: params.userId,
      target_user_id: params.userId,
      reason: reason.trim(),
      status: "PENDING"
    });
    setIsWorking(false);

    if (error) alert(`[ERROR] 신고 접수 실패: ${error.message}`);
    else alert("[시스템] 신고가 접수되었습니다. 관리자가 확인합니다.");
  };

  const handleToggleBlock = async () => {
    if (!currentUser || !params?.userId || isWorking) return;
    const message = isBlocked
      ? `${profile?.nickname || "이 유저"}의 차단을 해제하시겠습니까?`
      : `${profile?.nickname || "이 유저"}를 차단하시겠습니까? 글/댓글이 숨겨지고 DM 요청이 제한됩니다.`;
    if (!confirm(message)) return;

    setIsWorking(true);
    if (isBlocked) {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", currentUser.id)
        .eq("blocked_id", params.userId);
      if (error) alert(`[ERROR] 차단 해제 실패: ${error.message}`);
      else setIsBlocked(false);
    } else {
      const { error } = await supabase
        .from("user_blocks")
        .insert({ blocker_id: currentUser.id, blocked_id: params.userId });
      if (error) alert(`[ERROR] 차단 실패: ${error.message}`);
      else setIsBlocked(true);
    }
    setIsWorking(false);
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ SCANNING_USER_DATA... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20 text-green-500">
      <div className="w-full border-b-2 border-dashed border-green-900 pb-2 mb-4 flex justify-between items-end gap-2">
        <h2 className="text-lg md:text-2xl font-bold tracking-widest">[ USER_DOSSIER: {profile?.nickname} ]</h2>
        {currentUser && currentUser.id !== params?.userId && (
          <div className="flex gap-2 shrink-0">
            <button onClick={handleReportUser} disabled={isWorking} className="border border-red-900 text-red-500 px-2 py-1 text-[10px] font-bold hover:bg-red-500 hover:text-black disabled:opacity-40">[ REPORT ]</button>
            <button onClick={handleToggleBlock} disabled={isWorking} className={`border px-2 py-1 text-[10px] font-bold disabled:opacity-40 ${isBlocked ? "border-yellow-600 text-yellow-500 hover:bg-yellow-500" : "border-red-900 text-red-500 hover:bg-red-500"} hover:text-black`}>
              {isBlocked ? "[ UNBLOCK ]" : "[ BLOCK ]"}
            </button>
          </div>
        )}
      </div>

      {isBlocked && (
        <div className="border-2 border-red-900/70 bg-red-950/10 text-red-400 p-4 text-sm font-bold mb-6 leading-relaxed">
          [ BLOCKED_USER ] 현재 차단한 유저입니다. 이 유저의 글/댓글은 피드와 상세 화면에서 숨겨집니다.
        </div>
      )}

      <div className="flex flex-row gap-2 mb-8 items-stretch h-auto">
        <div className="w-[48%] aspect-square border-2 border-green-500 bg-green-950/20 relative shrink-0">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-70" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-green-900 font-bold">NO_IMAGE</div>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-black text-[8px] px-1 font-bold">TARGET_PIC</div>
        </div>

        <div className="w-[52%] flex flex-col border-2 border-green-500 bg-black justify-between">
          <div className="p-2 flex-grow flex flex-col gap-3">
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center uppercase"><span className="mr-1">&gt;</span> SUBJECT_NAME</div>
              <div className="text-xl md:text-2xl font-bold text-green-400 leading-none break-all">{profile?.nickname || "UNKNOWN"}</div>
            </div>
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center uppercase"><span className="mr-1">&gt;</span> DESCRIPTION</div>
              <div className="text-sm md:text-base font-bold text-green-400 leading-snug whitespace-pre-wrap line-clamp-4">{profile?.bio || "데이터 없음."}</div>
            </div>
          </div>

          {currentUser && currentUser.id !== params?.userId && (
            <div className="p-2 border-t border-green-900 bg-green-950/20">
              {isBlocked ? (
                <div className="w-full text-center border border-red-900 text-red-500 py-2 text-xs font-bold tracking-widest">
                  [ DM_BLOCKED ]
                </div>
              ) : !roomStatus ? (
                <button onClick={handleRequestDM} className="w-full bg-black border border-green-500 text-green-400 py-2 text-xs font-bold tracking-widest hover:bg-green-500 hover:text-black transition-none">
                  [ REQUEST_SECURE_COMMS ]
                </button>
              ) : roomStatus === "PENDING" ? (
                <div className="w-full text-center border border-green-900 text-green-800 py-2 text-xs font-bold tracking-widest animate-pulse">
                  [ WAITING_FOR_ACCEPTANCE... ]
                </div>
              ) : (
                <button onClick={() => setLocation(`/chat/${roomId}`)} className="w-full bg-green-900 text-green-400 border border-green-400 py-2 text-xs font-bold tracking-widest hover:bg-green-400 hover:text-black transition-none shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                  [ ENTER_SECURE_CHANNEL ]
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isBlocked && (
        <div className="flex flex-col gap-10">
          <div>
            <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2"><span className="text-green-500 mr-2">&gt;</span> UPLOADED_DATA_LOG</h3>
            <div className="border-2 border-green-900 bg-black">
              {userPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-500 hover:text-black cursor-pointer group" onClick={() => setLocation(`/post/${post.id}`)}>
                  <div className="flex-grow text-green-400 text-sm font-bold truncate pr-2 group-hover:text-black"><span className="text-[10px] text-green-700 mr-1 font-normal group-hover:text-black">[{post.category}]</span>{post.title}</div>
                  <div className="text-[10px] text-green-800 font-mono group-hover:text-black">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2"><span className="text-green-500 mr-2">&gt;</span> RECENT_COMMENTS_LOG</h3>
            <div className="border-2 border-green-900 bg-black">
              {userComments.map(comment => (
                <div key={comment.id} className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-500 hover:text-black cursor-pointer group" onClick={() => setLocation(`/post/${comment.post_id}`)}>
                  <div className="flex-grow text-green-500 text-sm truncate pr-2 group-hover:text-black font-bold">"{comment.content}"</div>
                  <div className="text-[10px] text-green-800 font-mono group-hover:text-black">{new Date(comment.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
