import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [openChats, setOpenChats] = useState<any[]>([]); // 오픈 톡방
  const [sortBy, setSortBy] = useState("latest"); // 정렬 기준
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
        return { ...room, otherNickname: profile?.nickname || "UNKNOWN" };
      }));
      setPendingRequests(enriched.filter(r => r.status === 'PENDING' && r.user2_id === user.id));
      setActiveChats(enriched.filter(r => r.status === 'ACCEPTED'));
    }

    // 2. 오픈 톡방 목록 가져오기 (인원수 포함)
    const { data: rooms } = await supabase.from("open_chats").select(`
      *,
      open_chat_participants(count)
    `);

    if (rooms) {
      const formattedRooms = rooms.map(r => ({
        ...r,
        memberCount: r.open_chat_participants[0]?.count || 0
      }));
      
      // 정렬 로직 적용
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

  const handleCreateOpenChat = async () => {
    const name = prompt("[시스템] 생성할 오픈 통신망의 이름을 입력하십시오.");
    if (!name?.trim()) return;

    const { data, error } = await supabase.from("open_chats").insert({
      name,
      creator_id: currentUser.id
    }).select().single();

    if (data) {
      // 생성자 자동 참여
      await supabase.from("open_chat_participants").insert({ room_id: data.id, user_id: currentUser.id });
      setLocation(`/open-chat/${data.id}`);
    }
  };

  if (loading) return <div className="text-green-500 animate-pulse p-10 font-mono text-center text-xl md:text-2xl">[ SCANNING_ALL_CHANNELS... ]</div>;

  return (
    <div className="w-full flex flex-col font-mono mt-4 md:mt-8 px-4 md:px-0 text-green-500 pb-20">
      
      <div className="w-full border-b-4 border-dashed border-green-900 pb-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest">[ COMMUNICATION_CENTER ]</h2>
      </div>

      {/* 1. 개인 대화 섹션 (생략 - 기존 DM 로직 유지) */}
      <section className="mb-20">
        <h3 className="text-xl font-bold mb-4 text-green-700 uppercase tracking-tighter">&gt; PRIVATE_DM_CHANNELS</h3>
        {/* ...기존의 PENDING_REQUESTS와 ACTIVE_CHANNELS 코드를 여기에 유지... */}
      </section>

      {/* 2. 오픈 톡방 섹션 (신규) */}
      <section className="flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-2xl md:text-3xl font-bold tracking-widest text-blue-500">
            &gt; PUBLIC_OPEN_CHANNELS
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            {/* 정렬 필터 */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border border-blue-900 text-blue-500 text-xs p-2 outline-none"
            >
              <option value="latest">최신순</option>
              <option value="members">인원순</option>
              <option value="name">가나다순</option>
            </select>
            <button 
              onClick={handleCreateOpenChat}
              className="flex-grow md:flex-none border-2 border-blue-500 bg-blue-950/20 text-blue-400 px-4 py-2 font-bold hover:bg-blue-500 hover:text-black transition-none"
            >
              [ + 신규 통신망 개설 ]
            </button>
          </div>
        </div>

        <div className="border-2 border-blue-900 bg-black min-h-[40vh]">
          {openChats.length === 0 ? (
            <div className="p-20 text-center text-blue-900 font-bold tracking-widest">NO_OPEN_CHANNELS_ACTIVE</div>
          ) : (
            openChats.map(room => (
              <div 
                key={room.id} 
                onClick={() => setLocation(`/open-chat/${room.id}`)}
                className="flex justify-between items-center border-b border-blue-900 p-6 md:p-8 hover:bg-blue-500 hover:text-black cursor-pointer group transition-none"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-2xl md:text-4xl font-bold text-blue-400 group-hover:text-black">{room.name}</div>
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
            ))
          )}
        </div>
      </section>
    </div>
  );
}