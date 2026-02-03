'use client';

import { useState } from 'react';
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

  const menuItems = [
    { name: '측정 하기', icon: Scale },
    { name: '기록 보기', icon: ClipboardList },
    { name: '데이터 분석', icon: BarChart3 },
    { name: '설정', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
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
