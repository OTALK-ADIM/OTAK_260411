import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { supabase } from "./lib/supabase";

// 기존 페이지 컴포넌트 임포트 (Onboarding/Pending 추가)
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
import { Switch, Route, useLocation, Link } from "wouter";

/**
 * Gatekeeper: 유저 상태를 감시하여 조건부 리다이렉션을 수행합니다.
 * 화면에는 보이지 않으며, maybeSingle()을 사용하여 신규 유저를 정확히 처리합니다.
 */
function Gatekeeper() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. 로그인 안 된 경우: 디자인 유지를 위해 그대로 둠
      if (!user) return;

      // 2. 로그인 된 경우: 프로필 정보 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .maybeSingle(); // 데이터가 없으면 null 반환 (single()은 에러 발생)

      // 3. 상황별 리다이렉트 (setLocation 사용)
      if (!profile) {
        // 프로필 데이터가 아예 없는 신규 유저 -> Onboarding으로
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

/**
 * MainLayout: image_2.png/image_5.png의 디자인을 완벽히 구현한 프레임워크입니다.
 * 이 구조가 성민님의 메인 페이지 디자인이 됩니다.
 */
function MainLayout() {
  const [location, setLocation] = useLocation();

  // 로그인 버튼 클릭 핸들러 (Login 페이지로 이동)
  const handleLoginClick = () => {
    setLocation("/login");
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* 상단 배너: [ 오 타 쿠 가 세 상 을 지 배 한 다 . ] (공백 유지) */}
      <div className="border-2 border-green-500 text-green-500 font-bold p-2 text-center w-full max-w-4xl tracking-widest mt-10 mb-6">
        [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
      </div>

      {/* USER 상태 영역: SYSTEM: CONNECTED USER: OFFLINE */}
      <div className="w-full max-w-4xl flex justify-between items-center text-xs mb-8">
        <div>
          <span className="text-green-500">SYSTEM: CONNECTED</span>{" "}
          <span className="text-red-500 ml-4">USER: OFFLINE</span>
        </div>
        {/* 로그인 버튼: [ 로 그 인 ] (공백 유지) */}
        <button
          onClick={handleLoginClick}
          className="border border-green-500 text-green-500 font-bold px-4 py-1.5 hover:bg-green-500 hover:text-black transition-colors"
        >
          [ 로 그 인 ]
        </button>
      </div>
      <div className="w-full max-w-4xl text-lg space-y-6">
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4">▶</span>
          <Link href="/rules" className="hover:underline cursor-pointer">0. NERD_PROTOCOL (규칙)</Link>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4">▶</span>
          <Link href="/feed" className="hover:underline cursor-pointer">1. 활동 모집 피드</Link>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4 invisible">▶</span>
          <Link href="/chat-list" className="hover:underline ml-12 cursor-pointer">2. 비밀 대화함 (수락전)</Link>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4 invisible">▶</span>
          <Link href="/profile" className="hover:underline ml-12 cursor-pointer">3. 나의 데이터 (프로필)</Link>
        </div>
      </div>
      {/* 가운데 'OTALK' 네온 박스: OTALK NEO_GEEK_NETWORK_SYSTEM */}
      <div className="border-2 border-green-500 p-10 flex flex-col items-center justify-center w-full max-w-4xl mb-12 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
        <h1 className="text-7xl font-bold text-green-500 tracking-wider mb-2">OTALK</h1>
        <p className="text-xs text-green-900">NEO_GEEK_NETWORK_SYSTEM</p>
      </div>

      {/* 메뉴 목록 영역 */}
      <div className="w-full max-w-4xl text-lg space-y-6">
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4">▶</span>
          <a href="/rules" className="hover:underline">0. NERD_PROTOCOL (규칙)</a>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4">▶</span>
          <a href="/feed" className="hover:underline">1. 활동 모집 피드</a>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4 invisible">▶</span>
          <a href="/chat-list" className="hover:underline ml-12">2. 비밀 대화함 (수락전)</a>
        </div>
        <div className="flex items-center">
          <span className="text-green-500 text-2xl mr-4 invisible">▶</span>
          <a href="/profile" className="hover:underline ml-12">3. 나의 데이터 (프로필)</a>
        </div>
      </div>

      {/* 맨 아래 시스템 풋터 */}
      <div className="fixed bottom-4 text-[10px] text-green-900 w-full max-w-4xl text-center">
        V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
      </div>
    </div>
  );
}

function App() {
  return (
    // 성민님의 터미널 감성 중앙 정렬 레이아웃을 '완전히 똑같이' 복제 (App.tsx 기본 구조)
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center">
      
      {/* 게이트키퍼가 보이지 않는 곳에서 유저 상태를 관리합니다. */}
      <Gatekeeper />

      <Switch>
        {/* 메인 경로(/): 위에서 구현한 MainLayout을 보여줍니다. (메인 페이지 디자인 보호) */}
        <Route path="/">
            {() => <MainLayout />}
        </Route>

        {/* 기존 route들 유지... */}
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
    </div>
  );
}

export default App;