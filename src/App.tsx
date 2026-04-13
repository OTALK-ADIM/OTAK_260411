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
  const [location] = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center">
      {/* 💡 피드(Feed) 페이지와 동일한 2xl(42rem) 최대 너비 고정 */}
      <div className="w-full max-w-2xl px-4 flex flex-col gap-6 pt-10">
        <Gatekeeper />
        
        {/* 글로벌 상단 헤더: 모든 페이지에서 동일하게 유지 */}
        <header className="border-b-2 border-green-500 pb-4 mb-2 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tighter cursor-pointer hover:bg-green-500 hover:text-black px-1">
              [ N E O _ G E E K _ S Y S T E M ]
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] border border-green-900 px-2 py-1 hover:bg-red-900 hover:text-white transition-all bg-black">
                [ LOGOUT ]
              </button>
            ) : (
              <Link href="/login">
                <button className="text-[10px] border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-all bg-black font-bold">
                  [ LOGIN ]
                </button>
              </Link>
            )}
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="w-full min-h-[60vh]">
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

        {/* 글로벌 풋터 */}
        <footer className="border-t border-green-900/30 py-10 mt-10 text-center">
          <p className="text-[10px] opacity-30 italic">
            V. 1.8.8 - AT 2400bps - SYSTEM: WAITING FOR USER INPUT...
          </p>
        </footer>
      </div>
    </div>
  );
}