'use client';

import { useState, useEffect } from 'react';

interface PrintSettings {
    companyName: string; // Static
    contact: string;     // Static
    carNumber: string;   // Dynamic (default)
    itemType: string;    // Dynamic (default)
    showStamp: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
    companyName: '(주)안티그래비티 로지스틱스',
    contact: '02-1234-5678',
    carNumber: '서울 12가 3456',
    itemType: '일반 화물',
    showStamp: true
};

interface Props {
    currentSubView: 'MENU' | 'TEMPLATE' | 'PRINTER';
    onNavigate: (view: 'MENU' | 'TEMPLATE' | 'PRINTER' | 'CLOSE') => void;
}

export default function PrintEnvSettings({ currentSubView, onNavigate }: Props) {
    const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const saved = localStorage.getItem('print_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load settings');
            }
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('print_settings', JSON.stringify(settings));
        alert('설정이 저장되었습니다.');
    };

    const BackButton = () => (
        <button
            onClick={() => onNavigate(currentSubView === 'MENU' ? 'CLOSE' : 'MENU')}
            className="absolute top-8 left-8 flex items-center gap-2 group transition-all"
        >
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <span className="text-xl group-hover:text-black group-hover:-translate-x-1 transition-all">←</span>
            </div>
            <span className="text-[12px] font-bold text-dim group-hover:text-white uppercase tracking-widest">돌아가기</span>
        </button>
    );

    if (currentSubView === 'MENU') {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-[500px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BackButton />
                <h2 className="text-2xl font-black mb-12 gradient-text uppercase tracking-tighter">인쇄 환경 설정</h2>

                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-8">
                    <button
                        onClick={() => onNavigate('TEMPLATE')}
                        className="glass-card p-12 flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all border-white/10 hover:border-primary/50 group"
                    >
                        <span className="text-4xl group-hover:animate-bounce">📄</span>
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-1">양식 설정</h3>
                            <p className="text-[11px] text-dim">증명서 문구 및 직인 설정</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate('PRINTER')}
                        className="glass-card p-12 flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all border-white/10 hover:border-primary/50 group"
                    >
                        <span className="text-4xl group-hover:animate-spin-slow">🖨️</span>
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-1">프린터 설정</h3>
                            <p className="text-[11px] text-dim">출력 장치 정보 및 모니터링</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (currentSubView === 'TEMPLATE') {
        return (
            <div className="relative flex flex-col items-center w-full max-w-3xl animate-in fade-in slide-in-from-right-4 duration-500">
                <BackButton />
                <h2 className="text-xl font-black mb-8 gradient-text uppercase tracking-tight mt-4">계량 증명서 양식 설정</h2>

                <div className="w-full flex flex-col gap-6">
                    <div className="glass-card p-8 flex flex-col gap-6 border-white/5">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Static Fields */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-bold text-dim uppercase tracking-widest border-b border-white/5 pb-2">고정 정보 (변경 적음)</h4>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-dim ml-1">상호 / 회사명</label>
                                    <input
                                        type="text"
                                        value={settings.companyName}
                                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-dim ml-1">대표 번호</label>
                                    <input
                                        type="text"
                                        value={settings.contact}
                                        onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields (Defaults) */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-bold text-dim uppercase tracking-widest border-b border-white/5 pb-2">변동 정보 (기본값)</h4>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-dim ml-1">차량 번호</label>
                                    <input
                                        type="text"
                                        value={settings.carNumber}
                                        onChange={(e) => setSettings({ ...settings, carNumber: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-dim ml-1">품목명</label>
                                    <input
                                        type="text"
                                        value={settings.itemType}
                                        onChange={(e) => setSettings({ ...settings, itemType: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] bg-white/5 my-2" />

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold">인쇄 직인(도장) 포함</h4>
                                <p className="text-[11px] text-dim">출력 시 계량원 확인 직인을 포함합니다.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showStamp: !settings.showStamp })}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.showStamp ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.showStamp ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={saveSettings}
                            className="flex-1 py-4 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            설정 저장하기
                        </button>
                        <button
                            onClick={() => alert('파일 선택 창이 열립니다 (임시)')}
                            className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                            양식 파일 첨부
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentSubView === 'PRINTER') {
        return (
            <div className="relative flex flex-col items-center w-full max-w-3xl animate-in fade-in slide-in-from-right-4 duration-500">
                <BackButton />
                <h2 className="text-xl font-black mb-8 gradient-text uppercase tracking-tight mt-4">프린터 설정 및 모니터링</h2>

                <div className="w-full flex flex-col gap-6">
                    <div className="glass-card p-8 flex flex-col gap-8 border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-4xl">🖨️</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-bold">SEC842519CEE8B (C56x Series)</h3>
                                <p className="text-sm text-primary font-bold">● 온라인 / 준비됨</p>
                                <p className="text-[11px] text-dim">IP Address: 172.30.1.45 (WSD Port)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                <span className="text-[10px] text-dim font-bold uppercase tracking-widest block mb-2">토너 잔량</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[85%]" />
                                    </div>
                                    <span className="text-xs font-bold">85%</span>
                                </div>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                <span className="text-[10px] text-dim font-bold uppercase tracking-widest block mb-2">용지 상태</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-xs font-bold">A4 카세트 충분</span>
                                </div>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                <span className="text-[10px] text-dim font-bold uppercase tracking-widest block mb-2">최근 작업</span>
                                <span className="text-xs font-bold">증명서 1건 (성공)</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[10px]">
                            <p className="text-dim">[12:44:12] Printer Connected via WSD</p>
                            <p className="text-dim">[12:45:01] Status Check: Ready</p>
                            <p className="text-primary font-bold">[12:46:22] Print Spooled: 1 Page(s)</p>
                        </div>
                    </div>

                    <button
                        onClick={() => alert('테스트 페이지 인쇄가 전송되었습니다.')}
                        className="w-full py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 active:scale-95 transition-all border border-white/10"
                    >
                        테스트 페이지 인쇄
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
