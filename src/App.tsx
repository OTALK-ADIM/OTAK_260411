import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { supabase } from "./lib/supabase";

// 기존 페이지들
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

// 추가된 페이지 (파일명 대소문자 주의: onboarding.tsx, pending.tsx)
import Onboarding from "./pages/onboarding";
import Pending from "./pages/pending";

/**
 * [필요한 로직만 담은 게이트키퍼]
 * 로그인 여부와 프로필 존재 여부만 체크해서 페이지를 이동시킵니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. 로그인이 안 되어 있다면? 메인 화면 그대로 유지 (기존대로)
      if (!user) return;

      // 2. 로그인 되어 있다면 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle(); // 데이터가 없어도 에러 대신 null 반환

      // 3. 상황별 리다이렉트
      if (!profile) {
        // 프로필 정보가 아예 없으면 -> 가입 상세 입력창으로
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        // 정보는 있는데 승인이 안 됐으면 -> 대기 창으로
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인 완료된 유저가 가입/대기 페이지에 있으면 -> 메인으로
        if (location === "/onboarding" || location === "/pending") setLocation("/");
      }
    };

    checkUser();
  }, [location, setLocation]);

  return null;
}

function App() {
  return (
    <>
      {/* 화면 디자인에 영향 주지 않는 로직만 실행 */}
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
        
        {/* 가입 및 대기 페이지 경로 */}
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/pending" component={Pending} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;