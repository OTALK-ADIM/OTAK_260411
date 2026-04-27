import { useLocation } from "wouter";

export default function Pending() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] font-mono text-green-500 p-10 border border-green-900 mx-auto mt-10 max-w-lg text-center">
      <div className="text-4xl mb-4 animate-pulse">⚠️</div>
      <h2 className="text-2xl mb-4">[ ACCESS_PENDING ]</h2>
      <p className="opacity-70 leading-relaxed">
        현재 입국 심사가 진행 중입니다.<br />
        관리자의 승인이 완료되면<br />
        글쓰기, 댓글, DM, 오픈채팅 기능이 활성화됩니다.
      </p>
      <div className="mt-8 text-[10px] opacity-40 italic">
        SYSTEM_STATUS: WAITING_FOR_ADMIN_APPROVAL...
      </div>
      <button
        onClick={() => setLocation("/profile")}
        className="mt-8 border border-green-500 px-4 py-2 text-xs font-bold hover:bg-green-500 hover:text-black transition-none"
      >
        [ 내 프로필 확인 ]
      </button>
    </div>
  );
}
