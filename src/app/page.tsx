"use client";

import { useEffect, useState, useCallback } from "react";
import WeighingDisplay from "@/components/WeighingDisplay";
import {
  History,
  Settings,
  Package,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
  Truck
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import TermsModal from "@/components/TermsModal";
import LanguageSelector from "@/components/LanguageSelector";
import WeighingCommandBoard from "@/components/WeighingCommandBoard";
import { WeighingTicket } from "@/components/WeighingTicket";
import WeighingHistoryModal from "@/components/WeighingHistoryModal";
import { translations, Language } from "@/lib/translations";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lang, setLang] = useState<Language>('ko');
  const [capturedWeight, setCapturedWeight] = useState<number>(0);
  const [recordTimestamp, setRecordTimestamp] = useState<number>(0);
  const [extendedRecords, setExtendedRecords] = useState<any[]>([]);
  const [printData, setPrintData] = useState<any>(null);

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

  // 기록 로드
  const loadRecords = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
    setExtendedRecords(saved);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, recordTimestamp]);
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

                {/* 2. 배기가스 파티클 (차량 꼬리쪽 - 우측) */}
                <div className="absolute bottom-[20%] right-[18%]">
                  <div className="exhaust-particle w-6 h-6" style={{ animationDelay: '0s' }} />
                  <div className="exhaust-particle w-4 h-4" style={{ animationDelay: '0.3s' }} />
                  <div className="exhaust-particle w-8 h-8" style={{ animationDelay: '0.6s' }} />
                </div>
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
          {/* 하단 로딩 바 스타일 - 3.5초간 서서히 채워지도록 수정 */}
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
          <div className={`nav-item-karrot active ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <LayoutDashboard className="w-6 h-6" />
            {!isSidebarCollapsed && <span>{t.dashboard}</span>}
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
          <div className="max-w-7xl mx-auto space-y-10">
            {/* 상단 섹션: 계량 정보와 컨트롤 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-[#212124] mb-2">{t.realtimeTitle}</h1>
                <p className="text-[#868B94] font-bold">{t.realtimeSubtitle}</p>
              </div>
            </div>

            {/* 계량 구역: 좌 메인측정, 우 명령판 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* 중량 표시 컴포넌트 */}
              <div className="h-full">
                <WeighingDisplay
                  lang={lang}
                  onRecord={(w) => {
                    setCapturedWeight(w);
                    setRecordTimestamp(Date.now());
                  }}
                />
              </div>

              {/* 계량명령판 컴포넌트 */}
              <div className="h-full">
                <WeighingCommandBoard
                  lang={lang}
                  currentWeight={capturedWeight}
                  recordTimestamp={recordTimestamp}
                  onRecordFinish={(record) => {
                    loadRecords();
                    if (record) {
                      setPrintData(record);
                      setTimeout(() => {
                        window.print();
                        setPrintData(null);
                      }, 100);
                    }
                  }}
                />
              </div>
            </div>

            {/* 하단 보조 구역 (예: 상세 정보 카드 등) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="karrot-card p-8 bg-gradient-to-br from-white to-[#FFF9F5]">
                <h3 className="text-xl font-black text-[#212124] mb-4">{t.statsTitle}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[#868B94] font-bold">{t.todayThroughput}</span>
                    <span className="text-2xl font-black text-[#FF6F0F]">2,450 kg</span>
                  </div>
                  <div className="w-full bg-[#EDEDF0] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#FF6F0F] width-[65%] h-full rounded-full" />
                  </div>
                </div>
              </div>

              <div className="karrot-card p-8">
                <h3 className="text-xl font-black text-[#212124] mb-4">{t.recentHistory}</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {extendedRecords.length > 0 ? (
                    extendedRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-[1.2rem] border border-[#EDEDF0] hover:border-[#FF6F0F] transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF6F0F] shadow-sm group-hover:bg-[#FF6F0F] group-hover:text-white transition-all">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-black text-[#212124]">{record.vehicleNumber}</p>
                            <p className="text-[10px] font-bold text-[#ADB5BD]">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <p className="text-xs font-bold text-[#868B94]">{record.itemName || t.products} · <span className="text-[#FF6F0F] font-black">{record.net.toLocaleString()}kg</span></p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-[#ADB5BD]">
                      <Package className="w-12 h-12 mb-2 opacity-20" />
                      <p className="font-bold text-sm">기록이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="karrot-card p-8 bg-[#FF6F0F] text-white">
                <h3 className="text-xl font-bold mb-4 opacity-90">{t.helpTitle}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80">
                  {t.helpContent}
                </p>
              </div>
            </div>
          </div>
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

      {/* 인쇄용 티켓 (화면에는 안 보임) */}
      <WeighingTicket data={printData} />
    </div>
  );
}
