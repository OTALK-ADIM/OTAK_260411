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

type AuthState = "LOADING" | "UNAUTH" | "ONBOARDING" | "PENDING" | "APPROVED";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("LOADING");
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();

  // 1. 유저 상태 완벽 스캔
  useEffect(() => {
    const verifyUser = async (sessionUser: any) => {
      if (!sessionUser) {
        setAuthState("UNAUTH");
        return;
      }

      // 프로필 DB 조회 (닉네임 유무 및 승인 여부)
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, is_approved")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!profile || !profile.nickname || profile.nickname.trim() === "") {
        setAuthState("ONBOARDING"); // 닉네임 없으면 무조건 온보딩
      } else if (profile.is_approved === false) {
        setAuthState("PENDING");    // 승인 안 났으면 대기소
      } else {
        setAuthState("APPROVED");   // 완벽히 승인된 유저
      }
    };

    // 사이트 최초 접속 시 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      verifyUser(session?.user ?? null);
    });

    // 구글 로그인 등 상태 변화 발생 시 즉시 재검사
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      verifyUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 2. URL 주소창 강제 고정 (뒤로가기 방지용)
  useEffect(() => {
    if (authState === "LOADING") return;
    if (authState === "UNAUTH" && location !== "/" && location !== "/login" && location !== "/signup") setLocation("/");
    if (authState === "ONBOARDING" && location !== "/onboarding") setLocation("/onboarding");
    if (authState === "PENDING" && location !== "/pending") setLocation("/pending");
    if (authState === "APPROVED" && (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending")) setLocation("/feed");
  }, [authState, location, setLocation]);

  // 로딩 화면
  if (authState === "LOADING") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-500 animate-pulse text-xl text-center">
          [ SYSTEM_INITIALIZING... ]<br/>
          <span className="text-xs opacity-50 tracking-widest mt-2 block">CHECKING_SECURITY_PROTOCOL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-black px-4 pt-6 pb-12 font-mono text-green-500 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-[800px] flex flex-col min-h-screen">
        
        {/* 상단 배너 */}
        <div className="w-full border border-green-500 py-3 mb-6 flex justify-center items-center bg-black">
          <span className="text-green-500 text-base md:text-xl tracking-[0.8em] font-bold ml-[0.8em]">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </span>
        </div>

        {/* 상태 표시줄 */}
        <div className="w-full flex justify-between items-end border-b border-green-900 pb-3 mb-10">
          <div className="flex gap-4 text-sm md:text-base tracking-wider">
            <span className="text-green-500">SYSTEM: CONNECTED</span>
            <span className={user ? "text-blue-500" : "text-red-500"}>
              USER: {user ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div>
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black">
                  [ 로 그 인 ]
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* 💡 핵심: 물리적 렌더링 차단 구역 (여기서 무조건 걸러집니다) */}
        <main className="w-full flex-grow flex flex-col items-center">
          
          {/* 비로그인 유저는 홈, 로그인, 회원가입만 볼 수 있음 */}
          {authState === "UNAUTH" && (
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route component={Home} />
            </Switch>
          )}

          {/* 💡 닉네임 없는 유저는 무조건 온보딩 컴포넌트만 렌더링 (도망 불가) */}
          {authState === "ONBOARDING" && <Onboarding />}

          {/* 승인 대기자는 펜딩 화면만 렌더링 */}
          {authState === "PENDING" && <Pending />}

          {/* 완벽히 승인된 유저만 피드와 시스템 내부를 볼 수 있음 */}
          {authState === "APPROVED" && (
            <Switch>
              <Route path="/feed" component={Feed} />
              <Route path="/profile" component={Profile} />
              <Route path="/write" component={WritePost} />
              <Route path="/chat-list" component={ChatList} />
              <Route path="/chat/:id" component={ChatRoom} />
              <Route path="/post/:id" component={PostDetail} />
              <Route path="/edit/:id" component={PostEdit} />
              <Route path="/admin" component={Admin} />
              <Route path="/rules" component={Rules} />
              <Route path="/profile/:userId" component={PublicProfile} />
              <Route component={NotFound} />
            </Switch>
          )}
        </main>

        <footer className="w-full border-t border-green-900/50 pt-2 mt-24 text-center text-xs text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}
