import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 💡 수정 모드 관련 상태
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

  // 💡 프로필 수정 저장 함수
  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ nickname: editNickname, bio: editBio })
        .eq("id", user.id);

      if (error) throw error;
      
      alert("[시스템] 프로필 정보가 업데이트되었습니다.");
      setIsEditing(false);
      fetchMyData(); // 새로고침
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
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8 flex justify-between items-end">
        <h2 className="text-2xl md:text-3xl font-bold text-green-500 tracking-widest">
          [ MY_PROFILE_v1.2 ]
        </h2>
        {/* 💡 편집 모드 토글 버튼 */}
        <button 
          onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
          className="border border-green-500 bg-black text-green-500 px-4 py-1 text-xs hover:bg-green-500 hover:text-black transition-none font-bold"
        >
          {isEditing ? "[ SAVE_CHANGES ]" : "[ MODIFY_PROFILE ]"}
        </button>
      </div>

      {/* 💡 레이아웃 수정: 사진 왼쪽(절반 크기), 정보 오른쪽 */}
      <div className="flex flex-col sm:flex-row gap-6 border-2 border-green-900 bg-black p-4 md:p-6 mb-12 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        
        {/* 사진 영역 (크기 대폭 축소) */}
        <div className="w-32 h-32 md:w-40 md:h-40 border border-green-500 shrink-0 bg-green-950/20 overflow-hidden relative">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale" />
          ) : (
            <span className="text-green-800 text-[10px] text-center p-4 block">NO_IMAGE_DATA</span>
          )}
          <div className="absolute bottom-0 right-0 bg-green-500 text-black text-[8px] px-1 font-bold">VERIFIED</div>
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col flex-grow gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-green-700 tracking-widest uppercase">&gt; SUBJECT_NAME</span>
            {isEditing ? (
              <input 
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="bg-green-950/20 border border-green-500 text-green-400 p-2 text-xl outline-none"
              />
            ) : (
              <div className="text-2xl md:text-4xl font-bold text-green-400">{profile?.nickname}</div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-green-700 tracking-widest uppercase">&gt; DESCRIPTION</span>
            {isEditing ? (
              <textarea 
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="bg-green-950/20 border border-green-500 text-green-400 p-2 h-20 text-sm outline-none resize-none"
              />
            ) : (
              <div className="text-green-500 text-sm leading-relaxed border-l-2 border-green-900 pl-3">
                {profile?.bio || "데이터가 비어있습니다."}
              </div>
            )}
          </div>

          {/* 활동 요약 수치 */}
          <div className="flex gap-4 mt-2">
            <div className="text-[10px] text-green-800 border border-green-900 px-2 py-1">
              POSTS: {myPosts.length}
            </div>
            <div className="text-[10px] text-green-800 border border-green-900 px-2 py-1">
              COMMENTS: {myComments.length}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 활동 이력 (기존과 동일하되 스타일 정돈) */}
      <div className="w-full flex flex-col gap-10">
        
        {/* 내가 쓴 글 */}
        <div>
          <h3 className="text-lg font-bold text-green-600 mb-4 tracking-tighter">&gt; DATA_POSTING_LOG</h3>
          <div className="border border-green-900 bg-black">
            {myPosts.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs">LOG_IS_EMPTY</div>
            ) : (
              myPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center border-b border-green-950 p-3 hover:bg-green-950/20">
                  <div className="flex-grow cursor-pointer text-green-400 font-bold truncate pr-4" onClick={() => setLocation(`/post/${post.id}`)}>
                    <span className="text-[10px] text-green-700 mr-2">[{post.category}]</span>{post.title}
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-[10px] text-green-900">{new Date(post.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeletePost(post.id)} className="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase underline">DEL</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 내가 쓴 댓글 */}
        <div>
          <h3 className="text-lg font-bold text-green-600 mb-4 tracking-tighter">&gt; RECENT_COMMENTS_LOG</h3>
          <div className="border border-green-900 bg-black">
            {myComments.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs">LOG_IS_EMPTY</div>
            ) : (
              myComments.map(comment => (
                <div key={comment.id} className="flex justify-between items-center border-b border-green-950 p-3 hover:bg-green-950/20">
                  <div className="flex-grow cursor-pointer text-green-500 text-sm truncate pr-4" onClick={() => setLocation(`/post/${comment.post_id}`)}>
                    "{comment.content}"
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-[10px] text-green-900">{new Date(comment.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase underline">DEL</button>
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