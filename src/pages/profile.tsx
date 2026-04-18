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
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-20 text-green-500">
      
      {/* 상단 헤더 */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-widest">[ MY_PROFILE_v1.2 ]</h2>
        <button 
          onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
          className="border border-green-500 bg-black text-green-500 px-3 py-1 text-xs hover:bg-green-500 hover:text-black font-bold uppercase"
        >
          {isEditing ? "[ SAVE_DATA ]" : "[ MODIFY_PROFILE ]"}
        </button>
      </div>

      {/* 상단 프로필 레이아웃 섹션 */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch">
        
        {/* 왼쪽 프로필 이미지 (크기 최적화) */}
        <div className="w-full md:w-[45%] aspect-square border-2 border-green-900 overflow-hidden bg-green-950/20 relative">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-green-900">NO_IMG_DATA</div>
          )}
          <div className="absolute top-0 left-0 bg-green-900 text-black text-[10px] px-1 font-bold">BIO_DATA</div>
        </div>

        {/* 오른쪽 정보 박스 (이미지 높이에 맞춤) */}
        <div className="w-full md:flex-grow flex flex-col border-2 border-green-500 bg-black">
          <div className="p-4 flex-grow border-b-2 border-green-500 flex flex-col gap-6">
            <div>
              <div className="text-green-500 font-bold mb-1 text-sm md:text-base tracking-widest">&gt; SUBJECT_NAME</div>
              {isEditing ? (
                <input 
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-400 p-2 text-xl outline-none"
                />
              ) : (
                <div className="text-3xl md:text-5xl font-bold text-green-400">{profile?.nickname || "NONE"}</div>
              )}
            </div>

            <div>
              <div className="text-green-500 font-bold mb-1 text-sm md:text-base tracking-widest">&gt; DESCRIPTION</div>
              {isEditing ? (
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-400 p-2 h-32 text-base outline-none resize-none"
                />
              ) : (
                <div className="text-xl md:text-3xl font-bold text-green-400 leading-snug whitespace-pre-wrap">
                  {profile?.bio || "NONE"}
                </div>
              )}
            </div>
          </div>

          {/* 정보 박스 하단 스탯 바 */}
          <div className="p-3 flex gap-6 text-sm md:text-base font-bold bg-green-950/30 tracking-widest">
            <span className="flex items-center gap-2">POSTS: <span className="text-green-400">{myPosts.length}</span></span>
            <span className="text-green-800">|</span>
            <span className="flex items-center gap-2">COMMENTS: <span className="text-green-400">{myComments.length}</span></span>
          </div>
        </div>
      </div>

      {/* 활동 이력 로그 섹션 */}
      <div className="flex flex-col gap-12">
        
        {/* 게시글 로그 */}
        <div>
          <h3 className="text-2xl font-bold mb-4 tracking-tighter flex items-center">
            <span className="text-green-500 mr-3">&gt;</span> DATA_POSTING_LOG
          </h3>
          <div className="border border-green-900 bg-black">
            {myPosts.length === 0 ? (
              <div className="p-10 text-center text-green-900 font-bold tracking-widest">NO_LOG_DATA_FOUND</div>
            ) : (
              myPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center border-b border-green-900 p-4 hover:bg-green-950/30 transition-colors">
                  <div className="flex-grow cursor-pointer text-green-400 text-lg md:text-xl font-bold truncate pr-6" onClick={() => setLocation(`/post/${post.id}`)}>
                    <span className="text-sm text-green-800 mr-2 font-normal">[{post.category}]</span>{post.title}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs md:text-sm text-green-800 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeletePost(post.id)} className="border border-green-900 bg-red-950/20 px-2 py-0.5 text-[10px] text-red-500 hover:bg-red-900 hover:text-white font-bold transition-all">DEL</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 댓글 로그 */}
        <div>
          <h3 className="text-2xl font-bold mb-4 tracking-tighter flex items-center">
            <span className="text-green-500 mr-3">&gt;</span> RECENT_COMMENTS_LOG
          </h3>
          <div className="border border-green-900 bg-black">
            {myComments.length === 0 ? (
              <div className="p-10 text-center text-green-900 font-bold tracking-widest">NO_LOG_DATA_FOUND</div>
            ) : (
              myComments.map(comment => (
                <div key={comment.id} className="flex justify-between items-center border-b border-green-900 p-4 hover:bg-green-950/30 transition-colors">
                  <div className="flex-grow cursor-pointer text-green-500 text-base md:text-lg truncate pr-6" onClick={() => setLocation(`/post/${comment.post_id}`)}>
                    "{comment.content}"
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs md:text-sm text-green-800 font-mono">{new Date(comment.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteComment(comment.id)} className="border border-green-900 bg-red-950/20 px-2 py-0.5 text-[10px] text-red-500 hover:bg-red-900 hover:text-white font-bold transition-all">DEL</button>
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