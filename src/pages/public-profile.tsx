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

      // 1. 유저 프로필 정보 및 사진 URL
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", params.userId).maybeSingle();
      if (!profileData) {
        alert("존재하지 않는 유저입니다.");
        setLocation("/feed");
        return;
      }
      
      if (profileData.profile_img_url) {
        const { data: imgData } = supabase.storage.from('profiles').getPublicUrl(profileData.profile_img_url);
        profileData.imageUrl = imgData.publicUrl;
      }
      setProfile(profileData);

      // 2. 작성한 글/댓글 통계용
      const { data: postsData } = await supabase.from("posts").select("*").eq("author", params.userId).order("created_at", { ascending: false });
      if (postsData) setUserPosts(postsData);

      const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", params.userId).order("created_at", { ascending: false });
      if (commentsData) setUserComments(commentsData);

      setLoading(false);
    };
    fetchUserData();
  }, [params?.userId]);

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono">[ SEARCHING_USER_DATA... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-green-500 tracking-widest">
          [ USER_DOSSIER ]
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8 border-2 border-green-800 bg-black p-6 mb-12">
        <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-green-800 shrink-0 flex items-center justify-center bg-green-950/10 overflow-hidden relative">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-70" />
          ) : (
            <span className="text-green-900 text-xs text-center">NO_IMAGE</span>
          )}
          <div className="absolute top-0 left-0 bg-green-800 text-black text-[10px] px-1 font-bold">PUBLIC</div>
        </div>

        <div className="flex flex-col flex-grow justify-between">
          <div>
            <div className="text-sm text-green-800 tracking-widest mb-1">&gt; CODENAME:</div>
            <div className="text-3xl md:text-5xl font-bold text-green-400 mb-4">{profile?.nickname}</div>
            
            <div className="text-sm text-green-800 tracking-widest mb-1">&gt; BIO:</div>
            <div className="text-green-500 text-sm md:text-base leading-relaxed bg-green-950/10 p-3 border border-green-900 h-24 overflow-y-auto">
              {profile?.bio || "등록된 정보가 없습니다."}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 border-t border-green-900 pt-4">
            <div className="flex-1 border border-green-900 bg-black p-2 text-center">
              <div className="text-xs text-green-800 mb-1">DATA_UPLOADED</div>
              <div className="text-2xl font-bold text-green-500">{userPosts.length}</div>
            </div>
            <div className="flex-1 border border-green-900 bg-black p-2 text-center">
              <div className="text-xs text-green-800 mb-1">COMMENTS_LEFT</div>
              <div className="text-2xl font-bold text-green-500">{userComments.length}</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-green-600 mb-4 border-l-4 border-green-800 pl-3">▶ 타겟의 데이터 기록</h3>
      <div className="border border-green-900 bg-black mb-12">
        {userPosts.length === 0 ? (
          <div className="p-8 text-center text-green-900">NO_DATA_FOUND</div>
        ) : (
          userPosts.map(post => (
            <div 
              key={post.id} 
              className="flex justify-between items-center border-b border-green-900 p-4 cursor-pointer hover:bg-green-950/30"
              onClick={() => setLocation(`/post/${post.id}`)}
            >
              <div className="text-green-400 text-lg font-bold truncate pr-4">
                <span className="text-sm text-green-800 mr-2">[{post.category}]</span>{post.title}
              </div>
              <div className="text-xs text-green-800 shrink-0">{new Date(post.created_at).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}