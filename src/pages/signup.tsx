import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("[시스템 경고] 개인정보 수집 및 이용에 동의해야 가입이 가능합니다.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`[통신 에러] 가입 실패: ${error.message}`);
    } else {
      alert("[시스템] 가입이 승인되었습니다. 프로필 등록 단계로 이동합니다.");
      setLocation("/onboarding");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold text-xl">
        [ NEW_USER_REGISTRATION ]
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-6 bg-[#0a0a0a] p-6 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">EMAIL_ADDRESS</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] opacity-70">PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none" />
        </div>

        {/* 개인정보 동의 영역 */}
        <div className="border-t border-green-900/50 pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} id="privacy-check" className="accent-green-500 w-4 h-4" />
            <label htmlFor="privacy-check" className="text-xs">
              개인정보 수집 및 이용에 동의합니다.
            </label>
            <button type="button" onClick={() => setShowFullText(!showFullText)} className="text-[10px] underline opacity-50 hover:opacity-100">
              [전문보기]
            </button>
          </div>

          {showFullText && (
            <div className="bg-black border border-green-900 p-3 text-[10px] leading-relaxed max-h-32 overflow-y-auto text-green-700">
              제 1조 (수집 항목): 닉네임, 프로필 사진, 자기소개... <br />
              제 2조 (이용 목적): 서비스 내 유저 식별 및 커뮤니티 관리... <br />
              제 3조 (보유 기간): 회원 탈퇴 시 즉시 파기...
            </div>
          )}
        </div>

        <button type="submit" className="bg-green-500 text-black font-bold py-3 hover:bg-green-400 transition-colors">
          [ 계 정 생 성 ]
        </button>
      </form>
    </div>
  );
}
