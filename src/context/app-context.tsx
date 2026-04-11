import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type Post = {
  id: number;
  tag: string;
  title: string;
  author: string;
  date: string;
  upvotes: number;
  isReported: boolean;
};

export type User = {
  nickname: string;
  userClass: string;
  tags: string;
  favoriteGoodsPhotoUrl: string | null;
  lastPhotoUploadTimestamp: number | null;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const initialPosts: Post[] = [
  { id: 1, tag: "[언리얼]", title: "UE5 PCG 스터디 하실 분 구함", author: "테크맨", date: "04/10", upvotes: 12, isReported: false },
  { id: 2, tag: "[명조]", title: "홀로그램 멀티 파티 구해요", author: "방랑자", date: "04/09", upvotes: 25, isReported: false },
  { id: 3, tag: "[인디게임]", title: "도트 찍는 법 피드백 부탁드립니다", author: "픽셀장인", date: "04/09", upvotes: 5, isReported: false },
  { id: 4, tag: "[건프라]", title: "홍대 건담베이스 팝업 동행 구함", author: "샤아", date: "04/08", upvotes: 42, isReported: false },
  { id: 5, tag: "[명일방주]", title: "엔드필드 정보 공유방 파실 분", author: "독타", date: "04/08", upvotes: 8, isReported: false },
  { id: 6, tag: "[뉴스]", title: "언리얼 엔진 5 신규 PCG 툴 업데이트 예고", author: "SYSTEM", date: "04/10", upvotes: 120, isReported: false },
  { id: 7, tag: "[정보]", title: "이번 주 앱스토어 인디 리듬게임 신작 리스트", author: "에디터", date: "04/10", upvotes: 85, isReported: false },
  { id: 8, tag: "[뉴스]", title: "AI 인프라 관련주 1분기 실적 발표 요약", author: "경제봇", date: "04/09", upvotes: 42, isReported: false },
  { id: 9, tag: "[정보]", title: "스팀 여름 할인 및 넥스트 페스트 일정 유출", author: "정보원", date: "04/08", upvotes: 210, isReported: false },
];

const initialUser: User = {
  nickname: "SUNGMIN",
  userClass: "테크니컬 아티스트",
  tags: "#언리얼 #인디게임 #건프라",
  favoriteGoodsPhotoUrl: null,
  lastPhotoUploadTimestamp: null,
};

type AppContextType = {
  posts: Post[];
  addPost: (tag: string, title: string, author: string) => void;
  upvotePost: (id: number) => void;
  reportPost: (id: number) => void;
  user: User;
  updateUser: (partial: Partial<User>) => void;
  tryUploadPhoto: (url: string) => boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [user, setUser] = useState<User>(initialUser);

  const addPost = (tag: string, title: string, author: string) => {
    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    setPosts((prev) => [
      { id: prev.length + 1, tag, title, author, date, upvotes: 0, isReported: false },
      ...prev,
    ]);
  };

  const upvotePost = (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const reportPost = (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, isReported: true } : p));
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  };

  const tryUploadPhoto = (url: string): boolean => {
    const now = Date.now();
    if (user.lastPhotoUploadTimestamp !== null) {
      const elapsed = now - user.lastPhotoUploadTimestamp;
      if (elapsed < THIRTY_DAYS_MS) {
        const remaining = THIRTY_DAYS_MS - elapsed;
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        alert(`SYSTEM ERROR: 굿즈 데이터 교체는 30일에 한 번만 가능합니다.\n(남은 기간: ${String(days).padStart(2, "0")}일 ${String(hours).padStart(2, "0")}시간)`);
        return false;
      }
    }
    setUser((prev) => ({ ...prev, favoriteGoodsPhotoUrl: url, lastPhotoUploadTimestamp: now }));
    alert("SYSTEM: 굿즈 데이터가 성공적으로 등록되었습니다.");
    return true;
  };

  return (
    <AppContext.Provider value={{ posts, addPost, upvotePost, reportPost, user, updateUser, tryUploadPhoto }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
