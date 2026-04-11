import { useState } from "react";
import { useLocation } from "wouter";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignup = () => {
    if (!userId.trim() || !password.trim() || !nickname.trim()) {
      alert("[시스템 경고] 모든 정보를 입력해 주십시오.");
      return;
    }

    // 기존 유저 데이터 가져오기 (없으면 빈 배열)
    const existingUsers = JSON.parse(localStorage.getItem("nerd_users") || "[]");

    // 아이디 중복 검사
    if (existingUsers.some((u: any) => u.id === userId)) {
      alert("[시스템 경고] 이미 존재하는 아이디입니다.");
      return;
    }

    // 새 유저 등록
    const newUser = { id: userId, password, nickname };
    existingUsers.push(newUser);
    localStorage.setItem("nerd_users", JSON.stringify(existingUsers));

    alert(`[시스템] 환영합니다, ${nickname}님. 회원가입이 완료되었습니다.`);
    setLocation("/login"); // 가입 완료 후 로그인 페이지로 이동
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 max-w-sm mx-auto">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold tracking-widest text-xl">
        [ 신 규 요 원 등 록 ]
      </div>

      <div className="flex flex-col gap-4 bg-[#0a0a0a] p-6 border border-green-500/50">
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70 font-mono">ID</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70 font-mono">PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70 font-mono">NICKNAME (CODENAME)</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-mono" />
        </div>
      </div>

      <div className="flex justify-between mt-2">
        <button onClick={() => setLocation("/")} className="border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors">
          [ 취소 ]
        </button>
        <button onClick={handleSignup} className="bg-green-500 text-black px-4 py-1 font-bold hover:bg-green-400 transition-colors">
          [ 등 록 ]
        </button>
      </div>
    </div>
  );
}