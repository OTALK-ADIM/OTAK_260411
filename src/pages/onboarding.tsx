import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("[시스템 경고] 오타쿠 용품 사진 제출은 필수입니다. 정체성을 증명하십시오.");
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

    // 2. 프로필 DB 저장
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      nickname,
      bio,
      profile_img_url: fileName,
      is_approved: false // 관리자 승인 대기 상태
    });

    if (profileError) {
      alert("[시스템 에러] 데이터 저장 실패: " + profileError.message);
    } else {
      alert("[시스템] 데이터 전송 완료. 관리자의 입국 심사를 기다려 주십시오.");
      setLocation("/pending");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold text-xl">
        [ IDENTITY_REGISTRATION ]
      </div>

      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6 bg-[#0a0a0a] p-6 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <div>
          <label className="block text-[10px] text-green-800 mb-1">▶ CODENAME (NICKNAME)</label>
          <input required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-black border-b border-green-500 text-green-500 p-2 outline-none" />
        </div>

        <div>
          <label className="block text-[10px] text-green-800 mb-1">▶ BIO / INTERESTS</label>
          <textarea required value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black border border-green-900 p-2 h-24 text-sm outline-none" />
        </div>

        {/* 📸 오타쿠 용품 사진 업로드 섹션 */}
        <div className="border border-dashed border-green-500/50 p-4 text-center">
          <label className="block text-xs font-bold text-green-400 mb-2 cursor-pointer">
            [ 자신의 오타쿠 용품 사진 업로드 (필수) ]
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
          </label>
          {image ? (
            <p className="text-[10px] text-green-500">READY: {image.name}</p>
          ) : (
            <p className="text-[10px] text-red-900 animate-pulse">NO DATA DETECTED</p>
          )}
          <p className="text-[9px] opacity-40 mt-2">* 굿즈, 피규어, 한정판 등 본인을 증명할 사진을 제출하십시오.</p>
        </div>

        <button disabled={isSubmitting} className="bg-green-500 text-black font-bold py-3 hover:bg-green-400 disabled:opacity-50">
          {isSubmitting ? "[ SENDING_DATA... ]" : "[ 승 인 요 청 ]"}
        </button>
      </form>
    </div>
  );
}
