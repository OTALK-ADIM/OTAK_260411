import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function getKoreaDateString() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const d = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export default function DailyDiscussion() {
  const today = getKoreaDateString();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [myComment, setMyComment] = useState<any>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canWrite = profile?.is_approved === true && profile?.is_suspended !== true;

  const fetchDiscussion = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, nickname, is_approved, is_suspended")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(myProfile);
    }

    const { data: topicData, error: topicError } = await supabase
      .from("daily_discussion_topics")
      .select("*")
      .eq("topic_date", today)
      .eq("is_active", true)
      .maybeSingle();

    if (topicError) console.error("[daily discussion topic error]", topicError.message);

    if (!topicData) {
      setTopic(null);
      setComments([]);
      setMyComment(null);
      setLoading(false);
      return;
    }

    setTopic(topicData);

    const { data: commentData, error: commentError } = await supabase
      .from("daily_discussion_comments")
      .select("*")
      .eq("topic_id", topicData.id)
      .order("created_at", { ascending: true });

    if (commentError) console.error("[daily discussion comments error]", commentError.message);

    const rows = commentData || [];
    const ids = [...new Set(rows.map((c: any) => c.user_id))];
    const { data: profiles } = ids.length > 0
      ? await supabase.from("profiles").select("id, nickname").in("id", ids)
      : { data: [] as any[] };

    const profileMap = profiles?.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
    const enriched = rows.map((c: any) => ({ ...c, nickname: profileMap[c.user_id] || "UNKNOWN" }));
    setComments(enriched);
    setMyComment(user ? enriched.find((c: any) => c.user_id === user.id) || null : null);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscussion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !currentUser || !content.trim() || isSubmitting) return;
    if (!canWrite) {
      alert("[시스템] 승인된 유저만 오늘의 토론에 참여할 수 있습니다.");
      return;
    }
    if (myComment) {
      alert("[시스템] 오늘의 토론은 1인 1회만 참여할 수 있습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("daily_discussion_comments").insert({
        topic_id: topic.id,
        user_id: currentUser.id,
        content: content.trim(),
      });
      if (error) throw error;
      setContent("");
      await fetchDiscussion();
    } catch (error: any) {
      alert(`[ERROR] 토론 댓글 등록 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ LOADING_DAILY_DISCUSSION... ]</div>;
  }

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-2 md:px-0 pb-24 text-green-500">
      <div className="border-b-4 border-green-500 pb-4 mb-8">
        <div className="text-[10px] md:text-xs text-green-700 tracking-widest font-bold mb-2">&gt; TODAY: {today} / ONE_REPLY_PER_USER</div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">[ TODAY_DISCUSSION ]</h1>
      </div>

      {!topic ? (
        <div className="border-2 border-green-900 bg-black p-8 text-center">
          <div className="text-xl font-bold text-green-700 mb-3">[ NO_TOPIC_REGISTERED ]</div>
          <p className="text-sm text-green-800 leading-relaxed">
            오늘 날짜의 토론 주제가 아직 등록되지 않았습니다.<br />
            관리자는 Supabase SQL Editor에서 daily_discussion_topics에 오늘 날짜 주제를 미리 추가하십시오.
          </p>
        </div>
      ) : (
        <>
          <section className="border-2 border-green-500 bg-green-950/10 p-5 md:p-7 mb-8 shadow-[0_0_20px_rgba(34,197,94,0.12)]">
            <div className="text-[10px] text-green-700 tracking-widest font-bold mb-3">:: DAILY_TOPIC_PACKET ::</div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-300 leading-snug mb-4">{topic.title}</h2>
            {topic.body && <p className="text-sm md:text-base text-green-400 whitespace-pre-wrap leading-relaxed border-t border-green-900 pt-4">{topic.body}</p>}
          </section>

          <section className="mb-8">
            <div className="flex justify-between items-end border-b border-green-900 pb-2 mb-4">
              <h3 className="text-xl font-bold tracking-tighter">&gt; RESPONSES</h3>
              <span className="text-xs text-green-700 font-bold">COUNT: {comments.length}</span>
            </div>

            <div className="flex flex-col gap-3">
              {comments.length === 0 ? (
                <div className="border border-green-900 p-8 text-center text-green-900 font-bold tracking-widest">NO_RESPONSES_YET</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={`border p-4 bg-black ${comment.user_id === currentUser?.id ? "border-green-400" : "border-green-900"}`}>
                    <div className="flex justify-between items-center text-[10px] md:text-xs mb-2 font-bold tracking-widest">
                      <span className={comment.user_id === currentUser?.id ? "text-green-300" : "text-green-700"}>@{comment.nickname}</span>
                      <span className="text-green-900">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-green-400 whitespace-pre-wrap leading-relaxed text-sm md:text-base">{comment.content}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="border-2 border-green-900 bg-black p-4 md:p-5">
            {myComment ? (
              <div className="text-center text-green-700 font-bold tracking-widest py-4">
                [ SUBMISSION_LOCKED ] 오늘의 토론에는 이미 참여했습니다.
              </div>
            ) : !canWrite ? (
              <div className="text-center text-red-500 font-bold tracking-widest py-4">
                [ READ_ONLY ] 승인 완료 유저만 1회 댓글을 작성할 수 있습니다.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={600}
                  className="w-full h-32 bg-green-950/10 border border-green-800 text-green-300 p-3 outline-none resize-none focus:border-green-400 font-bold leading-relaxed"
                  placeholder="> 오늘의 주제에 대한 의견을 입력하십시오. 1인 1회만 등록됩니다."
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-green-800 font-bold">{content.length}/600</span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="border-2 border-green-500 bg-black px-6 py-2 text-green-400 hover:bg-green-500 hover:text-black disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-green-400 font-bold tracking-widest transition-none"
                  >
                    {isSubmitting ? "[ SENDING... ]" : "[ SUBMIT_RESPONSE ]"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
