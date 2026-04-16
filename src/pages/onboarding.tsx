import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  
  // 약관 및 보안 동의 상태
  const [consent, setConsent] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 유효성 검사
    if (!consent) {
      alert("[시스템 경고] 개인정보 수집 및 이용 약관에 동의해야 가입이 완료됩니다.");
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

      // 2. 이미지 업로드 (Supabase Storage: profiles 버킷)
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // 3. 프로필 데이터 저장 (upsert를 사용하여 신규/기존 유저 모두 대응)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname,
        bio,
        profile_img_url: fileName,
        is_approved: false // 기본적으로 승인 대기 상태
      });

      if (profileError) throw profileError;

      alert("[시스템] 가입 데이터 전송 완료. 임시 거주증을 발급하여 피드로 진입합니다.");
      
      // 💡 여기서 강제 새로고침하며 피드로 정확히 이동합니다!
      window.location.href = "/feed";

    } catch (error: any) {
      alert(`[시스템 에러] 처리 중 오류 발생: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 타이틀 섹션 */}
      <div className="w-full border-b-2 border-green-500 pb-2 mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-[0.2em] text-green-400">
          [ NEW_USER_REGISTRATION ]
        </h2>
        <p className="text-[10px] opacity-50 mt-1">SECURE_GATEWAY_V1.8.8</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="w-full flex flex-col gap-8 bg-black border border-green-900/50 p-6 md:p-10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
        
        {/* 1. 닉네임 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-green-700 uppercase tracking-widest">
            ▶ CODENAME (NICKNAME)
          </label>
          <input 
            required 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
            className="w-full bg-transparent border-b border-green-500 text-green-400 p-2 text-lg outline-none focus:bg-green-500/5 transition-all" 
            placeholder="사용하실 이름을 입력하십시오..." 
          />
        </div>

        {/* 2. 자기소개 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-green-700 uppercase tracking-widest">
            ▶ BIO / INTERESTS
          </label>
          <textarea 
            required 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            className="w-full bg-green-950/10 border border-green-900 p-3 h-28 text-green-400 outline-none leading-relaxed resize-none focus:border-green-500" 
            placeholder="본인의 오타쿠 활동 분야나 관심사를 적어주십시오." 
          />
        </div>

        {/* 3. 사진 업로드 (필수) */}
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
            <div className="text-[10px] text-blue-400 bg-blue-900/10 px-3 py-1 border border-blue-900/50 uppercase">
              DATA_LOADED: {image.name}
            </div>
          ) : (
            <div className="text-[10px] text-red-900 animate-pulse font-bold tracking-tighter">
              :: NO IMAGE DATA DETECTED ::
            </div>
          )}
          
          <p className="text-[10px] text-green-800 leading-relaxed">
            * 굿즈, 피규어, 전용 장비 등 본인을 증명할 사진을 제출하십시오.<br/>
            (심사 거절 시 활동이 불가능할 수 있습니다.)
          </p>
        </div>

        {/* 4. 약관 동의 */}
        <div className="border-t border-green-900/50 pt-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={consent} 
              onChange={(e) => setConsent(e.target.checked)} 
              id="consent" 
              className="w-4 h-4 accent-green-600 bg-black border-green-900" 
            />
            <label htmlFor="consent" className="text-xs text-green-600 cursor-pointer hover:text-green-400 transition-colors">
              개인정보 수집 및 이용 약관에 동의합니다 (필수)
            </label>
            <button 
              type="button" 
              onClick={() => setShowFullText(!showFullText)} 
              className="text-[10px] text-green-800 underline hover:text-green-500 ml-auto"
            >
              [전문보기]
            </button>
          </div>

          {showFullText && (
            <div className="mt-3 bg-black border border-green-900 p-3 text-[10px] leading-loose text-green-800 max-h-32 overflow-y-auto">
              <p className="font-bold text-green-600 mb-1">제 1조 (수집 항목)</p>
              - 닉네임, 프로필 사진, 자기소개, 계정 정보<br/>
              <p className="font-bold text-green-600 mb-1 mt-2">제 2조 (이용 목적)</p>
              - 유저 식별 및 입국 승인 심사, 커뮤니티 관리<br/>
              <p className="font-bold text-green-600 mb-1 mt-2">제 3조 (보유 및 파기)</p>
              - 회원 탈퇴 시 즉시 파기하거나 서버 포맷 시 삭제됨
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button 
          disabled={isSubmitting} 
          className="w-full border-2 border-green-500 bg-green-900/20 text-green-400 font-bold text-lg py-4 hover:bg-green-500 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed tracking-[0.3em]"
        >
          {isSubmitting ? "DATA_TRANSMITTING..." : "[ REGISTRATION_CONFIRM ]"}
        </button>
      </form>
    </div>
  );
}
