"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Package,
  HelpCircle,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Calculator,
  History,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
  Scale,
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import TermsModal from "@/components/TermsModal";
import LanguageSelector from "@/components/LanguageSelector";
import WeighingHistoryModal from "@/components/WeighingHistoryModal";
import DashboardView from "@/components/DashboardView";
import WeighingView from "@/components/WeighingView";
import { translations, Language } from "@/lib/translations";
import { isAuthenticated, logout } from "@/lib/auth";

type ViewMode = 'dashboard' | 'weighing';

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'SETTINGS' | 'SUPPORT' | 'ADMIN' | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewMode>('weighing');
  const [lang, setLang] = useState<Language>('ko');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 언어 로드 및 인증 체크
  useEffect(() => {
    // Auth Guard
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    setIsAuthChecking(false);

    const savedLang = localStorage.getItem('weighter_lang');
    if (savedLang && ['ko', 'en', 'zh', 'ja'].includes(savedLang)) {
      setLang(savedLang as Language);
    }

    const handleOpenSupport = () => {
      setSettingsInitialTab('SUPPORT');
      setIsSettingsOpen(true);
    };
    window.addEventListener('open-support-modal', handleOpenSupport);
    return () => window.removeEventListener('open-support-modal', handleOpenSupport);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('weighter_lang', newLang);
  };

  const t = translations[lang];

  if (isAuthChecking) return <div className="min-h-screen bg-white" />;

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] flex overflow-hidden">

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
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <History className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.history}</span>}
          </div>
          <div className={`nav-item-karrot ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Package className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.products}</span>}
          </div>
        </nav>

        <div className="p-4 border-t border-[#E9ECEF] space-y-2">
          <div
            className={`nav-item-karrot cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.settings}</span>}
          </div>
          <div
            className={`nav-item-karrot cursor-pointer text-orange-500 hover:bg-orange-50 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            onClick={() => logout()}
          >
            <LogOut className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.logout}</span>}
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
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
