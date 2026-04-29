import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function ChatRoom() {
  const [, params] = useRoute("/chat/:roomId");
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const fetchMessages = async () => {
    if (!params?.roomId) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", params.roomId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (data) setMessages(data);
    scrollToBottom();
  };

  useEffect(() => {
    let channel: any;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLocation("/login");
      setCurrentUser(user);

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("is_approved, is_suspended")
        .eq("id", user.id)
        .maybeSingle();

      if (myProfile?.is_suspended === true) {
        alert("[시스템] 제재 상태에서는 DM 사용이 제한됩니다.");
        setLocation("/pending");
        return;
      }

      if (myProfile?.is_approved !== true) {
        alert("[시스템] 관리자 승인 후 DM 사용이 가능합니다.");
        setLocation("/pending");
        return;
      }

      const { data: room } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", params?.roomId)
        .maybeSingle();

      const isParticipant = room && (room.user1_id === user.id || room.user2_id === user.id);
      if (!room || room.status !== "ACCEPTED" || !isParticipant) {
        setLocation("/chat-list");
        return;
      }

      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      setOtherUserId(otherUserId);

      const { data: blockData } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", otherUserId)
        .maybeSingle();
      if (blockData) {
        alert("[시스템] 차단한 유저와의 DM은 사용할 수 없습니다.");
        setLocation("/chat-list");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", otherUserId)
        .maybeSingle();
      setRoomInfo({ ...room, otherNickname: profile?.nickname || "UNKNOWN" });

      await fetchMessages();

      const uniqueChannelName = `dm:${params?.roomId}-${Date.now()}`;
      channel = supabase.channel(uniqueChannelName)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${params?.roomId}` }, (payload) => {
          setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          scrollToBottom();
        })
        .subscribe();
    };

    initChat();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [params?.roomId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("chat_messages").insert({
      room_id: params?.roomId,
      sender_id: currentUser.id,
      content: msg
    });

    if (error) {
      alert(`[에러] 메시지 전송 실패: ${error.message}`);
      setNewMessage(msg);
    }
  };


  const handleReportDm = async () => {
    if (!currentUser || !otherUserId || isWorking) return;
    const reason = prompt("DM 신고 사유를 입력하세요. 예: 욕설, 괴롭힘, 불법행위, 광고 등");
    if (!reason?.trim()) return;
    setIsWorking(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: "DM_MESSAGE",
      target_id: String(params?.roomId),
      target_user_id: otherUserId,
      reason: reason.trim(),
      status: "PENDING"
    });
    setIsWorking(false);
    if (error) alert("[ERROR] 신고 접수 실패: " + error.message);
    else alert("[시스템] DM 신고가 접수되었습니다.");
  };

  const handleBlockOtherUser = async () => {
    if (!currentUser || !otherUserId || isWorking) return;
    if (!confirm("이 상대를 차단하고 채팅방 목록으로 이동하시겠습니까?")) return;
    setIsWorking(true);
    const { error } = await supabase.from("user_blocks").insert({ blocker_id: currentUser.id, blocked_id: otherUserId });
    setIsWorking(false);
    if (error) alert("[ERROR] 차단 실패: " + error.message);
    else setLocation("/chat-list");
  };

  if (!roomInfo) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ CONNECTING_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-green-500 h-[85vh]">
      <div className="w-full border-b-4 border-green-500 bg-black pb-4 mb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-xs text-green-700 mb-1">&gt; SECURE_NODE: CONNECTED</span>
          <span className="text-3xl md:text-5xl font-bold text-green-400">{roomInfo.otherNickname}</span>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={handleReportDm} disabled={isWorking} className="border-2 border-red-900 text-red-500 px-3 py-2 text-xs font-bold hover:bg-red-500 hover:text-black disabled:opacity-40 transition-none">REPORT</button>
          <button onClick={handleBlockOtherUser} disabled={isWorking} className="border-2 border-red-900 text-red-500 px-3 py-2 text-xs font-bold hover:bg-red-500 hover:text-black disabled:opacity-40 transition-none">BLOCK</button>
          <button onClick={() => setLocation("/chat-list")} className="border-2 border-green-500 px-4 py-2 text-sm font-bold hover:bg-green-500 hover:text-black transition-none">EXIT</button>
        </div>
      </div>

      <div className="flex-grow border-2 border-green-900 bg-black p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-green-900 mb-1 font-bold tracking-widest">{isMe ? "ME" : roomInfo.otherNickname} | {new Date(msg.created_at).toLocaleTimeString()}</span>
              <div className={`max-w-[85%] border-2 p-3 text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words ${
                isMe ? "border-green-500 bg-green-950/20 text-green-300" : "border-green-800 bg-black text-green-500"
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex flex-col md:flex-row gap-4 shrink-0 mt-6">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="[ 비밀 통신 메시지 입력... ] (Enter 전송)"
          className="flex-grow bg-black border-2 border-green-500 text-green-400 p-4 text-lg outline-none placeholder:text-green-900/50 resize-none h-24 md:h-32"
        />
        <button type="submit" className="border-2 border-green-500 bg-green-950/30 text-green-400 px-8 py-4 font-bold text-xl md:text-2xl hover:bg-green-500 hover:text-black transition-none shrink-0">SEND</button>
      </form>
    </div>
  );
}
