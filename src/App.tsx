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

function Gatekeeper({ user, loading }: { user: any, loading: boolean }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    const checkAccess = async () => {
      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") {
          setLocation("/");
        }
        return;
      }

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[500px] border-x border-green-900/30 min-h-screen flex flex-col p-4 shadow-[0_0_50px_rgba(0,0,0,1)]">
        
        <Gatekeeper user={user} loading={loading} />

        {/* 💡 최상단 고정 배너: 한 줄로 보이도록 크기 축소 및 줄바꿈 금지(whitespace-nowrap) 적용 */}
        <div className="w-full border border-green-500 py-2 mb-6 shrink-0 bg-black flex justify-center overflow-hidden">
          <h2 className="text-green-500 font-bold tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-[11px] whitespace-nowrap">
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
              style={{ backgroundColor: "black", color: "#22c55e" }}
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

        <footer className="mt-auto py-6 text-center text-[9px] text-green-900 tracking-tighter opacity-40">
          V. 1.8.8 - PROTOCOL: NEO_GEEK - STATUS: WAITING_FOR_INPUT...
        </footer>

      </div>
    </div>
  );
}