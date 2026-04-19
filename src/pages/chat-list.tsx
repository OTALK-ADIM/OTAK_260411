import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [openChats, setOpenChats] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);

  const fetchAllChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setCurrentUser(user);

    // 1. 1:1 DM 채팅방 가져오기
    const { data: dmRooms } = await supabase
      .from("chat_rooms")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (dmRooms) {
      const enriched = await Promise.all(dmRooms.map(async (room) => {
        const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
        const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", otherUserId).maybeSingle();
        return { ...room, otherNickname: profile?.nickname || "UNKNOWN", otherUserId };
      }));
      setPendingRequests(enriched.filter(r => r.status === 'PENDING' && r.user2_id === user.id));
      setActiveChats(enriched.filter(r => r.status === 'ACCEPTED'));
    }

    // 2. 오픈 톡방 목록 가져오기
    const { data: rooms } = await supabase.from("open_chats").select(`
      *,
      open_chat_participants(count)
    `);

    if (rooms) {
      const formattedRooms = rooms.map(r => ({
        ...r,
        memberCount: r.open_chat_participants[0]?.count || 0
      }));
      sortRooms(formattedRooms, sortBy);
    }
    setLoading(false);
  };

  const sortRooms = (rooms: any[], type: string) => {
    let sorted = [...rooms];
    if (type === "latest") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (type === "members") {
      sorted.sort((a, b) => b.memberCount - a.memberCount);
    } else if (type === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
    setOpenChats(sorted);
  };

  useEffect(() => {
    fetchAllChats();
  }, [sortBy]);

  const handleRequest = async (roomId: string, action: 'ACCEPTED' | 'REJECTED') => {
    if (action === 'REJECTED') {
      if (!confirm("요청을 거절하고 파기하시겠습니까?")) return;
      await supabase.from("chat_rooms").delete().eq("id", roomId);
    } else {
      await supabase.from("chat_rooms").update({ status: 'ACCEPTED' }).eq("id", roomId);
    }
    fetchAllChats();
  };

  const handleCreateOpenChat = async () => {
    const name = prompt("[시스템] 생성할 오픈 통신망의 이름을 입력하십시오.");
    if (!name?.trim()) return;

    const { data, error } = await supabase.from("open_chats").insert({
      name,
      creator_id: currentUser.id
    }).select().single();

    if (data) {
      await supabase.from("open_chat_participants").insert({ room_id: data.id, user_id: currentUser.id });
      setLocation(`/open-chat/${data.id}`);
    } else if (error) {
      alert(`[에러] 생성 실패: ${error.message}`);
    }
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center text-xl md:text-2xl">[ SCANNING_ALL_CHANNELS... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 text-green-500 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest">[ COMMUNICATION_CENTER ]</h2>
      </div>

      {/* =========================================
          1. 프라이빗 DM 섹션
      ========================================= */}
      {/* 💡 mb-20 을 주어 아래 퍼블릭 섹션과 시원한 빈 공간(여백)을 만듭니다! */}
      <section className="flex flex-col gap-8 mb-20">
        <h3 className="text-xl md:text-2xl font-bold text-green-700 tracking-tighter uppercase">
          &gt; PRIVATE_DM_CHANNELS
        </h3>

        {/* 1-1. 대기 중인 요청 */}
        <div className="flex flex-col">
          <h4 className="text-lg md:text-xl font-bold mb-2 tracking-widest text-yellow-500 flex items-center">
            <span className="mr-2">&gt;</span> PENDING_REQUESTS
          </h4>
          <div className="border-2 border-yellow-900/50 bg-black min-h-[15vh] flex flex-col">
            {pendingRequests.length === 0 ? (
              <div className="flex-grow flex items-center justify-center p-6 text-center text-yellow-900/50 font-bold tracking-widest">
                [ 대기 중인 요청 없음 ]
              </div>
            ) : (
              <div className="flex flex-col">
                {pendingRequests.map(room => (
                  <div key={room.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-yellow-900/30 p-6 gap-6 hover:bg-yellow-950/20 transition-none">
                    <div className="text-yellow-500 font-bold text-xl md:text-2xl">
                      <span className="text-sm md:text-base text-yellow-700 mr-4">FROM:</span>{room.otherNickname}
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button onClick={() => handleRequest(room.id, 'ACCEPTED')} className="flex-1 md:flex-none border-2 border-green-500 bg-green-950/20 text-green-400 px-6 py-3 text-sm md:text-lg hover:bg-green-500 hover:text-black font-bold tracking-widest transition-none">ACCEPT</button>
                      <button onClick={() => handleRequest(room.id, 'REJECTED')} className="flex-1 md:flex-none border-2 border-red-500 bg-red-950/20 text-red-400 px-6 py-3 text-sm md:text-lg hover:bg-red-500 hover:text-white font-bold tracking-widest transition-none">REJECT</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 1-2. 연결된 1:1 통신망 */}
        <div className="flex flex-col">
          <h4 className="text-lg md:text-xl font-bold mb-2 tracking-widest text-green-500 flex items-center">
            <span className="mr-2">&gt;</span> ACTIVE_CHANNELS
          </h4>
          <div className="border-2 border-green-900 bg-black min-h-[25vh] flex flex-col">
            {activeChats.length === 0 ? (
              <div className="flex-grow flex items-center justify-center p-6 text-center text-green-900 font-bold tracking-widest text-lg">
                [ 연결된 통신망 없음 ]
              </div>
            ) : (
              <div className="flex flex-col">
                {activeChats.map(room => (
                  <div 
                    key={room.id} 
                    onClick={() => setLocation(`/chat/${room.id}`)}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-green-900 p-6 md:p-8 hover:bg-green-500 hover:text-black cursor-pointer group transition-none gap-4"
                  >
                    <div className="text-green-400 group-hover:text-black font-bold text-2xl md:text-3xl flex items-center">
                      <span className="text-xs md:text-sm text-green-700 group-hover:text-green-900 mr-4 font-normal">[CONNECTED]</span>
                      {room.otherNickname}
                    </div>
                    <div className="text-base md:text-xl font-bold text-green-800 group-hover:text-black tracking-[0.2em]">
                      [ ENTER_CHANNEL &gt; ]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          2. 퍼블릭 오픈 톡방 섹션
      ========================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl md:text-2xl font-bold tracking-widest text-blue-500 uppercase">
            &gt; PUBLIC_OPEN_CHANNELS
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border border-blue-900 text-blue-500 text-xs p-2 outline-none font-bold"
            >
              <option value="latest">최신순</option>
              <option value="members">인원순</option>
              <option value="name">가나다순</option>
            </select>
            <button 
              onClick={handleCreateOpenChat}
              className="flex-grow md:flex-none border-2 border-blue-500 bg-blue-950/20 text-blue-400 px-4 py-2 font-bold hover:bg-blue-500 hover:text-black transition-none text-sm md:text-base"
            >
              [ + 신규 오픈망 개설 ]
            </button>
          </div>
        </div>

        <div className="border-2 border-blue-900 bg-black min-h-[30vh] flex flex-col">
          {openChats.length === 0 ? (
            <div className="flex-grow flex items-center justify-center p-10 text-center text-blue-900 font-bold tracking-widest text-lg">
              [ 활성화된 오픈 통신망 없음 ]
            </div>
          ) : (
            <div className="flex flex-col">
              {openChats.map(room => (
                <div 
                  key={room.id} 
                  onClick={() => setLocation(`/open-chat/${room.id}`)}
                  className="flex justify-between items-center border-b border-blue-900 p-6 md:p-8 hover:bg-blue-500 hover:text-black cursor-pointer group transition-none"
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-2xl md:text-3xl font-bold text-blue-400 group-hover:text-black">{room.name}</div>
                    <div className="text-[10px] md:text-xs text-blue-800 group-hover:text-black uppercase tracking-widest">
                      OPENED: {new Date(room.created_at).toLocaleDateString()} | STATUS: UNRESTRICTED
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-4xl font-bold text-blue-700 group-hover:text-black">
                      {room.memberCount}<span className="text-sm ml-1 opacity-50">USERS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}