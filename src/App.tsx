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
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
      if (!profile) { if (location !== "/onboarding") setLocation("/onboarding"); }
      else if (profile.is_approved === false) { if (location !== "/pending") setLocation("/pending"); }
      else { if (location === "/onboarding" || location === "/pending") setLocation("/"); }
    };
    checkUserStatus();
  }, [location, setLocation]);
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
    // 💡 피드 페이지의 핵심 규격(max-w-2xl)을 전체에 적용
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        <Gatekeeper />
        
        {/* 모든 페이지 공통 헤더 */}
        <header className="border-b-2 border-green-500 pb-4 flex justify-between items-center bg-black">
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tighter cursor-pointer hover:bg-green-500 hover:text-black px-1 transition-all">
              [ N E O _ G E E K _ S Y S T E M ]
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] border border-green-900 px-2 py-1 hover:bg-red-900 hover:text-white transition-all">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="text-[10px] border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-all font-bold">
                  [ LOGIN ]
                </button>
              </Link>
            )}
          </div>
        </header>

        {/* 페이지 알맹이 */}
        <main className="w-full flex-grow">
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

        <footer className="border-t border-green-900/30 pt-10 pb-6 text-center">
          <p className="text-[10px] opacity-30 italic">
            V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
          </p>
        </footer>
      </div>
    </div>
  );
}