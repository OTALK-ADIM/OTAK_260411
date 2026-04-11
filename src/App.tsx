import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import Home from "./pages/home";
import Feed from "./pages/feed";
import Profile from "./pages/profile";
import WritePost from "./pages/write-post";
import ChatList from "./pages/chat-list";
import ChatRoom from "./pages/chat-room";
import PostDetail from "./pages/post-detail";
import PostEdit from "./pages/post-edit";
import Admin from "./pages/admin";
import NotFound from "./pages/not-found";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Rules from "./pages/rules";
import PublicProfile from "./pages/public-profile";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

function Gatekeeper() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. 로그인 안 되어 있으면 로그인 페이지로 (단, 가입 절차 중이면 제외)
      if (!user) {
        if (location.pathname !== "/login") navigate("/login");
        return;
      }

      // 2. 로그인 되어 있다면 프로필 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

      // 3. 상황별 리다이렉트
      if (!profile) {
        // 프로필 정보가 없으면 가입 정보 입력창으로
        if (location.pathname !== "/onboarding") navigate("/onboarding");
      } else if (profile.is_approved === false) {
        // 프로필은 있는데 승인이 안 됐으면 대기 창으로
        if (location.pathname !== "/pending") navigate("/pending");
      } else {
        // 모든 관문 통과! (메인으로 가거나 그대로 둠)
        if (location.pathname === "/onboarding" || location.pathname === "/pending") {
          navigate("/");
        }
      }
    };

    checkUser();
  }, [navigate, location.pathname]);

  return null; // 화면에 그리지는 않고 로직만 수행
}

export default function App() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 전역 유저 상태 체크
  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem("currentUser");
      setCurrentUser(user ? JSON.parse(user) : null);
    };
    checkUser();
    window.addEventListener("storage", checkUser); // 다른 창에서 변경 시 대응
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    alert("[시스템] 로그아웃 되었습니다.");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black text-[#00FF00] font-mono p-4 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-xl flex flex-col gap-4">
        
        {/* 💡 복구된 최상단 타이틀 바 */}
        <div className="border-2 border-green-500 p-2 text-center font-bold tracking-[0.5em] text-sm md:text-base mb-2">
          [ 오타쿠가 세상을 지배한다. ]
        </div>

        {/* 💡 유저 상태 및 로그인/로그아웃 (전역 고정) */}
        <div className="flex justify-between items-center text-[10px] md:text-xs border-b border-green-500/50 pb-2 mb-2">
          <div className="flex gap-4">
            <span>SYSTEM: CONNECTED</span>
            {currentUser ? (
              <span className="text-white">USER: <span className="bg-white text-black px-1">[{currentUser.nickname}]</span> ONLINE</span>
            ) : (
              <span className="text-red-500">USER: OFFLINE</span>
            )}
          </div>
          <div>
            {currentUser ? (
              <button onClick={handleLogout} className="border border-green-500 px-2 py-0.5 hover:bg-green-500 hover:text-black">[ 로그아웃 ]</button>
            ) : (
              <button onClick={() => setLocation("/login")} className="border border-green-500 px-2 py-0.5 hover:bg-green-500 hover:text-black">[ 로 그 인 ]</button>
            )}
          </div>
        </div>

        {/* 페이지 전환 영역 */}
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/feed" component={Feed} />
            <Route path="/write" component={WritePost} />
            <Route path="/post/:id" component={PostDetail} />
            <Route path="/edit/:id" component={PostEdit} />
            <Route path="/chat" component={ChatList} />
            <Route path="/chat/:id" component={ChatRoom} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/:userId" component={PublicProfile} />
            <Route path="/admin" component={Admin} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/rules" component={Rules} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/pending" element={<Pending />} />
            <Route component={NotFound} />
          </Switch>
        </main>

        {/* 💡 하단 장식용 푸터 */}
        <div className="mt-8 border-t border-green-500/30 pt-2 text-center text-[10px] opacity-40">
          V. 1.0.0 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </div>
      </div>
    </div>
  );
}