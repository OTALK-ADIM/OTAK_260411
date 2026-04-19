import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]); // 내가 받은 요청
  const [activeChats, setActiveChats] = useState<any[]>([]); // 수락된 채팅방
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setCurrentUser(user);

    // 1. 내가 엮여있는 모든 채팅방 가져오기
    const { data: rooms } = await supabase
      .from("chat_rooms")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!rooms) {
      setLoading(false);
      return;
    }

    // 2. 상대방 프로필(닉네임) 매칭하기
    const enrichedRooms = await Promise.all(rooms.map(async (room) => {
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", otherUserId).maybeSingle();
      return { ...room, otherNickname: profile?.nickname || "UNKNOWN", otherUserId };
    }));

    // 3. 분류 (내가 받은 대기중 요청 vs 활성화된 방)
    setPendingRequests(enrichedRooms.filter(r => r.status === 'PENDING' && r.user2_id === user.id));
    setActiveChats(enrichedRooms.filter(r => r.status === 'ACCEPTED'));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // 💡 수락 / 거절 처리
  const handleRequest = async (roomId: string, action: 'ACCEPTED' | 'REJECTED') => {
    if (action === 'REJECTED') {
      if (!confirm("요청을 거절하고 파기하시겠습니까?")) return;
      await supabase.from("chat_rooms").delete().eq("id", roomId);
    } else {
      await supabase.from("chat_rooms").update({ status: 'ACCEPTED' }).eq("id", roomId);
    }
    fetchChats();
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center">[ SCANNING_NETWORK... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 text-green-500 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest">[ SECURE_COMMS_STATION ]</h2>
      </div>

      <div className="flex flex-col gap-12">
        
        {/* 받은 통신 요청 */}
        <div>
          <h3 className="text-lg font-bold mb-2 tracking-tighter text-yellow-500">
            &gt; PENDING_REQUESTS (대기 중인 요청)
          </h3>
          <div className="border-2 border-yellow-900/50 bg-black">
            {pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-yellow-900/50 text-xs font-bold">NO_PENDING_REQUESTS</div>
            ) : (
              pendingRequests.map(room => (
                <div key={room.id} className="flex justify-between items-center border-b border-yellow-900/30 p-3">
                  <div className="text-yellow-500 font-bold">
                    <span className="text-xs text-yellow-700 mr-2">FROM:</span>{room.otherNickname}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(room.id, 'ACCEPTED')} className="border border-green-500 bg-green-950/20 text-green-400 px-3 py-1 text-xs hover:bg-green-500 hover:text-black font-bold transition-none">수락</button>
                    <button onClick={() => handleRequest(room.id, 'REJECTED')} className="border border-red-500 bg-red-950/20 text-red-400 px-3 py-1 text-xs hover:bg-red-500 hover:text-white font-bold transition-none">거절</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 연결된 통신망 */}
        <div>
          <h3 className="text-lg font-bold mb-2 tracking-tighter text-green-500">
            &gt; ACTIVE_CHANNELS (연결된 통신망)
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {activeChats.length === 0 ? (
              <div className="p-8 text-center text-green-900 text-sm font-bold">NO_ACTIVE_CHANNELS</div>
            ) : (
              activeChats.map(room => (
                <div 
                  key={room.id} 
                  onClick={() => setLocation(`/chat/${room.id}`)}
                  className="flex justify-between items-center border-b border-green-900 p-4 hover:bg-green-500 hover:text-black cursor-pointer group transition-none"
                >
                  <div className="text-green-400 group-hover:text-black font-bold text-lg flex items-center">
                    <span className="text-xs text-green-700 group-hover:text-green-900 mr-3">[CONNECTED]</span>
                    {room.otherNickname}
                  </div>
                  <div className="text-xs text-green-800 group-hover:text-black">
                    ENTER &gt;
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