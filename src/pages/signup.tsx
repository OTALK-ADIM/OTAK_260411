import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [conductConsent, setConductConsent] = useState(false);
  const [showPrivacyText, setShowPrivacyText] = useState(false);
  const [showConductText, setShowConductText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyConsent) {
      alert("[시스템 경고] 개인정보 수집 및 이용 약관에 동의해야 가입이 가능합니다.");
      return;
    }

    if (!conductConsent) {
      alert("[시스템 경고] 커뮤니티 이용 규칙 및 제재 정책에 동의해야 가입이 가능합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      alert("[시스템] 계정 생성 완료. 프로필 등록 단계로 이동합니다.");
      setLocation("/onboarding");
    } catch (error: any) {
      alert(`[통신 에러] 가입 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold text-xl">
        [ NEW_USER_REGISTRATION ]
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-6 bg-[#0a0a0a] p-6 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-green-700 font-bold tracking-widest">EMAIL_ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black border border-green-500 text-green-300 placeholder:text-green-900 caret-green-300 p-2 focus:outline-none focus:bg-green-950/20 font-bold rounded-none"
            placeholder="your@email.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-green-700 font-bold tracking-widest">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black border border-green-500 text-green-300 placeholder:text-green-900 caret-green-300 p-2 focus:outline-none focus:bg-green-950/20 font-bold rounded-none"
            placeholder="password"
          />
        </div>

        <div className="border-t border-green-900/50 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                id="privacy-check"
                className="accent-green-500 w-4 h-4 mt-[2px] shrink-0"
              />
              <label htmlFor="privacy-check" className="text-xs text-green-400 leading-relaxed cursor-pointer">
                개인정보 수집 및 이용에 동의합니다. (필수)
              </label>
              <button
                type="button"
                onClick={() => setShowPrivacyText(!showPrivacyText)}
                className="text-[10px] underline text-green-700 hover:text-green-400 ml-auto shrink-0"
              >
                [전문보기]
              </button>
            </div>

            {showPrivacyText && (
              <div className="bg-black border border-green-900 p-3 text-[10px] leading-loose max-h-80 overflow-y-auto text-green-700">
                <p className="font-bold text-green-400 mb-2">개인정보 처리방침 및 수집·이용 동의</p>
                <p className="mb-2">본 서비스는 「개인정보 보호법」 등 대한민국 개인정보 관련 법령에 따라 이용자의 개인정보를 적법하고 안전하게 처리하기 위해 다음 내용을 고지합니다.</p>
                <p className="font-bold text-green-500 mt-3">1. 개인정보 처리자</p>
                서비스명: OTALK<br />
                운영자: 서비스 관리자<br />
                개인정보 보호책임자/문의처: [관리자 이메일 또는 문의 채널 입력]<br />
                <p className="font-bold text-green-500 mt-3">2. 수집하는 개인정보 항목</p>
                필수: 이메일 주소, 닉네임, 프로필 이미지, 자기소개, 회원 식별자, 가입·로그인 기록, 게시글·댓글·채팅 등 이용자가 작성한 콘텐츠, 서비스 이용 기록, 신고·제재·승인 심사 기록<br />
                자동 생성 가능 정보: 접속 일시, 브라우저/기기 정보, 오류 로그, 보안 관련 로그<br />
                선택: 사용자가 프로필 또는 게시물에 자발적으로 입력하는 관심사, 소개 문구 등<br />
                <p className="font-bold text-green-500 mt-3">3. 개인정보 처리 목적</p>
                회원 식별 및 로그인, 입국 심사/승인 관리, 커뮤니티 게시판·댓글·채팅 기능 제공, 알림 제공, 신고 처리 및 분쟁 대응, 불법·부정 이용 방지, 서비스 안정성 및 보안 유지, 고객 문의 응대에 이용합니다.<br />
                <p className="font-bold text-green-500 mt-3">4. 보유 및 이용 기간</p>
                회원 탈퇴 또는 서비스 종료 시까지 보관합니다. 단, 관계 법령상 보존 의무가 있거나 분쟁·신고·제재 이력 확인, 부정 이용 방지, 권리침해 대응에 필요한 경우 해당 목적 달성에 필요한 범위에서 일정 기간 보관할 수 있습니다.<br />
                <p className="font-bold text-green-500 mt-3">5. 제3자 제공</p>
                운영자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 동의한 경우, 법령에 특별한 규정이 있는 경우, 수사기관·법원 등 적법한 권한을 가진 기관의 요청이 있는 경우 필요한 범위에서 제공할 수 있습니다.<br />
                <p className="font-bold text-green-500 mt-3">6. 개인정보 처리 위탁 및 인프라</p>
                서비스 제공을 위해 Supabase(인증, 데이터베이스, 스토리지), Vercel(웹 호스팅/배포) 등 클라우드 인프라를 사용할 수 있습니다. 실제 서버 리전과 보관 위치는 프로젝트 설정에 따라 달라질 수 있으며, 운영자는 필요한 범위에서만 데이터를 처리합니다.<br />
                <p className="font-bold text-green-500 mt-3">7. 파기 절차 및 방법</p>
                보유 목적이 달성되거나 보유 기간이 종료된 개인정보는 복구가 어려운 방법으로 삭제합니다. 전자적 파일은 기술적으로 재생하기 어렵게 삭제하고, 출력물은 분쇄 또는 파쇄합니다.<br />
                <p className="font-bold text-green-500 mt-3">8. 정보주체의 권리</p>
                이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 단, 법령상 보존이 필요한 정보, 다른 이용자의 권리 보호 또는 분쟁 대응에 필요한 정보는 관련 법령과 운영정책에 따라 제한될 수 있습니다.<br />
                <p className="font-bold text-green-500 mt-3">9. 만 14세 미만 아동</p>
                본 서비스는 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 미만 아동의 가입이 확인되는 경우 법정대리인 동의 확인 또는 이용 제한 조치를 할 수 있습니다.<br />
                <p className="font-bold text-green-500 mt-3">10. 자동 수집 장치</p>
                서비스 운영 과정에서 로그인 유지, 보안, 오류 분석 등을 위해 브라우저 저장소, 쿠키 또는 유사 기술을 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 기능 이용이 제한될 수 있습니다.<br />
                <p className="font-bold text-green-500 mt-3">11. 안전성 확보 조치</p>
                운영자는 접근 권한 관리, 인증 기반 접근 제어, 데이터베이스 보안 정책, 저장소 접근 제한, 로그 점검 등 필요한 관리적·기술적 보호조치를 적용합니다.<br />
                <p className="font-bold text-green-500 mt-3">12. 동의 거부 권리</p>
                이용자는 개인정보 수집·이용에 대한 동의를 거부할 수 있습니다. 다만 필수 항목 동의를 거부하는 경우 회원가입, 입국 심사, 게시판·채팅 등 서비스 이용이 제한됩니다.<br />
                <p className="font-bold text-green-500 mt-3">13. 방침 변경</p>
                개인정보 처리방침이 변경되는 경우 서비스 내 공지 또는 별도 화면을 통해 안내합니다.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={conductConsent}
                onChange={(e) => setConductConsent(e.target.checked)}
                id="conduct-check"
                className="accent-green-500 w-4 h-4 mt-[2px] shrink-0"
              />
              <label htmlFor="conduct-check" className="text-xs text-green-400 leading-relaxed cursor-pointer">
                커뮤니티 이용 규칙 및 제재 정책에 동의합니다. (필수)
              </label>
              <button
                type="button"
                onClick={() => setShowConductText(!showConductText)}
                className="text-[10px] underline text-green-700 hover:text-green-400 ml-auto shrink-0"
              >
                [전문보기]
              </button>
            </div>

            {showConductText && (
              <div className="bg-black border border-red-900/70 p-3 text-[10px] leading-loose max-h-80 overflow-y-auto text-red-300">
                <p className="font-bold text-red-400 mb-2">커뮤니티 이용 규칙 및 제재 동의</p>
                <p className="mb-2">이용자는 서비스 이용 중 다음 행위를 하지 않을 것에 동의합니다.</p>
                1. 욕설, 모욕, 협박, 혐오표현, 성희롱, 스토킹, 디지털 괴롭힘<br />
                2. 특정 개인 또는 집단을 배제·차별·조롱하거나 지속적으로 공격하는 행위<br />
                3. 불법 정보, 불법 촬영물, 음란물, 폭력적 콘텐츠, 도박·사기·마약 등 위법 행위와 관련된 콘텐츠 게시 또는 유도<br />
                4. 타인의 개인정보, 사진, 계정, 대화 내용, 신상정보를 무단 공개하거나 유포하는 행위<br />
                5. 사칭, 도배, 광고, 스팸, 악성 링크, 서비스 운영 방해 행위<br />
                6. 타인의 저작권, 초상권, 명예, 사생활 등 권리를 침해하는 행위<br />
                <p className="font-bold text-red-400 mt-3">제재 안내</p>
                위반이 확인되거나 합리적으로 의심되는 경우 운영자는 게시물/댓글/채팅 삭제, 경고, 기능 제한, 입국 심사 거절, 계정 정지, 강제 탈퇴, 신고·제재 기록 보존, 관련 기관 신고 등의 조치를 할 수 있습니다.<br />
                운영상 긴급한 경우 사전 통지 없이 임시 제한 조치를 할 수 있으며, 이용자는 운영자에게 이의 제기 또는 소명을 요청할 수 있습니다.
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 text-black font-bold py-3 hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-[0.2em] rounded-none"
        >
          {isSubmitting ? "[ 계 정 생 성 중... ]" : "[ 계 정 생 성 ]"}
        </button>
      </form>
    </div>
  );
}
