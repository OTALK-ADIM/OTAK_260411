import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  
  // 약관 동의 상태
  const [consent, setConsent] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      alert("[시스템 경고] 개인정보 수집 및 이용에 동의해야 가입이 완료됩니다.");
      return;
    }

    if (!image) {
      alert("[시스템 경고] 인증 사진 제출은 필수입니다. 본인의 오타쿠 정체성을 증명하십시오.");
      return;
    }
    
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. 이미지 업로드 (Supabase Storage)
    const fileExt = image.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, image);

    if (uploadError) {
      alert("[통신 에러] 이미지 업로드 실패: " + uploadError.message);
      setIsSubmitting(false);
      return;
    }

    // 💡 2. 프로필 DB 저장 (upsert를 사용하여 기존 빈 깡통 행이 있어도 덮어씁니다)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      nickname,
      bio,
      profile_img_url: fileName,
      is_approved: false // 관리자 승인 대기 상태
    });

    if (profileError) {
      alert("[시스템 에러] 프로필 저장 실패: " + profileError.message);
    } else {
      alert("[시스템] 가입이 완료되었습니다. 관리자의 입국 심사를 기다려 주십시오.");
      setLocation("/pending");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full border-b-2 border-green-500 pb-2 mb-6 text-center font-bold text-2xl tracking-widest text-green-400">
        [ 신 규 요 원 등 록 ]
      </div>

      <form onSubmit={handleProfileSubmit} className="w-full flex flex-col gap-8 bg-black border border-green-500 p-8 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
        
        {/* 입력 섹션 */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-green-700 font-bold mb-2">▶ 사용하실 닉네임 (CODENAME)</label>
            <input required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-transparent border-b border-green-500 text-green-400 p-2 text-xl outline-none" placeholder="입력 대기 중..." />
          </div>

          <div>
            <label className="block text-green-700 font-bold mb-2">▶ 본인을 어필할 짧은 자기소개</label>
            <textarea required value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-green-950/20 border border-green-900 p-3 h-24 text-green-400 outline-none leading-relaxed" placeholder="예: 건담 프라모델 조립이 취미입니다." />
          </div>
        </div>

        {/* 사진 업로드 섹션 */}
        <div className="border-2 border-dashed border-green-600 p-6 text-center bg-green-950/10">
          <label className="block text-lg font-bold text-green-500 mb-3 cursor-pointer hover:text-white transition-colors">
            [ 본인의 오타쿠 용품 사진 업로드 (필수) ]
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
          </label>
          {image ? (
            <p className="text-sm text-blue-400 border border-blue-900 inline-block px-4 py-1">FILE_READY: {image.name}</p>
          ) : (
            <p className="text-sm text-red-500 animate-pulse tracking-widest">:: NO IMAGE DATA DETECTED ::</p>
          )}
          <p className="text-xs text-green-800 mt-4 leading-relaxed">
            * 피규어, 굿즈, 포스터 등 본인의 정체성을 증명할 사진을 제출하십시오.<br/>
            (타인의 사진 도용 시 즉각 추방 조치됩니다.)
          </p>
        </div>

        {/* 약관 동의 섹션 (구글 유저도 피해 갈 수 없는 관문) */}
        <div className="border-t border-green-900 pt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} id="privacy" className="w-5 h-5 accent-green-600" />
            <label htmlFor="privacy" className="text-sm text-green-500 cursor-pointer">
              [필수] 시스템 이용 약관 및 개인정보 수집에 동의합니다.
            </label>
            <button type="button" onClick={() => setShowFullText(!showFullText)} className="text-xs text-green-700 underline hover:text-green-400">
              [전문보기]
            </button>
          </div>

          {showFullText && (
            <div className="bg-black border border-green-900 p-4 text-xs leading-loose max-h-40 overflow-y-auto text-green-700 mt-2">
              <span className="font-bold text-green-600">제 1조 (수집 항목)</span><br/>
              - 구글 계정 이메일, 닉네임, 프로필 사진, 자기소개<br/>
              <span className="font-bold text-green-600">제 2조 (이용 목적)</span><br/>
              - 서비스 내 신원 증명 및 커뮤니티 질서 유지<br/>
              <span className="font-bold text-green-600">제 3조 (보유 기간)</span><br/>
              - 회원 탈퇴 또는 서버 포맷 시 즉각 영구 파기
            </div>
          )}
        </div>

        <button disabled={isSubmitting} className="border-2 border-green-500 bg-green-900/30 text-green-400 font-bold text-xl py-4 hover:bg-green-500 hover:text-black transition-all disabled:opacity-50 mt-4 tracking-widest">
          {isSubmitting ? "UPLOADING DATA..." : "[ 등 록 및 심 사 요 청 ]"}
        </button>
      </form>
    </div>
  );
}
