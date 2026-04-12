import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { supabase } from "./lib/supabase";

// 기존 페이지 컴포넌트들
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
 * Gatekeeper: 유저의 상태를 감시하여 조건에 맞지 않으면 페이지를 이동시킵니다.
 * 화면을 그리지 않고 오직 주소(URL) 제어만 담당합니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. 로그인 안 된 경우: 메인 화면이나 로그인/회원가입 페이지는 그대로 둠
      if (!user) return;

      // 2. 로그인 된 경우: 프로필 정보 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle();

      // 3. 상황별 리다이렉트 (강제 이동)
      if (!profile) {
        // 프로필(닉네임 등)이 아예 없는 신규 유저 -> Onboarding으로
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 정보는 입력했으나 승인이 아직 안 된 유저 -> Pending으로
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 모든 승인이 완료된 유저가 가입/대기 페이지에 있다면 메인으로 보냄
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
    <>
      {/* 게이트키퍼가 보이지 않는 곳에서 유저 상태를 관리합니다. */}
      <Gatekeeper />

      <Switch>
        {/* 기본 경로 */}
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
        
        {/* 입국 심사 관련 경로 */}
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/pending" component={Pending} />

        {/* 404 페이지 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;