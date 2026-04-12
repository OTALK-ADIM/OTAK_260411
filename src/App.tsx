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
 * Gatekeeper: 유저의 상태(로그인 여부, 프로필 존재 여부, 승인 여부)를 체크하여 
 * 적절한 페이지로 강제 이동시키는 로직입니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. 로그인 안 된 경우
      if (!user) {
        if (location !== "/login" && location !== "/signup") {
          setLocation("/login");
        }
        return;
      }

      // 2. 로그인 된 경우, 프로필 정보 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

      // 3. 상황별 리다이렉트
      if (!profile) {
        // 프로필이 아예 없으면 (구글 로그인만 한 상태) -> 정보 입력 페이지로
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 프로필은 있으나 관리자 승인이 안 된 상태 -> 대기 페이지로
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 모든 관문 통과 (승인 완료)
        // 만약 유저가 가입/대기 페이지에 머물러 있다면 메인으로 보냄
        if (location === "/onboarding" || location === "/pending" || location === "/login") {
          setLocation("/");
        }
      }
    };

    checkUserStatus();
  }, [location, setLocation]);

  return null; // 로직만 수행하고 화면에는 아무것도 그리지 않음
}

function App() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      {/* 모든 페이지에서 작동하며 유저를 감시하는 게이트키퍼 */}
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
        
        {/* 새 관문 페이지들 */}
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/pending" component={Pending} />

        {/* 404 페이지 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;