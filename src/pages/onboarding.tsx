import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter"; // 💡 react-router-dom 대신 wouter 사용

export default function Onboarding() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useLocation(); // 💡 wouter의 이동 방식

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("로그인 정보가 없습니다.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      nickname: nickname,
      bio: bio,
      is_approved: false
    });

    if (error) {
      alert("이미 존재하는 닉네임이거나 오류가 발생했습니다: " + error.message);
    } else {
      alert("입국 심사 요청 완료! 관리자의 승인을 기다려주세요.");
      setLocation("/pending"); // 💡 setLocation으로 페이지 이동
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-green-500 font-mono bg-black text-green-500">
      <h2 className="text-lg mb-6">[ IDENTITY_REGISTRATION ]</h2>
      
      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block text-green-800 text-xs mb-1">▶ SET_NICKNAME</label>
          <input 
            required
            placeholder="사용할 이름을 입력하세요"
            className="w-full bg-black border-b border-green-500 text-green-500 outline-none p-1 placeholder:text-green-900"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-green-800 text-xs mb-1">▶ SELF_INTRODUCTION</label>
          <textarea 
            placeholder="자기소개를 간단히 남겨주세요"
            className="w-full bg-black border border-green-900 text-green-500 outline-none p-2 h-24 placeholder:text-green-900"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          disabled={issubmitting}
          className="w-full border border-green-500 text-green-500 py-2 hover:bg-green-500 hover:text-black transition-all font-bold"
        >
          {issubmitting ? "SENDING_DATA..." : "SUBMIT_FOR_APPROVAL"}
        </button>
      </form>
    </div>
  );
}