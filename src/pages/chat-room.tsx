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
  
  // 💡 실시간 온라인 인원수 상태 추가
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = async () => {
    if (!params?.roomId) return;

    // 1. 방 정보 가져오기
    const { data: room } = await supabase.from("open_chats").select("*").eq("id", params.roomId).maybeSingle();
    if (!room) return setLocation("/chat-list");
    setRoomInfo(room);

    // 2. 기존 메시지 불러오기
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

      // 최초 데이터 로드
      await fetchInitialData();

      // 💡 3. Supabase Realtime 채널 연결 (메시지 & 접속자 동시 감지)
      channel = supabase.channel(`room:${params?.roomId}`);

      // [기능 A] 새로운 메시지가 DB에 INSERT 될 때 실시간 감지
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'open_chat_messages', filter: `room_id=eq.${params?.roomId}` },
        async (payload: any) => {
          // 보낸 사람의 닉네임 가져오기
          const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", payload.new.sender_id).maybeSingle();
          const newMsg = { ...payload.new, nickname: profile?.nickname || "UNKNOWN" };

          // 내 화면에 새 메시지 추가
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      );

      // [기능 B] 누군가 들어오거나 나갈 때 (Presence 실시간 감지)
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        // 접속자 수 계산 (채널에 연결된 브라우저 수)
        const count = Object.keys(presenceState).length;
        setOnlineCount(count);
      });

      // 채널 구독 시작 및 내 상태(온라인) 등록
      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id });
        }
      });
    };

    init();

    // 💡 방에서 나갈 때(컴포넌트 언마운트) 연결 끊기 (오프라인 처리)
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [params?.roomId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    // DB에 메시지만 꽂아넣으면, 위에 만들어둔 Realtime 채널이 알아서 화면에 띄워줍니다!
    const msgToSend = newMessage;
    setNewMessage(""); // 입력창 즉시 비우기 (반응성 향상)

    await supabase.from("open_chat_messages").insert({
      room_id: params?.roomId,
      sender_id: currentUser.id,
      content: msgToSend
    });
  };

  if (!roomInfo) return <div className="text-blue-500 animate-pulse p-10 font-mono text-center text-xl">[ JOINING_PUBLIC_CHANNEL... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-2 md:mt-4 px-2 md:px-0 text-blue-500 h-[85vh]">
      
      {/* 헤더 영역 */}
      <div className="w-full border-b-4 border-blue-500 bg-black pb-4 mb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-xs md:text-sm tracking-widest text-blue-800 mb-1">&gt; PUBLIC_CHANNEL_CONNECTED</span>
          <div className="text-2xl md:text-4xl font-bold text-blue-400 flex items-center">
            {roomInfo.name}
            {/* 💡 실시간 접속자 수 (깜빡이는 점으로 라이브 느낌 강조) */}
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

      {/* 메시지 출력 영역 */}
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

      {/* 입력창 */}
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