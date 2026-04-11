import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (user) {
      setNickname(user.nickname);
      setBio(localStorage.getItem(`bio_${user.nickname}`) || "");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(`bio_${nickname}`, bio);
    alert("[시스템] 프로필이 업데이트되었습니다.");
    setLocation("/");
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      <div className="border-b-2 border-green-500 pb-2 text-center font-bold">[ MY_DATA_EDIT ]</div>
      <div className="bg-[#0a0a0a] p-4 border border-green-500/50 flex flex-col gap-4">
        <div>
          <label className="text-xs opacity-50">CODENAME</label>
          <div className="text-xl font-bold text-green-400">{nickname || "OFFLINE"}</div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-50">BIO / TAGLINE</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="bg-transparent border border-green-500 p-2 text-sm h-32 focus:outline-none" placeholder="자기소개를 입력하세요..." />
        </div>
      </div>
      <button onClick={handleSave} className="bg-green-500 text-black py-2 font-bold hover:bg-green-400">[ 저장 ]</button>
    </div>
  );
}