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
              <div className="bg-black border border-green-900 p-3 text-[10px] leading-loose max-h-44 overflow-y-auto text-green-700">
                <p className="font-bold text-green-500 mb-1">개인정보 수집 및 이용 안내</p>
                1. 수집 항목: 이메일 주소, 닉네임, 프로필 이미지, 자기소개, 서비스 이용 기록, 신고 및 제재 이력<br />
                2. 이용 목적: 회원 식별, 로그인, 입국 심사, 커뮤니티 운영, 신고 처리, 부정 이용 방지<br />
                3. 보유 기간: 회원 탈퇴 또는 서비스 종료 시까지 보관하며, 관련 법령 또는 분쟁 대응에 필요한 경우 필요한 기간 동안 보관할 수 있습니다.<br />
                4. 제3자 제공: 법령상 의무가 있는 경우를 제외하고 동의 없이 외부에 제공하지 않습니다.<br />
                5. 동의 거부 권리: 동의를 거부할 수 있으나, 이 경우 회원가입 및 서비스 이용이 제한됩니다.
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
              <div className="bg-black border border-red-900/70 p-3 text-[10px] leading-loose max-h-44 overflow-y-auto text-red-300">
                <p className="font-bold text-red-400 mb-1">커뮤니티 이용 규칙 및 제재 안내</p>
                사용자는 욕설, 모욕, 협박, 불법적인 행위, 타인을 배제하거나 차별하는 행위, 디지털 괴롭힘, 스토킹, 사칭, 도배, 광고, 음란물 또는 타인의 권리를 침해하는 게시물 작성을 하지 않을 것에 동의합니다.<br />
                위반 시 운영자는 사전 통지 없이 게시물/댓글 삭제, 기능 제한, 계정 정지, 강제 탈퇴, 관련 기록 보존 등의 조치를 취할 수 있습니다.<br />
                다른 사용자의 안전과 커뮤니티 질서를 해치는 행위가 확인되면 입국 심사 거절 또는 이용 제한이 적용될 수 있습니다.
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
