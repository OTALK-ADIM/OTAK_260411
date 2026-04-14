import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
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

// 🔐 접근 권한 및 라우팅 제어 컴포넌트
function Gatekeeper({ user, loading }: { user: any, loading: boolean }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 세션 정보를 불러오는 중에는 리다이렉션을 실행하지 않음
    if (loading) return;

    const checkAccess = async () => {
      // 1. 비로그인 유저: 메인, 로그인, 회원가입 외의 페이지 접근 시 메인으로 리다이렉트
      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") {
          setLocation("/");
        }
        return;
      }

      // 2. 로그인 유저: 프로필 승인 상태 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        // 프로필 정보가 없는 경우 온보딩으로 이동
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 승인 대기 중인 경우 대기 페이지로 이동
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 모든 승인이 완료된 유저가 입구(메인/로그인)에 있다면 피드로 입장
        if (location === "/" || location === "/login") {
          setLocation("/feed");
        }
      }
    };

    checkAccess();
  }, [user, loading, location, setLocation]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 초기 구동 시 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 실시간 인증 상태 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    // 💡 화면 전체 레이아웃: 가로 늘어짐 방지 및 세로형 프레임 고정
    <div className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[500px] border-x border-green-900/30 min-h-screen flex flex-col p-4 shadow-[0_0_50px_rgba(0,0,0,1)]">
        
        {/* 접속 제어 시스템 구동 */}
        <Gatekeeper user={user} loading={loading} />

        {/* 최상단 고정 배너: 슬로건 크기 축소 반영 */}
        <div className="w-full border border-green-500 py-2 mb-6 shrink-0 bg-black">
          <h2 className="text-center text-green-500 font-bold tracking-[0.4em] text-[10px] md:text-xs">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </h2>
        </div>

        {/* 상태 정보 바 */}
        <div className="w-full flex justify-between items-center text-[10px] mb-4 px-1 opacity-80">
          <div className="flex gap-3">
            <span className="text-green-500 font-bold">SYS: CONNECTED</span>
            <span className={user ? "text-blue-500 font-bold" : "text-green-800 font-bold"}>
              USR: {user ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          {user && (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="border border-green-800 px-2 py-0.5 hover:bg-red-900 hover:text-white transition-all text-[9px]"
            >
              [ LOGOUT ]
            </button>
          )}
        </div>

        {/* 메인 시스템 출력 영역 */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {loading ? (
            <div className="text-green-500 animate-pulse font-bold tracking-[0.2em] text-sm">
              LOADING_CREDENTIALS...
            </div>
          ) : (
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
          )}
        </main>

        {/* 시스템 풋터 */}
        <footer className="mt-auto py-6 text-center text-[9px] text-green-900 tracking-tighter opacity-40">
          V. 1.8.8 - PROTOCOL: NEO_GEEK - STATUS: WAITING_FOR_INPUT...
        </footer>

      </div>
    </div>
  );
}