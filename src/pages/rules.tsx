import { useLocation } from "wouter";

export default function Rules() {
  const [, setLocation] = useLocation();
  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold">[ PROTOCOL ]</div>
      <div className="bg-[#0a0a0a] p-6 border border-green-500/50 text-sm leading-relaxed">
        <p className="mb-4 text-green-400 font-bold">1. 기록 보존의 법칙</p>
        <p className="mb-4 opacity-70">모든 댓글과 게시글은 영구 보존되며 삭제할 수 없습니다.</p>
        <p className="mb-4 text-green-400 font-bold">2. 상호 통신 보안</p>
        <p className="mb-4 opacity-70">개인 DM은 상대의 승인이 있어야 활성화됩니다.</p>
      </div>
      <button onClick={() => setLocation("/")} className="border border-green-500 py-2 hover:bg-green-500 hover:text-black">[ 확인 ]</button>
    </div>
  );
}