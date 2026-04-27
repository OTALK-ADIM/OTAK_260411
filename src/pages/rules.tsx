import { useLocation } from "wouter";

export default function Rules() {
  const [, setLocation] = useLocation();
  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold">[ PROTOCOL ]</div>
      <div className="bg-[#0a0a0a] p-6 border border-green-500/50 text-sm leading-relaxed">
        <p className="mb-4 text-green-400 font-bold">1. 읽기 권한</p>
        <p className="mb-4 opacity-70">입국 심사 중인 사용자는 피드와 게시글을 열람할 수 있습니다. 글쓰기, 댓글, 채팅 등 활동 기능은 관리자 승인 후 사용할 수 있습니다.</p>

        <p className="mb-4 text-green-400 font-bold">2. 게시글/댓글 관리</p>
        <p className="mb-4 opacity-70">작성자는 자신의 게시글과 댓글을 삭제할 수 있습니다. 운영자는 신고, 권리침해, 커뮤니티 규칙 위반이 확인되는 경우 게시글/댓글을 제한하거나 삭제할 수 있습니다.</p>

        <p className="mb-4 text-green-400 font-bold">3. 상호 통신 보안</p>
        <p className="mb-4 opacity-70">개인 DM은 상대의 승인이 있어야 활성화됩니다. 오픈채팅 및 DM에서도 욕설, 괴롭힘, 불법 행위, 사칭, 광고, 개인정보 유출은 금지됩니다.</p>

        <p className="mb-4 text-green-400 font-bold">4. 저장 기능</p>
        <p className="mb-4 opacity-70">사용자는 마음에 드는 글을 저장할 수 있습니다. 저장 목록은 본인 프로필의 SAVED_TRANSMISSIONS에서 확인할 수 있습니다.</p>

        <p className="mb-4 text-green-400 font-bold">5. 개인정보 및 제재 동의</p>
        <p className="mb-4 opacity-70">회원가입 및 온보딩 과정에서 개인정보 처리방침과 커뮤니티 제재 정책에 동의해야 합니다. 위반 행위가 확인되면 기능 제한, 계정 정지, 입국 심사 거절 등의 조치가 적용될 수 있습니다.</p>
      </div>
      <button onClick={() => setLocation("/")} className="border border-green-500 py-2 hover:bg-green-500 hover:text-black">[ 확인 ]</button>
    </div>
  );
}
