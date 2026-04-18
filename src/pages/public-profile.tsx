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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params?.userId) return;

      // 1. 유저 프로필 정보 및 사진 URL 가져오기
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

      // 2. 작성한 글 목록 가져오기
      const { data: postsData } = await supabase.from("posts").select("*").eq("author", params.userId).order("created_at", { ascending: false });
      if (postsData) setUserPosts(postsData);

      // 3. 작성한 댓글 목록 가져오기
      const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", params.userId).order("created_at", { ascending: false });
      if (commentsData) setUserComments(commentsData);

      setLoading(false);
    };
    fetchUserData();
  }, [params?.userId]);

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ SCANNING_USER_DATA... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20 text-green-500">
      
      {/* 상단 헤더 */}
      <div className="w-full border-b-2 border-dashed border-green-900 pb-2 mb-4">
        <h2 className="text-lg md:text-2xl font-bold tracking-widest">
          [ USER_DOSSIER: {profile?.nickname} ]
        </h2>
      </div>

      {/* 💡 내 프로필과 동일한 강제 좌우 분할 레이아웃 */}
      <div className="flex flex-row gap-2 mb-8 items-stretch h-auto">
        
        {/* 왼쪽 프로필 이미지 */}
        <div className="w-[48%] aspect-square border-2 border-green-500 bg-green-950/20 relative shrink-0">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-70" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-green-900 font-bold">NO_IMAGE</div>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-black text-[8px] px-1 font-bold">TARGET_PIC</div>
        </div>

        {/* 오른쪽 정보 박스 */}
        <div className="w-[52%] flex flex-col border-2 border-green-500 bg-black justify-between">
          <div className="p-2 flex-grow flex flex-col gap-3">
            
            {/* 닉네임 */}
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center uppercase">
                <span className="mr-1">&gt;</span> SUBJECT_NAME
              </div>
              <div className="text-xl md:text-2xl font-bold text-green-400 leading-none break-all">
                {profile?.nickname || "UNKNOWN"}
              </div>
            </div>

            {/* 소개글 */}
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center uppercase">
                <span className="mr-1">&gt;</span> DESCRIPTION
              </div>
              <div className="text-sm md:text-base font-bold text-green-400 leading-snug whitespace-pre-wrap line-clamp-4">
                {profile?.bio || "데이터 없음."}
              </div>
            </div>
          </div>

          {/* 하단 스탯 바 */}
          <div className="border-t-2 border-green-500 p-1 px-2 flex gap-2 text-[10px] font-bold bg-green-950/30 tracking-widest uppercase">
            <span>POSTS: <span className="text-green-400">{userPosts.length}</span></span>
            <span className="text-green-800">|</span>
            <span>COMMENTS: <span className="text-green-400">{userComments.length}</span></span>
          </div>
        </div>
      </div>

      {/* 활동 이력 로그 섹션 */}
      <div className="flex flex-col gap-10">
        
        {/* 작성한 글 로그 */}
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-green-500 mr-2">&gt;</span> UPLOADED_DATA_LOG
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {userPosts.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs font-bold tracking-widest">NO_LOG_DATA</div>
            ) : (
              userPosts.map(post => (
                <div 
                  key={post.id} 
                  className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-500 hover:text-black transition-none cursor-pointer group"
                  onClick={() => setLocation(`/post/${post.id}`)}
                >
                  <div className="flex-grow text-green-400 text-sm font-bold truncate pr-2 group-hover:text-black">
                    <span className="text-[10px] text-green-700 mr-1 font-normal group-hover:text-black">[{post.category}]</span>
                    {post.title}
                  </div>
                  <div className="text-[10px] text-green-800 font-mono group-hover:text-black">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 작성한 댓글 로그 */}
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-green-500 mr-2">&gt;</span> RECENT_COMMENTS_LOG
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {userComments.length === 0 ? (
              <div className="p-6 text-center text-green-900 text-xs font-bold tracking-widest">NO_LOG_DATA</div>
            ) : (
              userComments.map(comment => (
                <div 
                  key={comment.id} 
                  className="flex justify-between items-center border-b border-green-900 p-2 hover:bg-green-500 hover:text-black transition-none cursor-pointer group"
                  onClick={() => setLocation(`/post/${comment.post_id}`)}
                >
                  <div className="flex-grow text-green-500 text-sm truncate pr-2 group-hover:text-black font-bold">
                    "{comment.content}"
                  </div>
                  <div className="text-[10px] text-green-800 font-mono group-hover:text-black">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 하단 뒤로가기 버튼 */}
        <div className="flex justify-center mt-4">
          <div 
            onClick={() => setLocation("/feed")}
            className="w-full text-center border-2 border-green-900 text-green-800 px-6 py-4 text-sm hover:text-green-400 hover:border-green-500 cursor-pointer font-bold tracking-[0.3em]"
          >
            [ &lt; RETURN_TO_SYSTEM ]
          </div>
        </div>

      </div>
    </div>
  );
}