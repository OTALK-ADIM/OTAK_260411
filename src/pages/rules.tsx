import { useLocation } from "wouter";

export default function Rules() {
  const [, setLocation] = useLocation();
  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold">[ PROTOCOL ]</div>
      <div className="bg-[#0a0a0a] p-6 border border-green-500/50 text-sm leading-relaxed">
        <p className="mb-4 text-green-400 font-bold">1. 입국 심사 프로토콜</p>
        <p className="mb-4 opacity-70">신규 유저는 프로필 등록 후 관리자 승인을 받아야 글쓰기, 댓글, DM, 오픈채팅 기능을 사용할 수 있습니다.</p>
        <p className="mb-4 text-green-400 font-bold">2. 기록 관리의 법칙</p>
        <p className="mb-4 opacity-70">작성자는 자신의 게시글과 댓글을 삭제할 수 있으며, 운영자는 커뮤니티 안전을 위해 부적절한 기록을 삭제하거나 유저 권한을 제한할 수 있습니다.</p>
        <p className="mb-4 text-green-400 font-bold">3. 상호 통신 보안</p>
        <p className="mb-4 opacity-70">개인 DM은 상대의 승인이 있어야 활성화됩니다. 승인되지 않은 유저는 통신 기능에 접근할 수 없습니다.</p>
      </div>
      <button onClick={() => setLocation("/")} className="border border-green-500 py-2 hover:bg-green-500 hover:text-black">[ 확인 ]</button>
    </div>
  );
}
