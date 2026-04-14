import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
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
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        if (location !== "/" && location !== "/login" && location !== "/signup") setLocation("/");
        return;
      }

      // 💡 핵심: 닉네임까지 확실히 등록되었는지 꼼꼼하게 검사합니다.
      const { data: profile } = await supabase.from("profiles").select("nickname, is_approved").eq("id", user.id).maybeSingle();
      if (!mounted) return;

      // 💡 닉네임이 없다? = 방금 구글로 처음 로그인한 신규 유저! -> 가입 페이지로 연행
      if (!profile || !profile.nickname) {
        if (location !== "/onboarding") setLocation("/onboarding");
      } else if (profile.is_approved === false) {
        if (location !== "/pending") setLocation("/pending");
      } else {
        if (location === "/" || location === "/login" || location === "/onboarding" || location === "/pending") {
          setLocation("/feed");
        }
      }
    };
    checkUserStatus();
    return () => { mounted = false; };
  }, [location]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full flex justify-center bg-black px-4 pt-6 pb-12">
      <div className="w-full max-w-[800px] flex flex-col">
        <Gatekeeper />

        {/* 상단 배너 */}
        <div className="w-full border border-green-500 py-3 mb-6 flex justify-center items-center">
          <span className="text-green-500 text-base md:text-xl tracking-[0.8em] font-bold ml-[0.8em]">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </span>
        </div>

        {/* 상태 표시줄 */}
        <div className="w-full flex justify-between items-end border-b border-green-900 pb-3 mb-10">
          <div className="flex gap-4 text-sm md:text-base tracking-wider">
            <span className="text-green-500">SYSTEM: CONNECTED</span>
            <span className={user ? "text-blue-500" : "text-red-500"}>
              USER: {user ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div>
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="border border-green-500 px-4 py-1 text-green-500 hover:bg-green-500 hover:text-black">
                  [ 로 그 인 ]
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* 메인 화면 출력 */}
        <main className="w-full">
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

        {/* 풋터 */}
        <footer className="w-full border-t border-green-900/50 pt-2 mt-24 text-center text-xs text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}
