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

      if (!profile) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else {
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
    // 💡 핵심: w-full flex justify-center 로 전체 화면을 잡고,
    // 그 안의 알맹이를 max-w-3xl 로 묶어서 가로 늘어짐을 완벽히 차단합니다.
    <div className="min-h-screen bg-black text-green-500 font-mono w-full flex justify-center selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-3xl flex flex-col px-4 py-8">
        <Gatekeeper />

        {/* 1. 상단 배너 (이미지 완벽 복구) */}
        <div className="w-full border border-green-500 py-3 text-center font-bold tracking-[0.5em] md:tracking-[1em] mb-10 text-sm md:text-base">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 2. 유저 상태 바 (이미지 완벽 복구) */}
        <div className="w-full flex justify-between items-center text-[11px] md:text-xs mb-10 border-b border-green-900/30 pb-4">
          <div className="flex gap-4 items-center">
            <span className="text-green-500 font-bold">SYSTEM: CONNECTED</span>
            <span className={`font-bold ${user ? "text-blue-500" : "text-red-500"}`}>
              USER: {user ? `ONLINE (${user.email})` : "OFFLINE"}
            </span>
          </div>
          
          {user ? (
            <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors cursor-pointer">
              [ LOGOUT ]
            </button>
          ) : (
            <Link href="/login">
              <button className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors cursor-pointer">
                [ 로 그 인 ]
              </button>
            </Link>
          )}
        </div>

        {/* 3. 메인 콘텐츠 */}
        <main className="w-full flex-grow flex flex-col">
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

        {/* 4. 하단 풋터 */}
        <footer className="w-full border-t border-green-900/40 pt-4 mt-20 text-[10px] text-green-900 text-center opacity-80">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}