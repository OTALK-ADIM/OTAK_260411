import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function OpenChatRoom() {
  const [, params] = useRoute("/open-chat/:roomId");
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchAll = async () => {
    if (!params?.roomId) return;
    
    // 1. 방 정보와 참여자 수
    const { data: room } = await supabase.from("open_chats").select(`*, open_chat_participants(count)`).eq("id", params.roomId).maybeSingle();
    if (!room) return setLocation("/chat-list");
    setRoomInfo({ ...room, memberCount: room.open_chat_participants[0]?.count || 0 });

    // 2. 메시지 (작성자 닉네임 포함)
    const { data: msgs } = await supabase.from("open_chat_messages").select("*").eq("room_id", params.roomId).order("created_at", { ascending: true });
    if (msgs) {
      const userIds = [...new Set(msgs.map(m => m.sender_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
      const profilesMap = profiles?.reduce((acc, p) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
      setMessages(msgs.map(m => ({ ...m, nickname: profilesMap[m.sender_id] || "UNKNOWN" })));
    }
    
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLocation("/login");
      setCurrentUser(user);

      // 참여자로 등록 (이미 있으면 무시)
      await supabase.from("open_chat_participants").upsert({ room_id: params?.roomId, user_id: user.id });
      
      fetchAll();
    };
    init();
  }, [params?.roomId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const { error } = await supabase.from("open_chat_messages").insert({
      room_id: params?.roomId,
      sender_id: currentUser.id,
      content: newMessage
    });
    if (!error) { setNewMessage(""); fetchAll(); }
  };

  if (!roomInfo) return <div className="text-blue-500 animate-pulse p-10 font-mono text-center text-xl">[ JOINING_PUBLIC_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-blue-500 h-[85vh]">
      <div className="w-full border-b-4 border-blue-500 bg-black pb-4 mb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-xs md:text-sm tracking-widest text-blue-800 mb-1">&gt; PUBLIC_CHANNEL_CONNECTED</span>
          <span className="text-2xl md:text-4xl font-bold text-blue-400">{roomInfo.name} <span className="text-lg opacity-50 ml-2">({roomInfo.memberCount} 온라인)</span></span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLocation("/chat-list")} className="border-2 border-blue-500 px-4 py-2 text-xs md:text-base hover:bg-blue-500 hover:text-black font-bold transition-none">LEAVE</button>
        </div>
      </div>

      <div className="flex-grow border-2 border-blue-900 bg-black p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-blue-900 mb-1">{msg.nickname} | {new Date(msg.created_at).toLocaleTimeString()}</span>
              <div className={`max-w-[85%] border-2 p-3 text-base md:text-lg ${isMe ? "border-blue-500 bg-blue-950/20 text-blue-300" : "border-blue-800 bg-black text-blue-500"}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex flex-col md:flex-row gap-4 shrink-0 mt-6">
        <textarea 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="[ 공용 통신망 메시지 입력... ]"
          className="flex-grow bg-black border-2 border-blue-500 text-blue-400 p-4 text-lg outline-none placeholder:text-blue-900/50 resize-none h-24 md:h-32"
        />
        <button type="submit" className="border-2 border-blue-500 bg-blue-900/30 text-blue-400 px-8 py-4 font-bold text-xl md:text-2xl hover:bg-blue-500 hover:text-black transition-none">SEND</button>
      </form>
    </div>
  );
}