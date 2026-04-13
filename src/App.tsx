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
    // 💡 전체 배경은 검정, 내용은 가운데 정렬
    <div className="min-h-screen w-full flex justify-center bg-black text-green-500">
      
      {/* 💡 핵심: 가로 폭을 600px로 꽉 묶어서 '세로형' 완성 */}
      <div className="w-full max-w-[600px] flex flex-col px-4 pt-4 pb-12 min-h-screen">
        <Gatekeeper />

        {/* 1. 상단 슬로건 배너 */}
        <div className="w-full border border-green-500 py-2 text-center text-sm md:text-base tracking-[0.5em] md:tracking-[1em] mb-2">
          [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
        </div>

        {/* 2. 상태 바 (왼쪽 정렬) */}
        <div className="w-full flex justify-between items-center text-xs mb-4">
          <div className="flex gap-4">
            <span className="font-bold">SYSTEM: CONNECTED</span>
            <span className={user ? "text-blue-500 font-bold" : "text-green-700 font-bold"}>
              USER: {user ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          
          {/* 로그인 했을 때만 로그아웃 버튼 작게 표시 */}
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-2 py-1 text-[10px] hover:bg-green-500 hover:text-black">
              [ LOGOUT ]
            </button>
          )}
        </div>

        {/* 3. 메인 화면 출력 */}
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

        {/* 4. 풋터 */}
        <footer className="w-full border-t border-green-900/50 pt-2 mt-auto text-center text-[10px] text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}