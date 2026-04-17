import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }

    // 1. 내 프로필 정보 및 사진 URL 가져오기
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profileData) {
      if (profileData.profile_img_url) {
        const { data: imgData } = supabase.storage.from('profiles').getPublicUrl(profileData.profile_img_url);
        profileData.imageUrl = imgData.publicUrl;
      }
      setProfile(profileData);
    }

    // 2. 내가 쓴 글 가져오기
    const { data: postsData } = await supabase.from("posts").select("*").eq("author", user.id).order("created_at", { ascending: false });
    if (postsData) setMyPosts(postsData);

    // 3. 내가 쓴 댓글 가져오기
    const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (commentsData) setMyComments(commentsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  // 삭제 함수 (글)
  const handleDeletePost = async (postId: string) => {
    if (!confirm("정말 이 데이터를 영구 삭제하시겠습니까?")) return;
    await supabase.from("posts").delete().eq("id", postId);
    fetchMyData();
  };

  // 삭제 함수 (댓글)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말 이 코멘트를 영구 삭제하시겠습니까?")) return;
    await supabase.from("comments").delete().eq("id", commentId);
    fetchMyData();
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ LOADING_ARCHIVE... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-green-500 tracking-widest">
          [ MY_ARCHIVE_TERMINAL ]
        </h2>
      </div>

      {/* 프로필 요약 카드 */}
      <div className="flex flex-col md:flex-row gap-8 border-2 border-green-500 bg-black p-6 mb-12 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
        {/* 사진 영역 */}
        <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-green-500 shrink-0 flex items-center justify-center bg-green-950/20 overflow-hidden relative">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-500" />
          ) : (
            <span className="text-green-800 animate-pulse text-xs text-center">NO_IMAGE</span>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-black text-[10px] px-1 font-bold">ID_CARD</div>
        </div>

        {/* 정보 및 통계 영역 */}
        <div className="flex flex-col flex-grow justify-between">
          <div>
            <div className="text-sm text-green-700 tracking-widest mb-1">&gt; CODENAME:</div>
            <div className="text-3xl md:text-5xl font-bold text-green-400 mb-4">{profile?.nickname}</div>
            
            <div className="text-sm text-green-700 tracking-widest mb-1">&gt; BIO:</div>
            <div className="text-green-500 text-sm md:text-base leading-relaxed bg-green-950/20 p-3 border border-green-900 h-24 overflow-y-auto">
              {profile?.bio || "등록된 자기소개가 없습니다."}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 border-t border-green-900 pt-4">
            <div className="flex-1 border border-green-800 bg-black p-2 text-center">
              <div className="text-xs text-green-700 mb-1">DATA_UPLOADED</div>
              <div className="text-2xl font-bold text-green-400">{myPosts.length}</div>
            </div>
            <div className="flex-1 border border-green-800 bg-black p-2 text-center">
              <div className="text-xs text-green-700 mb-1">COMMENTS_LEFT</div>
              <div className="text-2xl font-bold text-green-400">{myComments.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 내가 쓴 글 목록 */}
      <h3 className="text-xl font-bold text-green-500 mb-4 border-l-4 border-green-500 pl-3">▶ 작성한 데이터 목록</h3>
      <div className="border border-green-900 bg-black mb-12">
        {myPosts.length === 0 ? (
          <div className="p-8 text-center text-green-800">NO_DATA_FOUND</div>
        ) : (
          myPosts.map(post => (
            <div key={post.id} className="flex flex-col md:flex-row border-b border-green-900 p-4 hover:bg-green-950/30">
              <div 
                className="flex-grow cursor-pointer text-green-400 text-lg md:text-xl font-bold mb-2 md:mb-0 hover:text-green-300"
                onClick={() => setLocation(`/post/${post.id}`)}
              >
                <span className="text-sm text-green-700 mr-2">[{post.category}]</span>{post.title}
              </div>
              <div className="flex justify-between md:justify-end items-center gap-4 shrink-0">
                <span className="text-xs text-green-800">{new Date(post.created_at).toLocaleDateString()}</span>
                <button onClick={() => handleDeletePost(post.id)} className="bg-red-950/50 text-red-500 border border-red-900 px-3 py-1 text-xs hover:bg-red-900 hover:text-white font-bold">삭제</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 내가 쓴 댓글 목록 */}
      <h3 className="text-xl font-bold text-green-500 mb-4 border-l-4 border-green-500 pl-3">▶ 작성한 코멘트 목록</h3>
      <div className="border border-green-900 bg-black">
        {myComments.length === 0 ? (
          <div className="p-8 text-center text-green-800">NO_COMMENTS_FOUND</div>
        ) : (
          myComments.map(comment => (
            <div key={comment.id} className="flex flex-col md:flex-row border-b border-green-900 p-4 hover:bg-green-950/30">
              <div 
                className="flex-grow cursor-pointer text-green-400 text-base md:text-lg mb-2 md:mb-0 truncate hover:text-green-300"
                onClick={() => setLocation(`/post/${comment.post_id}`)}
              >
                {comment.content}
              </div>
              <div className="flex justify-between md:justify-end items-center gap-4 shrink-0">
                <span className="text-xs text-green-800">{new Date(comment.created_at).toLocaleDateString()}</span>
                <button onClick={() => handleDeleteComment(comment.id)} className="bg-red-950/50 text-red-500 border border-red-900 px-3 py-1 text-xs hover:bg-red-900 hover:text-white font-bold">삭제</button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}