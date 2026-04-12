import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. 현재 로그인한 구글 유저 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    // 2. profiles 테이블에 닉네임과 자기소개 저장
    const { error } = await supabase.from('profiles').insert({
      id: user.id, // 구글 고유 ID와 연결
      nickname: nickname,
      bio: bio,
      is_approved: false // 💡 중요: 일단 '거절' 상태로 저장 (관리자 승인 필요)
    });

    if (error) {
      alert("이미 존재하는 닉네임이거나 오류가 발생했습니다: " + error.message);
    } else {
      alert("입국 심사 요청 완료! 관리자의 승인을 기다려주세요.");
      navigate("/pending"); // 승인 대기 페이지로 이동
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-green-500 font-mono bg-black">
      <h2 className="text-green-500 text-lg mb-6">[ IDENTITY_REGISTRATION ]</h2>
      
      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block text-green-800 text-xs mb-1">▶ SET_NICKNAME</label>
          <input 
            required
            placeholder="사용할 이름을 입력하세요"
            className="w-full bg-black border-b border-green-500 text-green-500 outline-none p-1"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-green-800 text-xs mb-1">▶ SELF_INTRODUCTION</label>
          <textarea 
            placeholder="자기소개를 간단히 남겨주세요"
            className="w-full bg-black border border-green-900 text-green-500 outline-none p-2 h-24"
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