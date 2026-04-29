import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio, setEditBio] = useState("");

  const fetchSavedPosts = async (userId: string) => {
    const { data: saves } = await supabase
      .from("post_saves")
      .select("post_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!saves || saves.length === 0) {
      setSavedPosts([]);
      return;
    }

    const postIds = saves.map((s: any) => s.post_id);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .in("id", postIds);

    const postsMap = postsData?.reduce((acc: any, post: any) => ({ ...acc, [post.id]: post }), {}) || {};
    setSavedPosts(saves.map((s: any) => ({ ...postsMap[s.post_id], saved_at: s.created_at })).filter((p: any) => p.id));
  };

  const fetchBlockedUsers = async (userId: string) => {
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("blocked_id, created_at")
      .eq("blocker_id", userId)
      .order("created_at", { ascending: false });

    if (!blocks || blocks.length === 0) {
      setBlockedUsers([]);
      return;
    }

    const ids = blocks.map((b: any) => b.blocked_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", ids);
    const map = profiles?.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
    setBlockedUsers(blocks.map((b: any) => ({ ...b, nickname: map[b.blocked_id] || "UNKNOWN" })));
  };

  const fetchMyData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profileData) {
      if (profileData.profile_img_url) {
        const { data: imgData } = supabase.storage.from("profiles").getPublicUrl(profileData.profile_img_url);
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

    await fetchSavedPosts(user.id);
    await fetchBlockedUsers(user.id);
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
        .update({ nickname: editNickname.trim(), bio: editBio.trim() })
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
    if (!confirm("정말 이 데이터를 삭제하시겠습니까? 관련 댓글과 저장 기록도 함께 삭제될 수 있습니다.")) return;
    try {
      await supabase.from("comments").delete().eq("post_id", postId);
      await supabase.from("post_saves").delete().eq("post_id", postId);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      fetchMyData();
    } catch (error: any) {
      alert(`[에러] 삭제 실패: ${error.message}`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말 이 코멘트를 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      fetchMyData();
    } catch (error: any) {
      alert(`[에러] 삭제 실패: ${error.message}`);
    }
  };

  const handleUnblockUser = async (blockedId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!confirm("이 유저의 차단을 해제하시겠습니까?")) return;
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId);
    if (error) {
      alert(`[에러] 차단 해제 실패: ${error.message}`);
      return;
    }
    fetchMyData();
  };

  const handleUnsavePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("post_saves")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      alert(`[에러] 저장 해제 실패: ${error.message}`);
      return;
    }
    fetchMyData();
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ ACCESSING_USER_ARCHIVE... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-20 text-green-500">
      <div className="flex justify-between items-end mb-4 border-b-2 border-dashed border-green-900 pb-2">
        <h2 className="text-lg md:text-2xl font-bold tracking-widest">[ MY_PROFILE_v1.4 ]</h2>
        <button
          onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
          className="border border-green-500 bg-black text-green-500 px-2 py-1 text-[10px] md:text-xs hover:bg-green-500 hover:text-black font-bold uppercase transition-none"
        >
          {isEditing ? "[ SAVE_DATA ]" : "[ MODIFY_PROFILE ]"}
        </button>
      </div>

      <div className="flex flex-row gap-2 mb-8 items-stretch h-auto">
        <div className="w-[48%] aspect-square border-2 border-green-500 bg-green-950/20 relative shrink-0">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-green-900">NO_IMG_DATA</div>
          )}
        </div>

        <div className="w-[52%] flex flex-col border-2 border-green-500 bg-black justify-between">
          <div className="p-2 flex-grow flex flex-col gap-3">
            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center">
                <span className="mr-1">&gt;</span> SUBJECT_NAME
              </div>
              {isEditing ? (
                <input
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-300 p-1 text-sm outline-none font-bold"
                />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-green-400 leading-none break-all">
                  {profile?.nickname || "NONE"}
                </div>
              )}
            </div>

            <div>
              <div className="text-green-500 font-bold mb-1 text-[10px] tracking-widest flex items-center">
                <span className="mr-1">&gt;</span> DESCRIPTION
              </div>
              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-500 text-green-300 p-1 h-12 text-xs outline-none resize-none font-bold"
                />
              ) : (
                <div className="text-sm md:text-base font-bold text-green-400 leading-snug whitespace-pre-wrap line-clamp-3">
                  {profile?.bio || "NONE"}
                </div>
              )}
            </div>
          </div>

          <div className="border-t-2 border-green-500 p-1 px-2 flex flex-wrap gap-2 text-[10px] font-bold bg-green-950/30 tracking-widest uppercase">
            <span>POSTS: <span className="text-green-400">{myPosts.length}</span></span>
            <span className="text-green-800">|</span>
            <span>COMMENTS: <span className="text-green-400">{myComments.length}</span></span>
            <span className="text-green-800">|</span>
            <span>SAVED: <span className="text-green-300">{savedPosts.length}</span></span>
            <span className="text-green-800">|</span>
            <span>BLOCKED: <span className="text-red-400">{blockedUsers.length}</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-green-300 mr-2">★</span> SAVED_TRANSMISSIONS
          </h3>
          <div className="border-2 border-green-900/70 bg-black">
            {savedPosts.length === 0 ? (
              <div className="p-6 text-center text-green-900/70 text-xs font-bold tracking-widest">NO_SAVED_DATA_FOUND</div>
            ) : (
              savedPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center border-b border-green-900/40 p-2 hover:bg-green-950/20 transition-none">
                  <div className="flex-grow cursor-pointer text-green-300 text-sm font-bold truncate pr-2" onClick={() => setLocation(`/post/${post.id}`)}>
                    <span className="text-[10px] text-green-700 mr-1 font-normal">[{post.category || "일반"}]</span>{post.title}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-green-800 font-mono">{new Date(post.saved_at).toLocaleDateString()}</span>
                    <button onClick={() => handleUnsavePost(post.id)} className="border border-green-900 bg-black px-1 py-0.5 text-[9px] text-green-300 hover:bg-green-500 hover:text-black font-bold transition-none">UNSAVE</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tighter flex items-center bg-black inline-block pr-2">
            <span className="text-red-500 mr-2">!</span> BLOCKED_USERS
          </h3>
          <div className="border-2 border-red-900/60 bg-black">
            {blockedUsers.length === 0 ? (
              <div className="p-6 text-center text-red-900/70 text-xs font-bold tracking-widest">NO_BLOCKED_USERS</div>
            ) : (
              blockedUsers.map(block => (
                <div key={block.blocked_id} className="flex justify-between items-center border-b border-red-900/40 p-2 hover:bg-red-950/20 transition-none">
                  <div className="flex-grow cursor-pointer text-red-300 text-sm font-bold truncate pr-2" onClick={() => setLocation(`/profile/${block.blocked_id}`)}>
                    @{block.nickname}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-red-800 font-mono">{new Date(block.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleUnblockUser(block.blocked_id)} className="border border-red-900 bg-black px-1 py-0.5 text-[9px] text-red-300 hover:bg-red-500 hover:text-black font-bold transition-none">UNBLOCK</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
