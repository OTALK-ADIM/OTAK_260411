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
  
  // 💡 채팅방 상태
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params?.userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 1. 유저 프로필
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", params.userId).maybeSingle();
      if (!profileData) {
        alert("[시스템] 존재하지 않는 유저 데이터입니다.");
        setLocation("/feed");
        return;
      }
      if (profileData.profile_img_url) {
        const { data: imgData } = supabase.storage.from('profiles').getPublicUrl(profileData.profile_img_url);
        profileData.imageUrl = imgData.publicUrl;
      }
      setProfile(profileData);

      // 2. 글/댓글 가져오기
      const { data: postsData } = await supabase.from("posts").select("*").eq("author", params.userId).order("created_at", { ascending: false });
      if (postsData) setUserPosts(postsData);

      const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", params.userId).order("created_at", { ascending: false });
      if (commentsData) setUserComments(commentsData);

      // 💡 3. 나와 타겟 간의 채팅방이 존재하는지 확인
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
    fetchUserData();
  }, [params?.userId]);

  // 💡 DM 신청 함수
  const handleRequestDM = async () => {
    if (!currentUser) return;
    if (confirm("이 유저에게 비밀 통신망 연결을 요청하시겠습니까?")) {
      const { data, error } = await supabase.from("chat_rooms").insert({
        user1_id: currentUser.id,
        user2_id: params?.userId
      }).select().single();

      if (error) {
        alert(`[에러] 요청 실패: ${error.message}`);
      } else {
        alert("[시스템] 통신 연결 요청을 전송했습니다.");
        setRoomStatus("PENDING");
        setRoomId(data.id);
      }
    }
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ SCANNING_USER_DATA... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20 text-green-500">
      <div className="w-full border-b-2 border-dashed border-green-900 pb-2 mb-4">
        <h2 className="text-lg md:text-2xl font-bold tracking-widest">[ USER_DOSSIER: {profile?.nickname} ]</h2>
      </div>

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

          {/* 💡 DM 컨트롤 패널 */}
          {currentUser && currentUser.id !== params?.userId && (
            <div className="p-2 border-t border-green-900 bg-green-950/20">
              {!roomStatus ? (
                <button onClick={handleRequestDM} className="w-full bg-black border border-green-500 text-green-400 py-2 text-xs font-bold tracking-widest hover:bg-green-500 hover:text-black transition-none">
                  [ REQUEST_SECURE_COMMS (DM 신청) ]
                </button>
              ) : roomStatus === "PENDING" ? (
                <div className="w-full text-center border border-green-900 text-green-800 py-2 text-xs font-bold tracking-widest animate-pulse">
                  [ WAITING_FOR_ACCEPTANCE... ]
                </div>
              ) : (
                <button onClick={() => setLocation(`/chat/${roomId}`)} className="w-full bg-green-900 text-green-400 border border-green-400 py-2 text-xs font-bold tracking-widest hover:bg-green-400 hover:text-black transition-none shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                  [ ENTER_SECURE_CHANNEL (입장) ]
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 활동 이력 (기존과 동일하여 축약, 원래 코드 유지) */}
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
    </div>
  );
}