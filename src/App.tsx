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

// 유저의 현재 보안 상태를 5단계로 명확히 정의합니다.
type AuthState = "LOADING" | "UNAUTH" | "NEEDS_ONBOARDING" | "PENDING_APPROVAL" | "APPROVED";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("LOADING");
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();

  // 💡 1단계: 유저의 로그인 정보나 DB 상태를 '감시'하고 '판단'만 합니다. (길 안내는 하지 않음)
  useEffect(() => {
    const checkUserAndProfile = async (currentUser: any) => {
      if (!currentUser) {
        setAuthState("UNAUTH");
        return;
      }
      
      // 로그인된 유저라면 프로필 DB를 뒤집니다.
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, is_approved")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!profile || !profile.nickname) {
        setAuthState("NEEDS_ONBOARDING"); // 프로필 깡통 = 무조건 온보딩으로
      } else if (profile.is_approved === false) {
        setAuthState("PENDING_APPROVAL"); // 승인 안 됨 = 펜딩으로
      } else {
        setAuthState("APPROVED");         // 정상 유저 = 피드로
      }
    };

    // 사이트 최초 진입 시 확인
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      checkUserAndProfile(data.user);
    });

    // 🚨 핵심: 구글 로그인 완료 등 상태가 '변할 때마다' 무조건 다시 프로필을 검사합니다.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkUserAndProfile(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 💡 2단계: 위에서 판단된 AuthState를 바탕으로 '무자비하게' 경로를 통제합니다.
  useEffect(() => {
    if (authState === "LOADING") return;

    if (authState === "UNAUTH") {
      // 비로그인 유저는 홈(/)과 로그인(/login) 외엔 전부 쫓아냄
      if (location !== "/" && location !== "/login") setLocation("/");
    } 
    else if (authState === "NEEDS_ONBOARDING") {
      // 구글 가입 직후 등 닉네임 없는 유저는 무조건 온보딩 창에 가둠
      if (location !== "/onboarding") setLocation("/onboarding");
    } 
    else if (authState === "PENDING_APPROVAL") {
      // 승인 대기자는 펜딩 창에 가둠
      if (location !== "/pending") setLocation("/pending");
    } 
    else if (authState === "APPROVED") {
      // 승인된 정상 유저가 입구(홈, 로그인, 온보딩)에 서성이면 피드로 강제 입장시킴
      if (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending") {
        setLocation("/feed");
      }
    }
  }, [authState, location, setLocation]);

  // 로딩 중일 때는 검문소 화면만 띄우고 뒤에 숨겨진 페이지를 아예 그리지 않습니다.
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

  // 검문이 완료된 상태일 때만 정상 화면 렌더링
  return (
    <div className="min-h-screen w-full flex justify-center bg-black px-4 pt-6 pb-12">
      <div className="w-full max-w-[800px] flex flex-col min-h-screen">
        
        {/* 상단 배너 */}
        <div className="w-full border border-green-500 py-3 mb-6 flex justify-center items-center">
          <span className="text-green-500 text-base md:text-xl tracking-[0.8em] font-bold ml-[0.8em]">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </span>
        </div>

        {/* 상태 표시줄 및 로그인 버튼 */}
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
                <button className="border border-green-500 px-4 py-1 text-green-500 hover:bg-green-500 hover:text-black">
                  [ 로 그 인 ]
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* 메인 화면 출력 */}
        <main className="w-full flex-grow">
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

        {/* 풋터 */}
        <footer className="w-full border-t border-green-900/50 pt-2 mt-24 text-center text-xs text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}
