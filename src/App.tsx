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

function Gatekeeper({ user, loading }: { user: any, loading: boolean }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return; // 세션 확인 중일 때는 아무것도 하지 않음

    const checkRedirect = async () => {
      if (!user) {
        // 로그인 안 된 상태면 메인/로그인 외엔 접근 불가
        if (location !== "/" && location !== "/login" && location !== "/signup") {
          setLocation("/");
        }
        return;
      }

      // 로그인 된 경우 프로필 확인
      const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();

      if (!profile) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else {
        // 승인된 유저가 메인/로그인에 있으면 피드로 이동
        if (location === "/" || location === "/login") setLocation("/feed");
      }
    };

    checkRedirect();
  }, [user, loading, location, setLocation]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 초기화 및 감시
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      {/* 💡 세로형 폰 화면 감성으로 폭(max-w-[500px])을 고정 */}
      <div className="w-full max-w-[500px] border-x border-green-900/30 min-h-screen flex flex-col p-4">
        <Gatekeeper user={user} loading={loading} />

        {/* 최상단 고정 슬로건 */}
        <div className="w-full border-2 border-green-500 py-3 mb-6 shrink-0 bg-black shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <h2 className="text-center text-green-500 font-bold tracking-[0.4em] text-xs md:text-sm">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </h2>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {loading ? (
            <div className="text-green-500 animate-pulse font-bold tracking-widest">
              CHECKING_CREDENTIALS...
            </div>
          ) : (
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
          )}
        </main>

        <footer className="mt-auto py-6 text-center text-[9px] text-green-900 tracking-tighter opacity-50">
          V. 1.8.8 - PROTOCOL: NEO_GEEK - STATUS: WAITING...
        </footer>
      </div>
    </div>
  );
}