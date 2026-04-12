import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { supabase } from "./lib/supabase";

// 페이지 컴포넌트 임포트
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

      // 💡 [변경] 로그인이 안 된 상태라면 강제로 로그인 페이지로 보내지 않습니다.
      // 그냥 메인 화면(Home)을 볼 수 있게 내버려 둡니다.
      if (!user) return;

      // 2. 로그인 된 상태라면 프로필 정보 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

      // 3. 상황별 리다이렉트
      if (!profile) {
        // 구글 로그인은 했는데 프로필(닉네임 등)을 아직 안 만든 경우
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 프로필은 만들었지만 성민님이 승인을 안 해준 경우
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인 완료된 유저가 가입/대기 페이지에 있다면 메인으로 이동
        if (location === "/onboarding" || location === "/pending") {
          setLocation("/");
        }
      }
    };

    checkUserStatus();
  }, [location, setLocation]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      <Gatekeeper />
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

export default App;