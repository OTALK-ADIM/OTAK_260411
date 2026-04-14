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
    const checkStatus = async () => {
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
      } else if (location === "/" || location === "/login") {
        setLocation("/feed");
      }
    };
    checkStatus();
    return () => { mounted = false; };
  }, [location]);

  return null;
}

export default function App() {
  return (
    // 💡 화면 가로 찢어짐 방지: flex-col과 max-w-2xl 사용
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-2xl flex flex-col min-h-screen px-4 pt-6 pb-12">
        <Gatekeeper />

        {/* 1. 최상단 슬로건 배너 (shrink-0으로 찌그러짐 방지) */}
        <div className="w-full border-2 border-green-500 py-3 mb-8 text-center bg-black shrink-0">
          <h2 className="text-green-500 font-bold tracking-[0.5em] md:tracking-[1em] text-sm md:text-lg">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </h2>
        </div>

        {/* 2. 메인 화면 영역 (가운데 정렬) */}
        <main className="w-full flex-grow flex flex-col items-center justify-center">
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

        {/* 3. 풋터 */}
        <footer className="w-full pt-8 text-center text-[10px] text-green-900 opacity-60 shrink-0 mt-auto">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}