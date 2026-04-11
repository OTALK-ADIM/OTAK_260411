import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function PostDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) setCurrentUser(JSON.parse(user));

    const savedPost = localStorage.getItem(`post_${params.id}`);
    if (savedPost) setPost({ ...JSON.parse(savedPost), id: params.id });
    else setPost({ id: params.id, title: "[데이터 손실]", author: "SYSTEM", date: "00/00", content: "내용 없음", likes: 0 });

    const savedComments = localStorage.getItem(`comments_${params.id}`);
    if (savedComments) setComments(JSON.parse(savedComments));
  }, [params.id]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const commentData = {
      id: Date.now(),
      author: currentUser ? currentUser.nickname : "익명",
      text: newComment,
      date: new Date().toLocaleString('ko-KR', { hour12: false }).slice(5, 16)
    };
    const updatedComments = [...comments, commentData];
    setComments(updatedComments);
    localStorage.setItem(`comments_${params.id}`, JSON.stringify(updatedComments));
    setNewComment("");
  };

  if (!post) return <div className="p-6 text-green-500">LOADING...</div>;

  return (
    <div className="w-full flex flex-col gap-4 pb-20 font-mono">
      <div className="flex justify-between items-center border-b border-green-500 pb-2 text-xs">
        <button onClick={() => setLocation("/feed")} className="hover:bg-green-500 hover:text-black px-2 py-1">{"< 뒤로가기"}</button>
        <span>DATA_ID: {post.id}</span>
      </div>

      <div className="bg-[#0a0a0a] p-4 border border-green-500/30">
        <h2 className="text-xl font-bold mb-2 text-green-400">[{post.category || "GENERAL"}] {post.title}</h2>
        <div className="flex gap-4 text-[10px] opacity-60 border-b border-green-500/20 pb-2 mb-4">
          {/* 💡 작성자 클릭 시 프로필로 이동 */}
          <span>AUTHOR: <button onClick={() => setLocation(`/profile/${post.author}`)} className="hover:text-white underline">{post.author}</button></span>
          <span>DATE: {post.date}</span>
        </div>
        <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{post.content}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => setLocation(`/edit/${post.id}`)} className="border border-green-500 px-3 py-1 text-xs hover:bg-green-500 hover:text-black">[ 수정 ]</button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="border-t-2 border-green-500 pt-2 font-bold text-sm">[ COMMENTS_LOG: {comments.length} ]</div>
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="border-l-2 border-green-500/30 pl-3 py-1">
              <div className="flex justify-between mb-1"><span className="text-xs font-bold text-green-400">{c.author}</span><span className="text-[10px] opacity-40">{c.date}</span></div>
              <p className="text-sm opacity-80">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="bg-black border border-green-500/50 p-2 text-sm text-green-500 focus:outline-none min-h-[60px] resize-none" placeholder="댓글 입력..." />
          <button onClick={handleCommentSubmit} className="bg-green-500 text-black font-bold py-1 hover:bg-green-400 text-sm">[ 댓글 기록하기 ]</button>
          <p className="text-[10px] opacity-40 text-center">* Warning: Once recorded, data cannot be deleted.</p>
        </div>
      </div>
    </div>
  );
}