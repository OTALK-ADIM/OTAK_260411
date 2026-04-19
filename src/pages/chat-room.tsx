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

      // 1. 방 정보 확인 및 상대방 이름 가져오기
      const { data: room } = await supabase.from("chat_rooms").select("*").eq("id", params?.roomId).maybeSingle();
      if (!room || room.status !== 'ACCEPTED') {
        alert("[보안 경고] 유효하지 않은 통신망입니다.");
        return setLocation("/chat-list");
      }
      
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", otherUserId).maybeSingle();
      setRoomInfo({ ...room, otherNickname: profile?.nickname || "UNKNOWN" });

      // 2. 메시지 가져오기
      fetchMessages();
    };
    initChat();
  }, [params?.roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (!roomInfo) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ CONNECTING_SECURE_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-green-500 h-[80vh]">
      
      {/* 헤더 */}
      <div className="w-full border-2 border-green-500 bg-green-950/20 p-3 mb-4 flex justify-between items-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-green-700">TARGET_NODE</span>
          <span className="text-lg md:text-xl font-bold text-green-400">{roomInfo.otherNickname}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMessages} className="border border-green-500 px-2 py-1 text-[10px] hover:bg-green-500 hover:text-black font-bold transition-none">REFRESH</button>
          <button onClick={() => setLocation("/chat-list")} className="border border-green-500 px-2 py-1 text-[10px] hover:bg-green-500 hover:text-black font-bold transition-none">EXIT</button>
        </div>
      </div>

      {/* 메시지 출력 화면 */}
      <div className="flex-grow border-2 border-green-900 bg-black p-4 overflow-y-auto flex flex-col gap-4 mb-4">
        <div className="text-center text-[10px] text-green-900 border-b border-green-900 pb-2 mb-2">
          -- SECURE_CONNECTION_ESTABLISHED --<br/>
          * WARNING: MESSAGE DELETION IS DISABLED *
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[9px] text-green-800 mb-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
              <div className={`max-w-[80%] border-2 p-3 text-sm md:text-base leading-relaxed break-words ${
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

      {/* 입력창 */}
      <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="SEND_ENCRYPTED_MESSAGE..."
          className="flex-grow bg-black border-2 border-green-500 text-green-400 p-3 text-sm outline-none placeholder:text-green-900"
        />
        <button 
          type="submit"
          className="border-2 border-green-500 bg-green-900/30 text-green-400 px-4 md:px-8 font-bold tracking-widest hover:bg-green-500 hover:text-black transition-none shrink-0"
        >
          SEND
        </button>
      </form>
    </div>
  );
}