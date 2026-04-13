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
    let isMounted = true;

    const checkUserStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_approved, nickname")
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        // localStorage 동기화
        if (profile?.nickname) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({ id: user.id, nickname: profile.nickname })
          );
        }

        // 프로필 상태에 따른 리다이렉트
        if (!profile) {
          if (location !== "/onboarding") setLocation("/onboarding");
        } else if (profile.is_approved === false) {
          if (location !== "/pending") setLocation("/pending");
        } else if (location === "/onboarding" || location === "/pending") {
          setLocation("/");
        }
      } catch (err) {
        console.error("[Gatekeeper 에러]", err);
      }
    };

    checkUserStatus();

    return () => {
      isMounted = false;
    };
  }, []); // ← 빈 배열로 변경 (한 번만 실행 → 무한 루프 방지)

  return null;
}

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