import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setCurrentUser(user);

    const { data: rooms } = await supabase
      .from("chat_rooms")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!rooms) {
      setLoading(false);
      return;
    }

    const enrichedRooms = await Promise.all(rooms.map(async (room) => {
      const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", otherUserId).maybeSingle();
      return { ...room, otherNickname: profile?.nickname || "UNKNOWN", otherUserId };
    }));

    setPendingRequests(enrichedRooms.filter(r => r.status === 'PENDING' && r.user2_id === user.id));
    setActiveChats(enrichedRooms.filter(r => r.status === 'ACCEPTED'));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleRequest = async (roomId: string, action: 'ACCEPTED' | 'REJECTED') => {
    if (action === 'REJECTED') {
      if (!confirm("요청을 거절하고 파기하시겠습니까?")) return;
      await supabase.from("chat_rooms").delete().eq("id", roomId);
    } else {
      await supabase.from("chat_rooms").update({ status: 'ACCEPTED' }).eq("id", roomId);
    }
    fetchChats();
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center text-xl md:text-2xl">[ SCANNING_NETWORK... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 text-green-500 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest">[ SECURE_COMMS_STATION ]</h2>
      </div>

      <div className="flex flex-col gap-16">
        
        {/* 받은 통신 요청 (크기 확대) */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-widest text-yellow-500 flex items-center">
            <span className="mr-3">&gt;</span> PENDING_REQUESTS
          </h3>
          <div className="border-2 border-yellow-900/50 bg-black">
            {pendingRequests.length === 0 ? (
              <div className="p-10 text-center text-yellow-900/50 text-base md:text-lg font-bold tracking-widest">NO_PENDING_REQUESTS</div>
            ) : (
              pendingRequests.map(room => (
                <div key={room.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-yellow-900/30 p-6 md:p-8 gap-6">
                  <div className="text-yellow-500 font-bold text-2xl md:text-3xl">
                    <span className="text-base md:text-xl text-yellow-700 mr-4">FROM:</span>{room.otherNickname}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => handleRequest(room.id, 'ACCEPTED')} className="flex-1 md:flex-none border-2 border-green-500 bg-green-950/20 text-green-400 px-6 py-4 text-lg md:text-xl hover:bg-green-500 hover:text-black font-bold tracking-widest transition-none">ACCEPT</button>
                    <button onClick={() => handleRequest(room.id, 'REJECTED')} className="flex-1 md:flex-none border-2 border-red-500 bg-red-950/20 text-red-400 px-6 py-4 text-lg md:text-xl hover:bg-red-500 hover:text-white font-bold tracking-widest transition-none">REJECT</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 연결된 통신망 (크기 대폭 확대) */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-widest text-green-500 flex items-center">
            <span className="mr-3">&gt;</span> ACTIVE_CHANNELS
          </h3>
          <div className="border-2 border-green-900 bg-black">
            {activeChats.length === 0 ? (
              <div className="p-12 text-center text-green-900 text-lg md:text-xl font-bold tracking-widest">NO_ACTIVE_CHANNELS</div>
            ) : (
              activeChats.map(room => (
                <div 
                  key={room.id} 
                  onClick={() => setLocation(`/chat/${room.id}`)}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-green-900 p-8 md:p-10 hover:bg-green-500 hover:text-black cursor-pointer group transition-none gap-4"
                >
                  <div className="text-green-400 group-hover:text-black font-bold text-3xl md:text-5xl flex items-center">
                    <span className="text-sm md:text-lg text-green-700 group-hover:text-green-900 mr-4 font-normal">[CONNECTED]</span>
                    {room.otherNickname}
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-green-800 group-hover:text-black tracking-[0.2em]">
                    [ ENTER_CHANNEL &gt; ]
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