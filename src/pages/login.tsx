import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const existingUsers = JSON.parse(localStorage.getItem("nerd_users") || "[]");
    
    // 아이디와 비밀번호가 일치하는 유저 찾기
    const user = existingUsers.find((u: any) => u.id === userId && u.password === password);

    if (user) {
      // 💡 로그인 성공! '현재 접속 중인 유저' 메모장에 기록
      localStorage.setItem("currentUser", JSON.stringify({ id: user.id, nickname: user.nickname }));
      alert(`[시스템] 접속 승인. 환영합니다, ${user.nickname}님.`);
      setLocation("/"); // 메인 화면으로 이동
    } else {
      alert("[시스템 경고] 아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 max-w-sm mx-auto">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold tracking-widest text-xl">
        [ 시 스 템 로 그 인 ]
      </div>

      <div className="flex flex-col gap-4 bg-[#0a0a0a] p-6 border border-green-500/50">
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70 font-mono">ID</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70 font-mono">PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="bg-transparent border border-green-500 text-green-500 p-2 focus:outline-none font-mono" />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <button onClick={handleLogin} className="w-full bg-green-500 text-black px-4 py-2 font-bold hover:bg-green-400 transition-colors text-lg">
          [ 접 속 (LOGIN) ]
        </button>
        <div className="flex justify-between text-xs opacity-70">
          <button onClick={() => setLocation("/")} className="hover:text-green-300">{"< 메인으로"}</button>
          <button onClick={() => setLocation("/signup")} className="hover:text-green-300">{"신규 요원 등록 >"}</button>
        </div>
      </div>
    </div>
  );
}