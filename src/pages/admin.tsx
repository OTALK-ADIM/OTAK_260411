import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const [, setLocation] = useLocation();
  // 삭제된 게시글 번호를 기억할 메모장
  const [deletedPosts, setDeletedPosts] = useState<number[]>([]);

  // 피드와 동일한 데이터 목록
  const allPosts = [
    { id: 9, title: "스팀 여름 할인 및 넥스트 페스트 일정 유출" },
    { id: 8, title: "AI 인프라 관련주 1분기 실적 발표 요약" },
    { id: 7, title: "이번 주 앱스토어 인디 리듬게임 신작 리스트" },
    { id: 6, title: "언리얼 엔진 5 신규 PCG 툴 업데이트 예고" },
    { id: 5, title: "엔드필드 정보 공유방 파실 분" },
  ];

  // 방에 들어올 때 공용 메모리(localStorage)에서 삭제된 목록을 가져옴
  useEffect(() => {
    const saved = localStorage.getItem("deleted_posts");
    if (saved) setDeletedPosts(JSON.parse(saved));
  }, []);

  // 강제 삭제 버튼을 눌렀을 때 작동하는 기능
  const handleDelete = (id: number) => {
    if (confirm(`[경고] 시스템 권한으로 ${id}번 게시글을 강제 삭제하시겠습니까?`)) {
      const newDeleted = [...deletedPosts, id];
      setDeletedPosts(newDeleted);
      localStorage.setItem("deleted_posts", JSON.stringify(newDeleted)); // 메모리에 '이 번호 삭제됨' 저장
    }
  };

  // 삭제되지 않은 글만 골라내기
  const activePosts = allPosts.filter(post => !deletedPosts.includes(post.id));

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      {/* 관리자 전용 빨간색 테마 */}
      <div className="border-b-2 border-red-500 pb-2 mb-2 text-center font-bold tracking-widest text-red-500">
        [ 시 스 템 관 리 자 모 드 ]
      </div>

      <div className="bg-[#0a0a0a] p-4 border border-red-500/50">
        <h3 className="text-red-500 font-bold mb-4">:: 게시물 관리 제어판 ::</h3>
        <div className="flex flex-col gap-2">
          {activePosts.map(post => (
            <div key={post.id} className="flex justify-between items-center border-b border-red-500/30 pb-2">
              <span className="truncate text-sm mr-2 text-red-200">NO.{post.id} {post.title}</span>
              <button 
                onClick={() => handleDelete(post.id)}
                className="border border-red-500 text-red-500 px-2 py-1 text-xs hover:bg-red-500 hover:text-black transition-colors whitespace-nowrap"
              >
                [ 강제 삭제 ]
              </button>
            </div>
          ))}
          {activePosts.length === 0 && (
            <div className="text-center opacity-50 text-sm text-red-500 mt-4">모든 게시글이 삭제되었습니다.</div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setLocation("/feed")}
        className="self-end border border-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors mt-4"
      >
        [ 일반 모드로 복귀 ]
      </button>
    </div>
  );
}