// src/pages/pending.tsx
export default function Pending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] font-mono text-green-500 p-10 border border-green-900 mx-auto mt-10 max-w-lg">
      <div className="text-4xl mb-4 animate-pulse">⚠️</div>
      <h2 className="text-2xl mb-4">[ ACCESS_PENDING ]</h2>
      <p className="text-center opacity-70 leading-relaxed">
        현재 입국 심사가 진행 중입니다.<br />
        관리자의 승인이 완료될 때까지<br />
        잠시만 기다려 주십시오.
      </p>
      <div className="mt-8 text-[10px] opacity-40 italic">
        SYSTEM_STATUS: WAITING_FOR_ADMIN_APPROVAL...
      </div>
    </div>
  );
}