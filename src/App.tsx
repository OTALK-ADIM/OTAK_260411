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
    <div className="min-h-screen bg-black text-green-500 font-mono w-full px-4 selection:bg-green-500 selection:text-black">
      
      {/* 💡 핵심: 어떤 경우에도 화면이 768px을 넘지 못하도록 인라인 스타일로 절대 박제 */}
      <div style={{ maxWidth: "768px", width: "100%", margin: "0 auto" }} className="flex flex-col min-h-screen pt-8 pb-10">
        <Gatekeeper />

        {/* 1. 상단 배너 */}
        <div className="border-2 border-green-500 py-3 text-center font-bold tracking-[0.5em] md:tracking-[1em] mb-8 bg-black">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 2. 유저 상태 바 */}
        <div className="flex justify-between items-center text-xs mb-10 border-b border-green-900/50 pb-4">
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span className="text-green-500 font-bold">SYSTEM: CONNECTED</span>
            <span className={`font-bold ${user ? "text-blue-500" : "text-red-500"}`}>
              USER: {user ? `ONLINE` : "OFFLINE"}
            </span>
          </div>
          
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors cursor-pointer">
              [ LOGOUT ]
            </button>
          )}
        </div>

        {/* 3. 메인 콘텐츠 */}
        <main className="flex-grow flex flex-col w-full">
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