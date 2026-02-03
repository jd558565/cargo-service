'use client';

import { useState, useEffect } from 'react';
import {
  Scale,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  User,
  Search,
  ChevronRight
} from 'lucide-react';
import WeighingDisplay from '@/components/WeighingDisplay';

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('측정 하기');
  const [showSplash, setShowSplash] = useState(true);

  // 3.5초 후 스플래시 화면 숨기기
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { name: '측정 하기', icon: Scale },
    { name: '기록 보기', icon: ClipboardList },
    { name: '데이터 분석', icon: BarChart3 },
    { name: '설정', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] flex overflow-hidden">
      {/* 0. 스플래시 스크린 */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
          <div className="relative flex flex-col items-center gap-2 animate-in zoom-in-95 duration-700">
            {/* 로고 애니메이션 컨테이너 */}
            <div className="relative w-[448px] h-[448px] flex items-center justify-center transition-transform hover:scale-105">
              {/* 1. 하단 차량 본체 (섀시, 바퀴, 캡 하단) - 덜컹거림 진동 */}
              <div className="absolute inset-0 animate-truck">
                <img
                  src="/images/weighter_logo.png"
                  alt="Truck Body"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(255,111,15,0.08)]"
                  style={{ clipPath: 'inset(72% 0 0 0)' }}
                />

                {/* 2. 배기가스 파티클 (우측) */}
                <div className="absolute bottom-[20%] right-[20%]">
                  <div className="exhaust-particle w-6 h-6" style={{ animationDelay: '0s' }} />
                  <div className="exhaust-particle w-4 h-4" style={{ animationDelay: '0.3s' }} />
                  <div className="exhaust-particle w-8 h-8" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>

              {/* 3. 화물(줄무늬 컨테이너) + 크레인 고리 - 함께 들어올리기 모션 */}
              <div className="absolute inset-0 animate-cargo">
                <img
                  src="/images/weighter_logo.png"
                  alt="Cargo and Hook"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(255,111,15,0.08)]"
                  style={{ clipPath: 'inset(0 0 28% 0)' }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-black text-[#FF6F0F] tracking-wider mb-2">
                Weighter
              </h1>
              <p className="text-xl text-[#868B94] font-bold tracking-tight">가장 정확하고 따뜻한 물류의 시작</p>
            </div>
          </div>
          {/* 하단 로딩 바 스타일 - 3.5초간 서서히 채워지도록 수정 */}
          <div className="absolute bottom-20 w-48 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6F0F] animate-[loading-fill_3.5s_linear_forwards]" />
          </div>
        </div>
      )}

      {/* 1. 좌측 고정 사이드바 */}
      <aside className="w-[300px] bg-white border-r border-[#E9ECEF] flex flex-col p-6 sticky top-0 h-screen">
        {/* 프로필 카드 */}
        <div className="karrot-card p-5 mb-10 flex items-center gap-4 border-none shadow-sm hover:translate-y-0 hover:shadow-sm">
          <div className="w-14 h-14 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white">
            <User size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#868B94] mb-1">매니저</span>
            <span className="text-lg font-black text-[#212124]">내 계량 관리</span>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <div
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`nav-item-karrot ${isActive ? 'active' : ''}`}
              >
                <Icon size={24} className={isActive ? 'text-[#FF6F0F]' : 'text-[#4D5159]'} />
                <span className="text-[18px]">{item.name}</span>
                {isActive && <ChevronRight size={18} className="ml-auto text-[#FF6F0F]" />}
              </div>
            );
          })}
        </nav>

        {/* 하단 푸터 느낌의 정보 */}
        <div className="mt-auto pt-6 border-t border-[#F2F3F6]">
          <div className="flex items-center gap-3 text-[#868B94] px-4">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-bold">시스템 정상 작동 중</span>
          </div>
        </div>
      </aside>

      {/* 2. 우측 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 헤더 섹션 */}
        <header className="px-10 py-6 flex justify-between items-center bg-white border-b border-[#E9ECEF]">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-2xl font-black text-[#212124] tracking-tight mr-10">
              {activeMenu}
            </h2>
            <div className="max-w-md w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
              <input
                type="text"
                placeholder="기록이나 명령을 검색해보세요"
                className="w-full bg-[#F2F3F6] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#FF6F0F] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            <button className="w-12 h-12 rounded-2xl bg-[#F2F3F6] flex items-center justify-center text-[#4D5159] hover:bg-[#E9ECEF] transition-all">
              <Bell size={24} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6F0F] to-[#FF8E42] flex items-center justify-center text-white font-black shadow-lg shadow-orange-100">
              A
            </div>
          </div>
        </header>

        {/* 콘텐츠 본문 - 중앙 배치를 위한 레이아웃 */}
        <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            {activeMenu === '측정 하기' ? (
              <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <WeighingDisplay />
              </section>
            ) : (
              <div className="karrot-card flex flex-col items-center justify-center py-40 border-dashed border-2 bg-white/40">
                <BarChart3 size={100} className="text-[#DEE2E6] mb-8" />
                <div className="text-center">
                  <p className="text-2xl font-black text-[#868B94] mb-2">"{activeMenu}" 기능 준비 중</p>
                  <p className="text-[#ADB5BD] font-medium">더 따뜻하고 편한 서비스를 위해 개발하고 있어요.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
