'use client';

import { useState, useEffect } from 'react';

interface PrintSettings {
    companyName: string; // 고정 항목
    contact: string;     // 고정 항목
    carNumber: string;   // 변동 항목 (기본값)
    itemType: string;    // 변동 항목 (기본값)
    showStamp: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
    companyName: '(주)안티그래비티 로지스틱스',
    contact: '02-1234-5678',
    carNumber: '미등록',
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
                console.error('설정 불러오기 실패');
            }
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('print_settings', JSON.stringify(settings));
        alert('모든 설정이 안전하게 저장되었습니다.');
    };

    const BackButton = () => (
        <button
            onClick={() => onNavigate(currentSubView === 'MENU' ? 'CLOSE' : 'MENU')}
            className="absolute top-0 left-0 flex items-center gap-3 group transition-all"
        >
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <span className="text-3xl">←</span>
            </div>
            <span className="text-xl font-black text-slate-500 group-hover:text-primary transition-colors">이전으로 돌아가기</span>
        </button>
    );

    if (currentSubView === 'MENU') {
        return (
            <div className="relative flex flex-col items-center justify-center py-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="w-full relative mb-16">
                    <BackButton />
                </div>

                <h2 className="text-4xl font-black mb-16 text-slate-900 tracking-tight">인쇄 환경 설정 메뉴</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                    <button
                        onClick={() => onNavigate('TEMPLATE')}
                        className="glass-card p-12 flex flex-col items-center gap-6 hover:scale-105 transition-all border-slate-200 hover:border-primary group"
                    >
                        <span className="text-7xl group-hover:animate-bounce">📄</span>
                        <div className="text-center">
                            <h3 className="font-black text-2xl mb-2 text-slate-800">증명서 양식 설정</h3>
                            <p className="text-lg text-slate-400 font-bold">인쇄되는 문구와 도장 유무를 설정합니다</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate('PRINTER')}
                        className="glass-card p-12 flex flex-col items-center gap-6 hover:scale-105 transition-all border-slate-200 hover:border-primary group"
                    >
                        <span className="text-7xl group-hover:animate-spin-slow">🖨️</span>
                        <div className="text-center">
                            <h3 className="font-black text-2xl mb-2 text-slate-800">프린터 상태 확인</h3>
                            <p className="text-lg text-slate-400 font-bold">현재 연결된 프린터의 상태를 확인합니다</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (currentSubView === 'TEMPLATE') {
        return (
            <div className="relative flex flex-col items-center w-full max-w-4xl animate-in fade-in slide-in-from-right-8 duration-500 py-6">
                <div className="w-full relative mb-12">
                    <BackButton />
                </div>

                <h2 className="text-3xl font-black mb-10 text-slate-900 tracking-tight">계량 증명서 양식 설정</h2>

                <div className="w-full flex flex-col gap-8">
                    <div className="glass-card p-10 flex flex-col gap-10 border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* 고정 항목 */}
                            <div className="flex flex-col gap-6">
                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary/10 pb-3">공통 정보 (회사 정보)</h4>
                                <div className="flex flex-col gap-3">
                                    <label className="text-lg font-black text-slate-600">상호명 / 회사 이름</label>
                                    <input
                                        type="text"
                                        value={settings.companyName}
                                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                        className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-lg font-black text-slate-600">연락처 / 전화번호</label>
                                    <input
                                        type="text"
                                        value={settings.contact}
                                        onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
                                        className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* 변동 항목 */}
                            <div className="flex flex-col gap-6">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-3">기본 정보 (차량 및 물품)</h4>
                                <div className="flex flex-col gap-3">
                                    <label className="text-lg font-black text-slate-600">차량 번호 (미등록 시 입력)</label>
                                    <input
                                        type="text"
                                        value={settings.carNumber}
                                        onChange={(e) => setSettings({ ...settings, carNumber: e.target.value })}
                                        className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-lg font-black text-slate-600">품목 이름</label>
                                    <input
                                        type="text"
                                        value={settings.itemType}
                                        onChange={(e) => setSettings({ ...settings, itemType: e.target.value })}
                                        className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-[2px] bg-slate-100 my-4" />

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-xl font-black text-slate-800">인쇄물에 '계량인' 도장 포함하기</h4>
                                <p className="text-lg text-slate-400 font-bold text-slate-500">출력되는 종이 하단에 확인 도장을 함께 찍습니다.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showStamp: !settings.showStamp })}
                                className={`w-20 h-10 rounded-full transition-all relative shadow-inner ${settings.showStamp ? 'bg-primary' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all ${settings.showStamp ? 'left-11' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-6 mt-6">
                        <button
                            onClick={saveSettings}
                            className="flex-1 btn-large btn-primary shadow-2xl shadow-primary/30"
                        >
                            💾 변경한 설정 평생 저장하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentSubView === 'PRINTER') {
        return (
            <div className="relative flex flex-col items-center w-full max-w-4xl animate-in fade-in slide-in-from-right-8 duration-500 py-6">
                <div className="w-full relative mb-12">
                    <BackButton />
                </div>

                <h2 className="text-3xl font-black mb-10 text-slate-900 tracking-tight">프린터 상태 확인 및 관리</h2>

                <div className="w-full flex flex-col gap-8">
                    <div className="glass-card p-10 flex flex-col gap-10 border-slate-200">
                        <div className="flex items-center gap-8">
                            <div className="w-28 h-28 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-sm text-6xl">
                                🖨️
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-slate-900">삼성 C56x 시리즈 프린터</h3>
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                    <p className="text-xl text-primary font-black">정상 작동 중 / 인쇄 준비 완료</p>
                                </div>
                                <p className="text-lg text-slate-400 font-bold">네트워크 연결 주소: 172.30.1.45 (정상)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-3">
                                <span className="text-sm text-slate-400 font-black uppercase tracking-widest">토너(먹물) 잔량</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[85%]" />
                                    </div>
                                    <span className="text-xl font-black text-slate-700">85%</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-3">
                                <span className="text-sm text-slate-400 font-black uppercase tracking-widest">남은 종이 상태</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-xl font-black text-slate-700">A4 용지 넉넉함</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-3">
                                <span className="text-sm text-slate-400 font-black uppercase tracking-widest">최근 인쇄 성공 여부</span>
                                <span className="text-xl font-black text-slate-700">정상적으로 출력됨</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 p-6 bg-slate-900 rounded-3xl border border-slate-800 font-mono text-sm leading-relaxed">
                            <p className="text-slate-500 font-bold">[오후 2:44] 프린터가 컴퓨터와 성공적으로 연결되었습니다.</p>
                            <p className="text-slate-500 font-bold">[오후 2:45] 상태 점검: 모든 부품이 정상입니다.</p>
                            <p className="text-primary font-bold">[오후 2:46] 마지막 인쇄 작업: 1페이지 출력 완료</p>
                        </div>
                    </div>

                    <button
                        onClick={() => alert('프린터로 테스트 인쇄를 보냈습니다.')}
                        className="w-full btn-large btn-secondary border-2 shadow-lg"
                    >
                        📄 종이가 잘 나오는지 테스트 인쇄해보기
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
