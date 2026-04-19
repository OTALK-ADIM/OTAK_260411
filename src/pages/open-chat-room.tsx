import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function OpenChatRoom() {
  const [, params] = useRoute("/open-chat/:roomId");
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myNickname, setMyNickname] = useState("UNKNOWN");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = async () => {
    if (!params?.roomId) return;
    const { data: room } = await supabase.from("open_chats").select("*").eq("id", params.roomId).maybeSingle();
    if (!room) return setLocation("/chat-list");
    setRoomInfo(room);

    const { data: msgs } = await supabase.from("open_chat_messages").select("*").eq("room_id", params.roomId).order("created_at", { ascending: true });
    if (msgs && msgs.length > 0) {
      const userIds = [...new Set(msgs.map(m => m.sender_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
      const profilesMap = profiles?.reduce((acc, p) => ({ ...acc, [p.id]: p.nickname }), {}) || {};
      setMessages(msgs.map(m => ({ ...m, nickname: profilesMap[m.sender_id] || "UNKNOWN" })));
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLocation("/login");
      setCurrentUser(user);

      const { data: myProfile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
      if (myProfile) setMyNickname(myProfile.nickname);

      await fetchInitialData();

      // 💡 핵심 해결책: 오픈 톡방 감지기도 시간을 붙여서 매번 새롭게 만듭니다!
      const uniqueRoomChannel = `room:${params?.roomId}-${Date.now()}`;
      channel = supabase.channel(uniqueRoomChannel);

      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'open_chat_messages', filter: `room_id=eq.${params?.roomId}` },
        async (payload: any) => {
          if (payload.new.sender_id === user.id) return;
          const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", payload.new.sender_id).maybeSingle();
          const newMsg = { ...payload.new, nickname: profile?.nickname || "UNKNOWN" };
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      );

      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        setOnlineCount(Object.keys(presenceState).length);
      });

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id });
        }
      });
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [params?.roomId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msgContent = newMessage;
    setNewMessage(""); 

    const tempMsg = {
      id: crypto.randomUUID(),
      room_id: params?.roomId,
      sender_id: currentUser.id,
      content: msgContent,
      created_at: new Date().toISOString(),
      nickname: myNickname
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    await supabase.from("open_chat_messages").insert({
      room_id: params?.roomId,
      sender_id: currentUser.id,
      content: msgContent
    });
  };

  if (!roomInfo) return <div className="text-blue-500 animate-pulse p-10 font-mono text-center text-xl">[ JOINING_PUBLIC_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-blue-500 h-[85vh]">
      <div className="w-full border-b-4 border-blue-500 bg-black pb-4 mb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-xs md:text-sm tracking-widest text-blue-800 mb-1">&gt; PUBLIC_CHANNEL_CONNECTED</span>
          <div className="text-2xl md:text-4xl font-bold text-blue-400 flex items-center">
            {roomInfo.name}
            <span className="text-sm md:text-lg font-bold text-blue-300 ml-4 border border-blue-500 px-3 py-1 bg-blue-900/30 flex items-center gap-2 tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              {onlineCount} ONLINE
            </span>
          </div>
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
              <span className="text-[10px] text-blue-900 mb-1 font-bold tracking-widest">{msg.nickname} | {new Date(msg.created_at).toLocaleTimeString()}</span>
              <div className={`max-w-[85%] border-2 p-3 text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words ${
                isMe ? "border-blue-500 bg-blue-950/20 text-blue-300" : "border-blue-800 bg-black text-blue-500"
              }`}>
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
          placeholder="[ 공용 통신망 메시지 입력... ] (Enter 전송)"
          className="flex-grow bg-black border-2 border-blue-500 text-blue-400 p-4 text-lg outline-none placeholder:text-blue-900/50 resize-none h-24 md:h-32"
        />
        <button type="submit" className="border-2 border-blue-500 bg-blue-900/30 text-blue-400 px-8 py-4 font-bold text-xl md:text-2xl hover:bg-blue-500 hover:text-black transition-none shrink-0">SEND</button>
      </form>
    </div>
  );
}