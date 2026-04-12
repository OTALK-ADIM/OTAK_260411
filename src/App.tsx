import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { supabase } from "./lib/supabase";

// 페이지 컴포넌트 임포트
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

/**
 * Gatekeeper: 유저 상태를 감시하여 페이지를 이동시킵니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else {
        if (location === "/onboarding" || location === "/pending") {
          setLocation("/");
        }
      }
    };
    checkUserStatus();
  }, [location, setLocation]);

  return null;
}

/**
 * TerminalLayout: 성민님의 디자인 프레임 (모든 페이지 공통)
 */
function TerminalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 현재 유저 상태 체크
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // 로그인 상태 변화 감지
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center p-4 w-full">
      {/* 1. 상단 고정 배너 */}
      <div className="border-2 border-green-500 text-green-500 font-bold p-2 text-center w-full max-w-4xl tracking-widest mt-6 mb-4">
        [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
      </div>

      {/* 2. 동적 상태 바 (로그인 여부에 따라 USER 상태 변경) */}
      <div className="w-full max-w-4xl flex justify-between items-center text-[11px] mb-8 px-1">
        <div>
          <span className="text-green-500">SYSTEM: CONNECTED</span>
          {user ? (
            <span className="text-blue-500 ml-4">USER: ONLINE ({user.email})</span>
          ) : (
            <span className="text-red-500 ml-4">USER: OFFLINE</span>
          )}
        </div>
        
        {user ? (
          <button onClick={handleLogout} className="border border-green-800 text-green-800 px-3 py-1 hover:bg-green-500 hover:text-black transition-all">
            [ LOGOUT ]
          </button>
        ) : (
          <Link href="/login">
            <button className="border border-green-500 text-green-500 font-bold px-4 py-1.5 hover:bg-green-500 hover:text-black transition-all cursor-pointer">
              [ 로 그 인 ]
            </button>
          </Link>
        )}
      </div>

      {/* 3. 실제 페이지 내용 (Home, Feed 등이 여기에 들어감) */}
      <main className="w-full max-w-4xl flex-grow">
        {children}
      </main>

      {/* 4. 하단 고정 풋터 */}
      <div className="w-full max-w-4xl text-center py-10 text-[10px] text-green-900 mt-auto">
        V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
      </div>
    </div>
  );
}

function App() {
  return (
    // TerminalLayout으로 모든 Route를 감싸서 디자인을 통일합니다.
    <TerminalLayout>
      <Gatekeeper />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/feed" component={Feed} />
        <Route path="/profile" component={Profile} />
        <Route path="/write-post" component={WritePost} />
        <Route path="/chat-list" component={ChatList} />
        <Route path="/chat-room" component={ChatRoom} />
        <Route path="/post/:id" component={PostDetail} />
        <Route path="/post-edit/:id" component={PostEdit} />
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/rules" component={Rules} />
        <Route path="/public-profile/:id" component={PublicProfile} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/pending" component={Pending} />
        <Route component={NotFound} />
      </Switch>
    </TerminalLayout>
  );
}

export default App;