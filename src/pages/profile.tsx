import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio, setEditBio] = useState("");

  const fetchMyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profileData) {
      if (profileData.profile_img_url) {
        const { data: imgData } = supabase.storage.from('profiles').getPublicUrl(profileData.profile_img_url);
        profileData.imageUrl = imgData.publicUrl;
      }
      setProfile(profileData);
      setEditNickname(profileData.nickname || "");
      setEditBio(profileData.bio || "");
    }

    const { data: postsData } = await supabase.from("posts").select("*").eq("author", user.id).order("created_at", { ascending: false });
    if (postsData) setMyPosts(postsData);

    const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (commentsData) setMyComments(commentsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ nickname: editNickname, bio: editBio })
        .eq("id", user.id);

      if (error) throw error;
      
      alert("[시스템] 프로필이 업데이트되었습니다.");
      setIsEditing(false);
      fetchMyData();
    } catch (error: any) {
      alert(`[에러] 수정 실패: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("정말 이 데이터를 영구 삭제하시겠습니까?")) return;
    await supabase.from("posts").delete().eq("id", postId);
    fetchMyData();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말 이 코멘트를 영구 삭제하시겠습니까?")) return;
    await supabase.from("comments").delete().eq("id", commentId);
    fetchMyData();
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ ACCESSING_USER_ARCHIVE... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20 text-green-500">
      
      {/* 상단 헤더 */}
      <div className="flex justify-between items-end mb-4 border-b-2 border-dashed border-green-900 pb-2">
        <h2 className="text-lg md:text-2xl font-bold tracking-widest">[ MY_PROFILE_v1.2 ]</h2>
        <button 
          onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
          className="border border-green-500 bg-black text-green-500 px-2 py-1 text-[10px] md:text-xs hover:bg-green-500 hover:text-black font-bold uppercase transition-none"
        >
          {isEditing ? "[ SAVE_DATA ]" : "[ MODIFY_PROFILE ]"}
        </button>
      </div>

      {/* 💡 핵심: 모바일에서도 무조건 좌우 분할되도록 flex-row 강제 적용 */}
      <div className="flex flex-row gap-2 mb-8 items-stretch h-auto">
        
        {/* 왼쪽 프로필 이미지 (무조건 전체 너비의 45~50% 차지, 정사각형 유지) */}
        <div className="w-[48%] aspect-square border-2 border-green-500 bg-green-950/20 relative shrink-0">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-green-900">NO_IMG_DATA</div>
          )}
        </div>

        {/* 오른쪽 정보 박스 (남은 공간 차지) */}
        <div className="w-[52%] flex flex-col border-2 border-green-500 bg-black justify-between">
          <div className="p-2 flex-grow flex flex-col gap-3">
            
            {/* 닉네임 */}
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center">
                <span className="mr-1">&gt;</span> SUBJECT_NAME
              </div>
              {isEditing ? (
                <input 
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-400 p-1 text-sm outline-none"
                />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-green-400 leading-none break-all">
                  {profile?.nickname || "NONE"}
                </div>
              )}
            </div>

            {/* 소개글 */}
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center">
                <span className="mr-1">&gt;</span> DESCRIPTION
              </div>
              {isEditing ? (
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-400 p-1 h-12 text-xs outline-none resize-none"
                />
              ) : (
                <div className="text-sm md:text-base font-bold text-green-400 leading-snug whitespace-pre-wrap line-clamp-3">
                  {profile?.bio || "NONE"}
                </div>
              )}
            </div>
          </div>

          {/* 정보 박스 하단 스탯 바 */}
          <div className="border-t-2 border-green-500 p-1 px-2 flex gap-2 text-[10px] font-bold bg-green-950/30 tracking-widest uppercase">
            <span>POSTS: <span className="text-green-400">{myPosts.length}</span></span>
            <span className="text-green-800">|</span>
            <span>COMMENTS: <span className="text-green-400">{myComments.length}</span></span>
          </div>
        </div>
      </div>

      {/* 활동 이력 로그 섹션 */}
      <div className="flex flex-col gap-8">
        
        {/* 게시글 로그 */}
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-green-500 mr-2">&gt;</span> DATA_POSTING_LOG
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {myPosts.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs font-bold tracking-widest">NO_LOG_DATA_FOUND</div>
            ) : (
              myPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-950/30 transition-none">
                  <div className="flex-grow cursor-pointer text-green-400 text-sm font-bold truncate pr-2" onClick={() => setLocation(`/post/${post.id}`)}>
                    <span className="text-[10px] text-green-700 mr-1 font-normal">[{post.category}]</span>{post.title}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-green-800 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeletePost(post.id)} className="border border-green-900 bg-black px-1 py-0.5 text-[9px] text-red-500 hover:bg-green-500 hover:text-black font-bold transition-none">DEL</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 댓글 로그 */}
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-green-500 mr-2">&gt;</span> RECENT_COMMENTS_LOG
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {myComments.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs font-bold tracking-widest">NO_LOG_DATA_FOUND</div>
            ) : (
              myComments.map(comment => (
                <div key={comment.id} className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-950/30 transition-none">
                  <div className="flex-grow cursor-pointer text-green-500 text-sm truncate pr-2" onClick={() => setLocation(`/post/${comment.post_id}`)}>
                    "{comment.content}"
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-green-800 font-mono">{new Date(comment.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteComment(comment.id)} className="border border-green-900 bg-black px-1 py-0.5 text-[9px] text-red-500 hover:bg-green-500 hover:text-black font-bold transition-none">DEL</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}