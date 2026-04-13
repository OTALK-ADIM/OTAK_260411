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
      if (!user || !mounted) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (!profile) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else if (location === "/onboarding" || location === "/pending") {
        setLocation("/");
      }
    };

    checkUserStatus();

    return () => {
      mounted = false;
    };
  }, []);   // ← 빈 배열로 변경 (무한 루프 방지)

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
    <div className="min-h-screen w-full bg-black text-green-500 font-mono flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col items-center px-4 pb-10">
        <Gatekeeper />

        {/* 상단 배너 */}
        <div className="w-full border-2 border-green-500 font-bold py-2 text-center tracking-[0.5em] mt-10 mb-8 bg-black text-green-500">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 유저 상태 + 로그인 버튼 */}
        <div className="w-full flex justify-between items-center text-xs mb-10 px-2">
          <div className="flex gap-4 items-center">
            <span className="text-green-500 font-bold">SYSTEM: CONNECTED</span>
            <span className={`font-bold ${user ? "text-blue-500" : "text-red-500"}`}>
              USER: {user ? `ONLINE (${user.email})` : "OFFLINE"}
            </span>
          </div>
          
          {user ? (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="border border-green-500 px-4 py-1.5 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors"
            >
              [ LOGOUT ]
            </button>
          ) : (
            <Link href="/login">
              <button className="border border-green-500 px-4 py-1.5 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors">
                [ 로 그 인 ]
              </button>
            </Link>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <main className="w-full flex flex-col items-center">
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
        <div className="mt-24 text-[10px] text-green-900 opacity-80 text-center w-full">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </div>
      </div>
    </div>
  );
}