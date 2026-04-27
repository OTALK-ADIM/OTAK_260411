import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [conductConsent, setConductConsent] = useState(false);
  const [showPrivacyText, setShowPrivacyText] = useState(false);
  const [showConductText, setShowConductText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyConsent) {
      alert("[시스템 경고] 개인정보 수집 및 이용 약관에 동의해야 가입이 완료됩니다.");
      return;
    }

    if (!conductConsent) {
      alert("[시스템 경고] 커뮤니티 이용 규칙 및 제재 정책에 동의해야 가입이 완료됩니다.");
      return;
    }

    if (!image) {
      alert("[시스템 경고] 인증 사진 제출은 필수입니다. 본인의 오타쿠 정체성을 증명하십시오.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("인증된 유저 정보를 찾을 수 없습니다.");

      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname: nickname.trim(),
        bio: bio.trim(),
        profile_img_url: fileName,
        is_approved: false
      });

      if (profileError) throw profileError;

      alert("[시스템] 가입 데이터 전송 완료. 입국 심사 중에도 피드 열람은 가능합니다.");
      window.location.href = "/feed";

    } catch (error: any) {
      alert(`[시스템 에러] 처리 중 오류 발생: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-mono">
      <div className="w-full border-b-2 border-green-500 pb-2 mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-[0.2em] text-green-400">
          [ NEW_USER_REGISTRATION ]
        </h2>
        <p className="text-[10px] opacity-50 mt-1">SECURE_GATEWAY_V1.9.1</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="w-full flex flex-col gap-8 bg-black border border-green-900/50 p-6 md:p-10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-green-700 uppercase tracking-widest">
            ▶ CODENAME (NICKNAME)
          </label>
          <input
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-black border-b-2 border-green-500 text-green-300 placeholder:text-green-900 caret-green-300 p-2 text-lg outline-none focus:bg-green-950/30 focus:text-green-200 transition-all rounded-none font-bold"
            placeholder="사용하실 이름을 입력하십시오..."
          />
          <p className="text-[10px] text-green-800">* 입력 글자는 초록색으로 표시됩니다.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-green-700 uppercase tracking-widest">
            ▶ BIO / INTERESTS
          </label>
          <textarea
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-green-950/10 border border-green-900 p-3 h-28 text-green-300 placeholder:text-green-900 caret-green-300 outline-none leading-relaxed resize-none focus:border-green-500 rounded-none font-bold"
            placeholder="본인의 오타쿠 활동 분야나 관심사를 적어주십시오."
          />
        </div>

        <div className="border-2 border-dashed border-green-800 p-6 text-center bg-green-950/5 flex flex-col items-center gap-4">
          <label className="w-full cursor-pointer group">
            <span className="text-sm font-bold text-green-500 group-hover:text-white transition-colors">
              [ 자신의 오타쿠 용품 사진 업로드 ]
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {image ? (
            <div className="text-[10px] text-blue-400 bg-blue-900/10 px-3 py-1 border border-blue-900/50 uppercase break-all">
              DATA_LOADED: {image.name}
            </div>
          ) : (
            <div className="text-[10px] text-red-900 animate-pulse font-bold tracking-tighter">
              :: NO IMAGE DATA DETECTED ::
            </div>
          )}

          <p className="text-[10px] text-green-800 leading-relaxed">
            * 굿즈, 피규어, 전용 장비 등 본인을 증명할 사진을 제출하십시오.<br />
            (심사 거절 시 작성/채팅 활동이 제한될 수 있습니다.)
          </p>
        </div>

        <div className="border-t border-green-900/50 pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                id="privacy-consent"
                className="w-4 h-4 mt-[2px] accent-green-600 bg-black border-green-900 rounded-none shrink-0"
              />
              <label htmlFor="privacy-consent" className="text-xs text-green-500 cursor-pointer hover:text-green-300 transition-colors leading-relaxed">
                개인정보 수집 및 이용 약관에 동의합니다. (필수)
              </label>
              <button
                type="button"
                onClick={() => setShowPrivacyText(!showPrivacyText)}
                className="text-[10px] text-green-800 underline hover:text-green-500 ml-auto appearance-none shrink-0"
              >
                [전문보기]
              </button>
            </div>

            {showPrivacyText && (
              <div className="mt-1 bg-black border border-green-900 p-3 text-[10px] leading-loose text-green-700 max-h-44 overflow-y-auto">
                <p className="font-bold text-green-500 mb-1">개인정보 수집 및 이용 안내</p>
                1. 수집 항목: 이메일 주소, 닉네임, 프로필 이미지, 자기소개, 서비스 이용 기록, 신고 및 제재 이력<br />
                2. 이용 목적: 유저 식별, 입국 승인 심사, 커뮤니티 운영, 신고 처리, 부정 이용 방지<br />
                3. 보유 기간: 회원 탈퇴 또는 서비스 종료 시까지 보관하며, 관련 법령 또는 분쟁 대응에 필요한 경우 필요한 기간 동안 보관할 수 있습니다.<br />
                4. 제3자 제공: 법령상 의무가 있는 경우를 제외하고 동의 없이 외부에 제공하지 않습니다.<br />
                5. 동의 거부 권리: 동의를 거부할 수 있으나, 이 경우 회원가입 및 서비스 이용이 제한됩니다.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={conductConsent}
                onChange={(e) => setConductConsent(e.target.checked)}
                id="conduct-consent"
                className="w-4 h-4 mt-[2px] accent-green-600 bg-black border-green-900 rounded-none shrink-0"
              />
              <label htmlFor="conduct-consent" className="text-xs text-green-500 cursor-pointer hover:text-green-300 transition-colors leading-relaxed">
                커뮤니티 이용 규칙 및 제재 정책에 동의합니다. (필수)
              </label>
              <button
                type="button"
                onClick={() => setShowConductText(!showConductText)}
                className="text-[10px] text-green-800 underline hover:text-green-500 ml-auto appearance-none shrink-0"
              >
                [전문보기]
              </button>
            </div>

            {showConductText && (
              <div className="mt-1 bg-black border border-red-900/70 p-3 text-[10px] leading-loose text-red-300 max-h-44 overflow-y-auto">
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
          className="w-full border-2 border-green-500 bg-green-900/20 text-green-400 font-bold text-lg py-4 hover:bg-green-500 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed tracking-[0.3em] appearance-none rounded-none"
        >
          {isSubmitting ? "DATA_TRANSMITTING..." : "[ REGISTRATION_CONFIRM ]"}
        </button>
      </form>
    </div>
  );
}
