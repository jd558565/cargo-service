"use client";

import { useEffect, useState, useCallback } from "react";
import {
  History,
  Settings,
  Package,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
  Scale
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import TermsModal from "@/components/TermsModal";
import LanguageSelector from "@/components/LanguageSelector";
import WeighingHistoryModal from "@/components/WeighingHistoryModal";
import DashboardView from "@/components/DashboardView";
import WeighingView from "@/components/WeighingView";
import { translations, Language } from "@/lib/translations";

type ViewMode = 'dashboard' | 'weighing';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('weighing');
  const [lang, setLang] = useState<Language>('ko');

  // 언어 로드
  useEffect(() => {
    const savedLang = localStorage.getItem('weighter_lang');
    if (savedLang && ['ko', 'en', 'zh', 'ja'].includes(savedLang)) {
      setLang(savedLang as Language);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('weighter_lang', newLang);
  };

  const t = translations[lang];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] flex overflow-hidden">
      {/* 0. 스플래시 스크린 */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
          <div className="relative flex flex-col items-center gap-2 animate-in zoom-in-95 duration-700">
            {/* 로고 애니메이션 컨테이너 */}
            <div className="relative w-[448px] h-[448px] flex items-center justify-center transition-transform hover:scale-105">
              {/* 1. 차량 본체 (운전석 + 섀시/바퀴) - 미세 진동 */}
              <div className="absolute inset-0 animate-truck">
                <img
                  src="/images/weighter_logo.png"
                  alt="Truck Body"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(255,111,15,0.05)]"
                  style={{ clipPath: 'polygon(0% 0%, 41% 0%, 41% 64.5%, 100% 64.5%, 100% 100%, 0% 100%)' }}
                />
              </div>

              {/* 3. 화물(컨테이너) + 고리 - 함께 동기화 모션 */}
              <div className="absolute inset-0 animate-cargo">
                <img
                  src="/images/weighter_logo.png"
                  alt="Cargo Hook and Container"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,111,15,0.05)]"
                  style={{ clipPath: 'polygon(41% 0%, 100% 0%, 100% 64.5%, 41% 64.5%)' }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-black text-[#FF6F0F] tracking-wider mb-2">
                Weighter
              </h1>
              <p className="text-xl text-[#868B94] font-bold tracking-tight">{t.splashSubtitle}</p>
            </div>
          </div>
          {/* 하단 로딩 바 스타일 */}
          <div className="absolute bottom-20 w-48 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6F0F] animate-[loading-fill_3.5s_linear_forwards]" />
          </div>
        </div>
      )}

      {/* 1. 좌측 고정 사이드바 */}
      <aside
        className={`bg-white border-r border-[#E9ECEF] flex flex-col transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'w-[88px]' : 'w-72'
          }`}
      >
        {/* 접기/펴기 버튼 */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-12 w-8 h-8 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-20 group"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#868B94] group-hover:text-[#FF6F0F]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#868B94] group-hover:text-[#FF6F0F]" />
          )}
        </button>

        {/* 사이드바 상단 로고/프로필 구역 */}
        <div className={`p-6 mb-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          {!isSidebarCollapsed ? (
            <div className="bg-[#F8F9FA] p-5 rounded-[1.5rem] border border-[#EDEDF0] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-[#868B94] font-bold">{t.admin}</p>
                  <p className="font-extrabold text-[#212124]">{t.myAccount}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 mx-auto">
              <User className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* 메뉴 목록 */}
        <nav className="flex-1 px-4 space-y-2">
          {/* 대시보드 */}
          <div
            className={`nav-item-karrot cursor-pointer ${currentView === 'dashboard' ? 'active' : ''} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.dashboard}</span>}
          </div>

          {/* 계량하기 (메인) */}
          <div
            className={`nav-item-karrot cursor-pointer ${currentView === 'weighing' ? 'active' : ''} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setCurrentView('weighing')}
          >
            <Scale className="w-6 h-6" />
            {!isSidebarCollapsed && <span>계량하기</span>}
          </div>

          <div
            className={`nav-item-karrot cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setIsHistoryOpen(true)}
          >
            <History className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.history}</span>}
          </div>
          <div className={`nav-item-karrot ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Package className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.products}</span>}
          </div>
        </nav>

        <div className="p-4 border-t border-[#E9ECEF]">
          <div
            className={`nav-item-karrot cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.settings}</span>}
          </div>
        </div>
      </aside>

      {/* 2. 메인 콘텐츠 구역 */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-[80px] bg-white/80 backdrop-blur-md border-bottom border-[#E9ECEF] flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6F0F] rounded-xl flex items-center justify-center text-white font-black text-xl">W</div>
            <h2 className="text-2xl font-black text-[#212124] tracking-tight">Weighter</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-[#868B94] font-bold">{t.status}</span>
              <span className="text-sm font-black text-[#FF6F0F]">{t.waiting}</span>
            </div>
            {/* 언어 선택 버튼 추가 */}
            <LanguageSelector currentLang={lang} onLanguageChange={handleLanguageChange} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F8F9FA]">
          {currentView === 'dashboard' ? (
            <DashboardView lang={lang} />
          ) : (
            <WeighingView lang={lang} />
          )}
        </div>
      </main>

      {/* 모달 레이어 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenTerms={() => setIsTermsOpen(true)}
        lang={lang}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        lang={lang}
      />
      <WeighingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
      />
    </div>
  );
}
