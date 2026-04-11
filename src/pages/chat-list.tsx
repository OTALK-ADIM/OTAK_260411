import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 가상의 채팅방 데이터 (단체방 + 개인 DM)
  const [rooms, setRooms] = useState([
    { id: "group-01", type: "GROUP", name: "광장 (Global Feed)", status: "ACTIVE", lastMsg: "환영합니다!" },
    { id: "dm-01", type: "DM", name: "루나(Luna)", status: "PENDING", lastMsg: "통신 요청을 보냈습니다." },
    { id: "dm-02", type: "DM", name: "익명K", status: "ACTIVE", lastMsg: "확인했습니다." },
  ]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const handleAccept = (roomId: string) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, status: "ACTIVE" } : r));
    alert("[시스템] 통신 채널이 활성화되었습니다.");
  };

  if (!currentUser) return <div className="p-10 text-center text-red-500">[접속 거부] 로그인이 필요한 서비스입니다.</div>;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="border-b-2 border-green-500 pb-2 mb-2 text-center font-bold tracking-widest">[ COMMS_CENTER ]</div>

      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="border border-green-500/50 p-4 bg-black flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1 border ${room.type === 'GROUP' ? 'border-blue-500 text-blue-500' : 'border-purple-500 text-purple-500'}`}>
                  {room.type}
                </span>
                <span className="font-bold">{room.name}</span>
              </div>
              <p className="text-xs opacity-50 truncate w-48">{room.lastMsg}</p>
            </div>

            <div className="flex gap-2">
              {room.status === "PENDING" ? (
                <button 
                  onClick={() => handleAccept(room.id)}
                  className="bg-green-500 text-black px-2 py-1 text-xs font-bold hover:bg-green-400"
                >
                  [ 승낙 ]
                </button>
              ) : (
                <button 
                  onClick={() => setLocation(`/chat/${room.id}`)}
                  className="border border-green-500 px-2 py-1 text-xs hover:bg-green-500 hover:text-black"
                >
                  [ 접속 ]
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}