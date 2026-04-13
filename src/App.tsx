import { useEffect } from "react";
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
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 🔥 홈페이지(/)는 로그인 안 해도 접근 가능하게 (강제 이동 제거)
      if (!user) {
        // /login, /signup, /onboarding, /pending이 아니면 아무것도 안 함
        return;
      }

      // 로그인된 유저만 프로필 상태 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved, nickname")
        .eq("id", user.id)
        .maybeSingle();

      // localStorage 동기화 (다른 페이지 호환용)
      if (profile?.nickname) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ id: user.id, nickname: profile.nickname })
        );
      }

      if (!profile) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인 완료된 상태 → 온보딩/대기 페이지에 있으면 홈으로
        if (location === "/onboarding" || location === "/pending") {
          setLocation("/");
        }
      }
    };

    checkUserStatus();
  }, [location, setLocation]);

  return null;
}

// 로그인 상태 실시간 동기화
function AuthSync() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("currentUser");
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono max-w-2xl mx-auto p-4 sm:p-6 flex flex-col">
      <Gatekeeper />
      <AuthSync />
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
    </div>
  );
}