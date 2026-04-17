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

  const getPageTitle = (path: string) => {
    if (path === "/") return "MAIN_MENU";
    if (path === "/login") return "USER_AUTHENTICATION";
    if (path === "/signup") return "NEW_USER_REGISTRATION";
    if (path === "/onboarding") return "ONBOARDING_PROCESS";
    if (path === "/feed") return "DATA_FEED";
    if (path === "/profile") return "MY_ARCHIVE";
    if (path === "/write") return "DATA_ENTRY";
    if (path === "/chat-list") return "SECURE_COMMS";
    if (path === "/rules") return "NERD_PROTOCOL";
    if (path.startsWith("/post/")) return "DATA_DETAIL";
    if (path.startsWith("/chat/")) return "COMMS_LINK";
    return "SYSTEM_TERMINAL";
  };

  useEffect(() => {
    const verifyUser = async (sessionUser: any) => {
      if (!sessionUser) {
        setAuthState("UNAUTH");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("nickname, profile_img_url, is_approved").eq("id", sessionUser.id).maybeSingle();
      
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

  useEffect(() => {
    if (authState === "LOADING") return;
    if (authState === "UNAUTH" && location !== "/" && location !== "/login" && location !== "/signup") setLocation("/");
    if (authState === "ONBOARDING" && location !== "/onboarding") setLocation("/onboarding");
    if ((authState === "PENDING" || authState === "APPROVED") && (location === "/login" || location === "/onboarding" || location === "/signup")) setLocation("/");
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
    <div className="min-h-screen w-full flex justify-center bg-black px-4 pt-4 pb-12 font-mono text-green-500 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-[800px] flex flex-col min-h-screen">
        
        <header className="w-full flex flex-col mb-4 md:mb-8">
          <div className="w-full border border-green-500 py-2 flex justify-center items-center bg-black mb-3">
            <span className="text-green-500 text-sm md:text-base tracking-[0.5em] font-bold">
              [ 오 타 쿠 가 세 상 을 지 배 한 다 . ]
            </span>
          </div>

          <div className="w-full flex justify-between items-end border-b border-green-900 pb-2 mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-4 text-xs md:text-sm tracking-widest text-green-500 font-bold">
                <span>SYSTEM: CONNECTED</span>
                <span className={user ? "text-blue-400" : "text-red-500"}>
                  USER: {user ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              {authState === "PENDING" && (
                <span className="text-[10px] text-red-500 animate-pulse font-bold tracking-widest mt-1">
                  :: RESTRICTED MODE (심사 진행 중) ::
                </span>
              )}
            </div>
            <div>
              {user ? (
                <div onClick={() => supabase.auth.signOut()} className="border border-green-500 bg-black px-3 py-1 text-green-500 hover:bg-green-500 hover:text-black transition-none text-xs cursor-pointer inline-block font-bold">
                  [ LOGOUT ]
                </div>
              ) : (
                <Link href="/login">
                  <div className="border border-green-500 bg-black px-4 py-1 text-green-500 hover:bg-green-500 hover:text-black transition-none text-xs cursor-pointer inline-block font-bold">
                    [ 로 그 인 ]
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* 💡 Link 태그 멸망! div와 onClick으로 교체하여 보라색 테러 완벽 차단 */}
          <div 
            onClick={() => setLocation("/")}
            className="w-full border-2 border-green-500 py-10 md:py-12 flex flex-col items-center justify-center bg-black shadow-[0_0_15px_rgba(34,197,94,0.15)] relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
            <h1 className="text-6xl md:text-8xl text-green-500 tracking-[0.2em] mb-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] font-bold relative z-10">
              OTALK
            </h1>
            <p className="text-[10px] md:text-sm text-green-600 tracking-[0.4em] uppercase relative z-10 font-bold">
              [ Neo_Geek_Network_System ]
            </p>
          </div>
          
          <div className="w-full flex justify-center items-center mt-6">
            <h2 className="text-2xl md:text-3xl text-green-500 font-bold tracking-[0.1em] drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] bg-black px-4">
              {getPageTitle(location)}
            </h2>
          </div>
        </header>

        <main className="w-full flex-grow flex flex-col">
          {authState === "UNAUTH" && (
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route component={Home} />
            </Switch>
          )}

          {authState === "ONBOARDING" && <Onboarding />}

          {(authState === "PENDING" || authState === "APPROVED") && (
            <Switch>
              <Route path="/" component={Home} />
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

        <footer className="w-full border-t border-green-900/50 pt-4 mt-20 text-center text-xs text-green-800">
          V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
        </footer>
      </div>
    </div>
  );
}