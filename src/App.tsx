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

      // 💡 1. 비로그인 유저 통제: 허락된 곳 외엔 모두 메인(/)으로 쫓아냄
      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") {
          setLocation("/");
        }
        return;
      }

      // 💡 2. 로그인 유저 프로필(승인) 확인
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
      } else {
        // 💡 3. 승인 완료된 유저: 메인이나 로그인 창에 오면 피드(/feed)로 자동 입장시킴
        if (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending") {
          setLocation("/feed");
        }
      }
    };

    checkUserStatus();

    return () => {
      mounted = false;
    };
  }, [location]); // location이 바뀔 때마다 감시

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
    <div className="min-h-screen w-full bg-black text-green-500 font-mono flex flex-col items-center selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-4xl flex flex-col items-center px-4 pb-10 pt-6">
        <Gatekeeper />

        {/* 유저 상태 표시줄 (최상단) */}
        <div className="w-full flex justify-between items-center text-xs mb-10 px-2 border-b border-green-900/50 pb-2">
          <div className="flex gap-4 items-center">
            <span className="text-green-500 font-bold">SYSTEM: CONNECTED</span>
            <span className={`font-bold ${user ? "text-blue-500" : "text-red-500"}`}>
              USER: {user ? `ONLINE (${user.email})` : "OFFLINE"}
            </span>
          </div>
          
          {user && (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black font-bold bg-black text-green-500 transition-colors"
            >
              [ LOGOUT ]
            </button>
          )}
        </div>

        {/* 메인 콘텐츠 (여기에 Home, Feed 등이 담김) */}
        <main className="w-full flex flex-col items-center min-h-[60vh]">
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

        <div className="mt-24 text-[10px] text-green-900 opacity-80 text-center w-full">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </div>
      </div>
    </div>
  );
}