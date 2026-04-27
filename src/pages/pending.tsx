// src/pages/pending.tsx
import { useLocation } from "wouter";

export default function Pending() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] font-mono text-green-500 p-10 border border-green-900 mx-auto mt-10 max-w-lg">
      <div className="text-4xl mb-4 animate-pulse">⚠️</div>
      <h2 className="text-2xl mb-4">[ ACCESS_PENDING ]</h2>
      <p className="text-center opacity-80 leading-relaxed">
        현재 입국 심사가 진행 중입니다.<br />
        승인 전에도 게시글 열람은 가능하지만,<br />
        글쓰기/댓글/채팅은 관리자 승인 후 사용할 수 있습니다.
      </p>
      <button
        onClick={() => setLocation("/feed")}
        className="mt-8 border border-green-500 px-5 py-2 text-sm font-bold hover:bg-green-500 hover:text-black transition-none"
      >
        [ 피드 보러가기 ]
      </button>
      <div className="mt-8 text-[10px] opacity-40 italic">
        SYSTEM_STATUS: WAITING_FOR_ADMIN_APPROVAL...
      </div>
    </div>
  );
}
