import { useState } from "react";
import { useParams } from "wouter";

export default function ChatRoom() {
  const { id } = useParams();
  const [showProfile, setShowProfile] = useState<string | null>(null);

  const mockMessages = [
    { id: 1, user: "Luna", text: "이번 프로젝트 같이 하실래요?" },
    { id: 2, user: "익명K", text: "조건이 어떻게 되죠?" },
  ];

  return (
    <div className="w-full flex flex-col h-[70vh] relative">
      <div className="border-b border-green-500 p-2 flex justify-between font-mono text-xs">
        <span>CHANNEL: {id}</span>
        <span className="text-green-400 animate-pulse">● ONLINE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {mockMessages.map(m => (
          <div key={m.id} className="flex flex-col items-start">
            {/* 💡 닉네임 클릭 시 프로필 보기 */}
            <button 
              onClick={() => setShowProfile(m.user)}
              className="text-[10px] text-green-500 underline mb-1 hover:text-white"
            >
              {m.user}
            </button>
            <div className="bg-green-900/20 border border-green-500/30 p-2 text-sm max-w-[80%] rounded">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* 💡 프로필 모달 (상대 프로필 확인) */}
      {showProfile && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="border-2 border-green-500 p-6 bg-black w-full max-w-xs flex flex-col gap-4 shadow-[0_0_20px_rgba(0,255,0,0.4)]">
            <div className="text-center font-bold border-b border-green-500 pb-2">USER_PROFILE</div>
            <div className="flex flex-col gap-2 text-sm">
              <p><span className="opacity-50">CODENAME:</span> {showProfile}</p>
              <p><span className="opacity-50">LEVEL:</span> 14 (Veteran)</p>
              <p><span className="opacity-50">POSTS:</span> 128</p>
              <p className="italic opacity-70 mt-2 text-xs">"기록은 사라지지 않는다."</p>
            </div>
            <button 
              onClick={() => setShowProfile(null)}
              className="mt-4 bg-green-500 text-black font-bold py-1"
            >
              [ 닫기 ]
            </button>
          </div>
        </div>
      )}

      <div className="p-2 border-t border-green-500 flex gap-2">
        <input type="text" className="flex-1 bg-transparent border border-green-500/50 p-2 text-sm focus:outline-none" placeholder="메시지 입력..." />
        <button className="bg-green-500 text-black px-4 font-bold">[ 전송 ]</button>
      </div>
    </div>
  );
}