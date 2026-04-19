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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!params?.roomId) return;
    const { data } = await supabase.from("chat_messages").select("*").eq("room_id", params.roomId).order("created_at", { ascending: true });
    if (data) setMessages(data);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLocation("/login");
      setCurrentUser(user);

      const { data: room } = await supabase.from("chat_rooms").select("*").eq("id", params?.roomId).maybeSingle();
      if (!room || room.status !== 'ACCEPTED') {
        alert("[보안 경고] 유효하지 않은 통신망입니다.");
        return setLocation("/chat-list");
      }
      
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", otherUserId).maybeSingle();
      setRoomInfo({ ...room, otherNickname: profile?.nickname || "UNKNOWN" });

      fetchMessages();
    };
    initChat();
  }, [params?.roomId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { error } = await supabase.from("chat_messages").insert({
        room_id: params?.roomId,
        sender_id: currentUser.id,
        content: newMessage
      });
      if (error) throw error;
      setNewMessage("");
      fetchMessages();
    } catch (error: any) {
      alert(`[통신 에러] 전송 실패: ${error.message}`);
    }
  };

  // 💡 Enter 키로 메시지 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!roomInfo) return <div className="text-green-500 animate-pulse p-10 font-mono text-center text-xl">[ CONNECTING_SECURE_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-green-500 h-[85vh]">
      
      {/* 헤더 */}
      <div className="w-full border-b-4 border-green-500 bg-black pb-4 mb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-xs md:text-sm tracking-widest text-green-700 mb-1">&gt; TARGET_NODE_CONNECTED</span>
          <span className="text-3xl md:text-5xl font-bold text-green-400">{roomInfo.otherNickname}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchMessages} className="border-2 border-green-500 px-4 py-2 text-sm md:text-base hover:bg-green-500 hover:text-black font-bold transition-none tracking-widest">REFRESH</button>
          <button onClick={() => setLocation("/chat-list")} className="border-2 border-green-500 px-4 py-2 text-sm md:text-base hover:bg-green-500 hover:text-black font-bold transition-none tracking-widest">EXIT</button>
        </div>
      </div>

      {/* 메시지 출력 화면 */}
      <div className="flex-grow border-2 border-green-900 bg-black p-4 md:p-6 overflow-y-auto flex flex-col gap-6">
        <div className="text-center text-xs md:text-sm text-green-900 border-b border-green-900 pb-4 mb-4 tracking-widest">
          -- SECURE_CONNECTION_ESTABLISHED --<br/>
          * WARNING: MESSAGE DELETION IS PERMANENTLY DISABLED *
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[10px] md:text-xs text-green-800 mb-1 font-bold">{new Date(msg.created_at).toLocaleTimeString()}</span>
              <div className={`max-w-[85%] border-2 p-4 text-base md:text-xl leading-relaxed whitespace-pre-wrap break-words ${
                isMe 
                  ? "border-green-500 bg-green-950/20 text-green-400" 
                  : "border-green-800 bg-black text-green-500"
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 💡 큼직해진 입력창 (Textarea) 및 전송 버튼 */}
      <form onSubmit={handleSendMessage} className="flex flex-col md:flex-row gap-4 shrink-0 mt-6">
        <textarea 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="[ 암호화된 메시지 입력... ] (Enter로 전송, Shift+Enter로 줄바꿈)"
          className="flex-grow bg-black border-2 border-green-500 text-green-400 p-4 md:p-6 text-lg md:text-xl outline-none placeholder:text-green-900/50 resize-none h-32 md:h-40 leading-relaxed"
        />
        <button 
          type="submit"
          className="border-2 border-green-500 bg-green-900/30 text-green-400 px-6 py-4 md:px-12 font-bold text-xl md:text-3xl tracking-[0.2em] hover:bg-green-500 hover:text-black transition-none shrink-0"
        >
          [ SEND ]
        </button>
      </form>
    </div>
  );
}