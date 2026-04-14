import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { supabase } from "./lib/supabase";

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
import Onboarding from "./pages/onboarding";
import Pending from "./pages/pending";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // 💡 로딩 상태 추가
  const [location, setLocation] = useLocation();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // 1. 현재 접속한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user);

      // 2. 로그인 안 했으면 홈/로그인/가입 외엔 접근 차단
      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") {
          setLocation("/");
        }
        setIsLoading(false);
        return;
      }

      // 3. 로그인 유저의 프로필(승인 상태) 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, is_approved")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      // 4. 경로 유효성 검사 (철통 검문)
      if (!profile || !profile.nickname) {
        // 닉네임 없으면 무조건 온보딩으로
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 승인 안 됐으면 무조건 펜딩으로
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인 완료된 유저는 메인/로그인/온보딩에 있을 이유가 없으므로 피드로
        if (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending") {
          setLocation("/feed");
        }
      }

      setIsLoading(false); // 💡 검문 완료 후 로딩 해제
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setLocation("/");
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [location, setLocation]);

  // 💡 검문 중일 때 보여줄 터미널 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-500 animate-pulse text-xl">
          [ SYSTEM_INITIALIZING... ]<br/>
          <span className="text-xs opacity-50 tracking-widest">CHECKING_SECURITY_PROTOCOL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-black text-green-500 font-mono selection:bg-green-500 selection:text-black px-4">
      <div style={{ maxWidth: "768px", width: "100%", margin: "0 auto" }} className="flex flex-col min-h-screen pt-8 pb-10">
        
        {/* 상단 배너 */}
        <div className="border-2 border-green-500 py-3 text-center font-bold tracking-[0.5em] md:tracking-[1em] mb-8 bg-black">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 유저 상태 바 */}
        <div className="flex justify-between items-center text-xs mb-10 border-b border-green-900 pb-4">
          <div className="flex gap-4 items-center">
            <span className="text-green-500 font-bold">SYSTEM: CONNECTED</span>
            <span className={`font-bold ${user ? "text-blue-500" : "text-green-700"}`}>
              USER: {user ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="text-[11px] border border-green-900 px-3 py-1 hover:bg-red-900 hover:text-white transition-all bg-black">
              [ LOGOUT ]
            </button>
          )}
        </div>

        {/* 메인 콘텐츠 영역 (검문 완료된 유저만 여기까지 도달) */}
        <main className="w-full flex-grow flex flex-col items-center">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/feed" component={Feed} />
            <Route path="/profile" component={Profile} />
            <Route path="/write" component={WritePost} />
            <Route path="/chat-list" component={ChatList} />
            <Route path="/chat/:id" component={ChatRoom} />
            <Route path="/post/:id" component={PostDetail} />
            <Route path="/edit/:id" component={PostEdit} />
            <Route path="/admin" component={Admin} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/rules" component={Rules} />
            <Route path="/profile/:userId" component={PublicProfile} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/pending" component={Pending} />
            <Route component={NotFound} />
          </Switch>
        </main>

        <footer className="w-full pt-10 pb-6 text-center text-[10px] text-green-900 opacity-80 mt-auto">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}
