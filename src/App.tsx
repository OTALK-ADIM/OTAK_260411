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
    let mounted = true;
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") setLocation("/");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
      if (!mounted) return;
      if (!profile) { if (location !== "/onboarding") setLocation("/onboarding"); }
      else if (profile.is_approved === false) { if (location !== "/pending") setLocation("/pending"); }
      else {
        if (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending") {
          setLocation("/feed");
        }
      }
    };
    checkUserStatus();
    return () => { mounted = false; };
  }, [location]);
  return null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    // 💡 화면 전체를 감싸는 절대 방어 프레임 (가로 늘어짐 방지)
    <div className="w-full flex justify-center bg-black min-h-screen text-green-500 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-2xl px-4 pt-10 pb-8 flex flex-col items-center">
        <Gatekeeper />

        {/* 최상단: [ 오 타 쿠 가 세 상 을 지 배 한 다 . ] */}
        <div className="w-full border-b border-green-900 pb-2 mb-2 text-center">
          <h1 className="text-xl font-bold tracking-[0.3em] hover:bg-green-500 hover:text-black transition-all px-2">
            [ N E O _ G E E K _ S Y S T E M ]
          </h1>
        </div>

        {/* 상태 바 (디자인 완벽 보존) */}
        <div className="w-full flex justify-between items-center h-14 border-b border-green-900 mb-8 px-1">
          <div className="text-[11px] leading-tight space-y-0.5">
            <div className="flex gap-2">
              <span className="text-green-900 font-bold">SYSTEM:</span>
              <span>CONNECTED</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-900 font-bold">USER:</span>
              <span className={user ? "text-green-500" : "text-red-600"}>
                {user ? `ONLINE (${user.email})` : "OFFLINE"}
              </span>
            </div>
          </div>
          
          {user ? (
            <button onClick={() => supabase.auth.signOut()} className="text-[11px] border border-green-900 px-3 py-1 hover:bg-red-900 hover:text-white transition-all cursor-pointer bg-black">
              [ LOGOUT ]
            </button>
          ) : (
            <Link href="/login">
              <button className="border border-green-500 px-4 py-1.5 text-xs font-bold hover:bg-green-500 hover:text-black transition-all cursor-pointer bg-black">
                [ LOGIN ]
              </button>
            </Link>
          )}
        </div>

        {/* 💡 핵심: 메인 콘텐츠 영역 (한가운데에 잘 보이게 고정) */}
        <main className="w-full flex-grow flex flex-col items-center justify-center py-12">
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

        <footer className="w-full py-16 text-center text-[10px] text-green-900/50 mt-auto">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}