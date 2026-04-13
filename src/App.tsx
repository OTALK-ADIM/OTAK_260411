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

function TerminalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 flex flex-col items-center">
        
        {/* 상단 배너: 고정 디자인 */}
        <div className="w-full border-2 border-green-500 font-bold p-3 text-center tracking-[0.3em] mt-10 mb-6 bg-black">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 상태 바: 로그인 여부와 관계없이 높이(h-14)와 정렬 고정 */}
        <div className="w-full flex justify-between items-center h-14 border-b border-green-900/40 mb-10 px-1">
          <div className="text-[11px] space-y-0.5">
            <div className="flex gap-2">
              <span className="text-green-900 font-bold">SYSTEM:</span>
              <span className="text-green-500">CONNECTED</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-900 font-bold">USER:</span>
              <span className={user ? "text-green-500" : "text-red-600"}>
                {user ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="text-[11px] border border-green-900 px-3 py-1 hover:bg-green-500 hover:text-black transition-all cursor-pointer">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="border border-green-500 px-4 py-1.5 text-xs font-bold hover:bg-green-500 hover:text-black transition-all cursor-pointer">
                  [ 로 그 인 ]
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="w-full">
          {children}
        </main>

        {/* 풋터: 위치 고정 */}
        <footer className="w-full py-16 text-center text-[10px] text-green-900/50 mt-auto">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}

export default function App() {
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