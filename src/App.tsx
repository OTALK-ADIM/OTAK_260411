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

type AuthState = "LOADING" | "UNAUTH" | "ONBOARDING" | "PENDING" | "APPROVED";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("LOADING");
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const verifyUser = async (sessionUser: any) => {
      if (!sessionUser) {
        setAuthState("UNAUTH");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, profile_img_url, is_approved")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!profile || !profile.nickname || !profile.profile_img_url) {
        setAuthState("ONBOARDING"); 
      } else if (profile.is_approved !== true) {
        setAuthState("PENDING");    
      } else {
        setAuthState("APPROVED");   
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      verifyUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      verifyUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 💡 라우팅 강제 고정 (PENDING 유저도 피드로 진입 허용)
  useEffect(() => {
    if (authState === "LOADING") return;
    if (authState === "UNAUTH" && location !== "/" && location !== "/login" && location !== "/signup") setLocation("/");
    if (authState === "ONBOARDING" && location !== "/onboarding") setLocation("/onboarding");
    if ((authState === "PENDING" || authState === "APPROVED") && (location === "/" || location === "/login" || location === "/onboarding")) setLocation("/feed");
  }, [authState, location, setLocation]);

  if (authState === "LOADING") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-500 animate-pulse text-xl text-center">
          [ SYSTEM_INITIALIZING... ]<br/>
          <span className="text-xs opacity-50 tracking-widest mt-2 block">CHECKING_SECURITY_PROTOCOL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-black px-4 pt-6 pb-12 font-mono text-green-500 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-[800px] flex flex-col min-h-screen">
        
        <div className="w-full border border-green-500 py-3 mb-6 flex justify-center items-center bg-black">
          <span className="text-green-500 text-base md:text-xl tracking-[0.8em] font-bold ml-[0.8em]">
            [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
          </span>
        </div>

        <div className="w-full flex justify-between items-end border-b border-green-900 pb-3 mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex gap-4 text-sm md:text-base tracking-wider">
              <span className="text-green-500">SYSTEM: CONNECTED</span>
              <span className={user ? "text-blue-500" : "text-red-500"}>
                USER: {user ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            {/* 💡 심사 중인 유저에게만 띄우는 경고 뱃지 */}
            {authState === "PENDING" && (
              <span className="text-[10px] text-red-500 animate-pulse font-bold tracking-widest mt-1">
                :: RESTRICTED MODE (심사 진행 중) ::
              </span>
            )}
          </div>
          <div>
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="border border-green-500 px-3 py-1 hover:bg-green-500 hover:text-black transition-colors">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors">
                  [ 로 그 인 ]
                </button>
              </Link>
            )}
          </div>
        </div>

        <main className="w-full flex-grow flex flex-col items-center">
          {authState === "UNAUTH" && (
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route component={Home} />
            </Switch>
          )}

          {authState === "ONBOARDING" && <Onboarding />}

          {/* 💡 승인 대기자 & 승인 완료자 모두 내부 컨텐츠 열람 가능 */}
          {(authState === "PENDING" || authState === "APPROVED") && (
            <Switch>
              <Route path="/feed" component={Feed} />
              <Route path="/profile" component={Profile} />
              <Route path="/write" component={WritePost} />
              <Route path="/post/:id" component={PostDetail} />
              <Route path="/edit/:id" component={PostEdit} />
              <Route path="/chat-list" component={ChatList} />
              <Route path="/chat/:id" component={ChatRoom} />
              <Route path="/admin" component={Admin} />
              <Route path="/rules" component={Rules} />
              <Route path="/profile/:userId" component={PublicProfile} />
              <Route component={NotFound} />
            </Switch>
          )}
        </main>

        <footer className="w-full border-t border-green-900/50 pt-2 mt-24 text-center text-xs text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}