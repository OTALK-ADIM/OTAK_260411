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

// 신규 추가: 가입 상세 정보 입력 및 승인 대기 페이지
import Onboarding from "./pages/onboarding";
import Pending from "./pages/pending";

/**
 * Gatekeeper: 디자인에 영향을 주지 않고 로직만 수행합니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. [수정] 로그인 안 된 경우: 강제로 로그인 페이지로 보내지 않고 그대로 둡니다 (메인 화면 노출)
      if (!user) return;

      // 2. 로그인 된 경우, 프로필 정보 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle(); // .single() 대신 .maybeSingle()을 써야 에러 없이 null을 반환합니다.

      // 3. 상황별 리다이렉트
      if (!profile) {
        // 프로필 데이터가 아예 없으면 -> 가입 정보 입력 페이지로
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 승인이 아직 안 됐으면 -> 대기 페이지로
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인 완료된 유저가 가입/대기 페이지에 있다면 메인으로 보냄
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
    // 성민님이 주신 원래 디자인 태그 그대로 유지
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