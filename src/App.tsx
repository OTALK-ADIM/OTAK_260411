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

function Gatekeeper() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
      if (!profile) { if (location !== "/onboarding") setLocation("/onboarding"); }
      else if (profile.is_approved === false) { if (location !== "/pending") setLocation("/pending"); }
      else { if (location === "/onboarding" || location === "/pending") setLocation("/"); }
    };
    checkUserStatus();
  }, [location, setLocation]);
  return null;
}

/**
 * TerminalLayout: 비율과 컬러를 박제한 레이아웃
 */
function TerminalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center overflow-x-hidden selection:bg-green-500 selection:text-black">
      
      {/* 1. 상단 배너 (고정 높이와 정렬) */}
      <div className="w-full max-w-4xl px-4 pt-8">
        <div className="border-2 border-green-500 text-green-500 font-bold p-2 text-center tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 2. 상태 바 (h-12로 높이 고정하여 로그인 전후 비율 유지) */}
        <div className="flex justify-between items-center text-[11px] h-12 px-1 border-b border-green-900 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-green-500">SYSTEM: CONNECTED</span>
            <div className="flex items-center">
               <span className={user ? "text-green-500" : "text-red-600"}>
                 USER: {user ? "ONLINE" : "OFFLINE"}
               </span>
               {user && <span className="ml-2 text-green-900 opacity-50 truncate max-w-[150px]">({user.email})</span>}
            </div>
          </div>
          
          {user ? (
            <button onClick={() => supabase.auth.signOut()} className="text-green-900 hover:text-green-500 transition-colors cursor-pointer">
              [ LOGOUT ]
            </button>
          ) : (
            <Link href="/login">
              <button className="border border-green-500 px-3 py-1 text-green-500 hover:bg-green-500 hover:text-black transition-all font-bold cursor-pointer">
                [ 로 그 인 ]
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 3. 메인 콘텐츠 영역 (중앙 정렬 강제) */}
      <main className="w-full max-w-4xl px-4 flex flex-col items-center">
        {children}
      </main>

      {/* 4. 하단 풋터 (위치 고정) */}
      <footer className="w-full max-w-4xl text-center py-12 text-[10px] text-green-900 mt-auto">
        V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
      </footer>
    </div>
  );
}

function App() {
  return (
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