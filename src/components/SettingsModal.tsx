import React, { useState, useEffect } from "react";
import { X, Settings, User, Bell, Shield, ChevronRight, Lock, Headphones, BookOpen, MessageSquare, Info, Camera, Cable, CheckCircle2 } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTerms: () => void;
    lang: Language;
}

type SettingsTab = 'SETTINGS' | 'SUPPORT' | 'ADMIN';

interface Notice {
    id: number;
    title: string;
    content: string;
    date: string;
    isImportant: boolean;
}

interface FAQ {
    id: number;
    category: string;
    question: string;
    answer: string;
}

interface Inquiry {
    id: number;
    title: string;
    content: string;
    status: '문의중' | '답변완료';
    answer?: string;
    timestamp: string;
}

type SupportView = 'MAIN' | 'NOTICES' | 'FAQ' | 'INQUIRIES' | 'NOTICE_DETAIL' | 'NOTICE_CREATE' | 'NOTICE_EDIT' | 'INQUIRY_CREATE' | 'INQUIRY_DETAIL' | 'FAQ_CREATE' | 'FAQ_EDIT';

interface AlertSettings {
    masterEnabled: boolean;
    volume: number;
    soundType: 'BELL' | 'BEEP' | 'SIREN';
    events: {
        weighingComplete: boolean;
        overloadWarning: boolean;
        systemError: boolean;
        inquiryReply: boolean;
        stableArrival: boolean;
        dataTimeout: boolean;
        adminAuth: boolean;
        printReminder: boolean;
    };
    screenFlash: boolean;
}

type SettingsView = 'MENU' | 'ALERTS';

export default function SettingsModal({ isOpen, onClose, onOpenTerms, lang }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('SETTINGS');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // Settings States
    const [cctvEnabled, setCctvEnabled] = useState(false);
    const [baudRate, setBaudRate] = useState("9600");

    // Settings Sub-views
    const [settingsView, setSettingsView] = useState<SettingsView>('MENU');
    const [alertSettings, setAlertSettings] = useState<AlertSettings>({
        masterEnabled: true,
        volume: 80,
        soundType: 'BELL',
        events: {
            weighingComplete: true,
            overloadWarning: true,
            systemError: true,
            inquiryReply: true,
            stableArrival: true,
            dataTimeout: true,
            adminAuth: true,
            printReminder: true
        },
        screenFlash: true
    });

    // Support States
    const [supportView, setSupportView] = useState<SupportView>('MAIN');
    const [notices, setNotices] = useState<Notice[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newInquiry, setNewInquiry] = useState({ title: "", content: "" });
    const [newNotice, setNewNotice] = useState({ title: "", content: "", isImportant: false });
    const [newFAQ, setNewFAQ] = useState({ category: "일반", question: "", answer: "" });
    const [answerInput, setAnswerInput] = useState("");

    useEffect(() => {
        if (isOpen) {
            const settings = JSON.parse(localStorage.getItem("weighter_settings") || "{}");
            setCctvEnabled(settings.cctvEnabled || false);
            setBaudRate(settings.baudRate || "9600");
            setActiveTab('SETTINGS');
            setSettingsView('MENU');
            setIsAdmin(localStorage.getItem("is_admin") === "true");
            setShowAdminPanel(false);
            setSupportView('MAIN');

            // Load Alert Settings
            const savedAlerts = JSON.parse(localStorage.getItem("weighter_alerts") || "null");
            if (savedAlerts) {
                setAlertSettings(savedAlerts);
            }

            // Load Support Data
            const savedNotices = JSON.parse(localStorage.getItem("weighter_notices") || "[]");
            if (savedNotices.length === 0) {
                const initialNotices: Notice[] = [
                    { id: 1, title: "시스템 점검 안내 (2/10)", content: "안정적인 서비스를 위해 시스템 점검이 예정되어 있습니다.", date: "2026-02-05", isImportant: true },
                    { id: 2, title: "v1.2.0 프리미엄 업데이트 배포", content: "대시보드 및 영수증 출력 기능이 포함된 새로운 버전이 배포되었습니다.", date: "2026-02-04", isImportant: false }
                ];
                localStorage.setItem("weighter_notices", JSON.stringify(initialNotices));
                setNotices(initialNotices);
            } else {
                setNotices(savedNotices);
            }

            const savedFaqs = JSON.parse(localStorage.getItem("weighter_faqs") || "[]");
            if (savedFaqs.length === 0) {
                const initialFaqs: FAQ[] = [
                    { id: 1, category: "일반", question: "비밀번호를 잊어버렸어요.", answer: "관리자에게 문의하시거나 초기 비밀번호(1234)를 시도해 보세요." },
                    { id: 2, category: "하드웨어", question: "인디케이터 연결이 안 돼요.", answer: "통신 포트(COM) 설정과 Baud Rate가 일치하는지 확인해 주세요." }
                ];
                localStorage.setItem("weighter_faqs", JSON.stringify(initialFaqs));
                setFaqs(initialFaqs);
            } else {
                setFaqs(savedFaqs);
            }

            const savedInquiries = JSON.parse(localStorage.getItem("weighter_inquiries") || "[]");
            setInquiries(savedInquiries);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const t = translations[lang];

    const saveSettings = (key: string, value: any) => {
        const settings = JSON.parse(localStorage.getItem("weighter_settings") || "{}");
        settings[key] = value;
        localStorage.setItem("weighter_settings", JSON.stringify(settings));
    };

    const updateAlertSettings = (updates: Partial<AlertSettings> | ((prev: AlertSettings) => AlertSettings)) => {
        setAlertSettings(prev => {
            const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
            localStorage.setItem("weighter_alerts", JSON.stringify(next));
            return next;
        });
    };

    const handleAdminAuth = () => {
        if (adminPassword === "1234") { // Mock password
            setIsAdmin(true);
            localStorage.setItem("is_admin", "true");
            setShowAdminPanel(true);
            if (alertSettings.masterEnabled && alertSettings.events.adminAuth) {
                console.log("🔊 Admin Auth Success Sound triggered");
            }
            alert(t.adminAuthSuccess);
            setAdminPassword("");
        } else {
            if (alertSettings.masterEnabled && alertSettings.events.adminAuth) {
                console.log("🔊 Admin Auth Failure (Rejection) Sound triggered");
            }
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    // Support Handlers
    const addNotice = () => {
        if (!isAdmin || !newNotice.title || !newNotice.content) return;
        const freshNotice: Notice = {
            id: Date.now(),
            title: newNotice.title,
            content: newNotice.content,
            date: new Date().toISOString().split('T')[0],
            isImportant: newNotice.isImportant
        };
        const updated = [freshNotice, ...notices];
        localStorage.setItem("weighter_notices", JSON.stringify(updated));
        setNotices(updated);
        setSupportView('NOTICES');
        setNewNotice({ title: "", content: "", isImportant: false });
    };

    const deleteNotice = (id: number) => {
        if (!isAdmin) return;
        const updated = notices.filter(n => n.id !== id);
        localStorage.setItem("weighter_notices", JSON.stringify(updated));
        setNotices(updated);
        setSupportView('NOTICES');
    };

    const updateNotice = () => {
        if (!isAdmin || !selectedId || !newNotice.title || !newNotice.content) return;
        const updated = notices.map(n => {
            if (n.id === selectedId) {
                return { ...n, title: newNotice.title, content: newNotice.content, isImportant: newNotice.isImportant };
            }
            return n;
        });
        localStorage.setItem("weighter_notices", JSON.stringify(updated));
        setNotices(updated);
        setSupportView('NOTICE_DETAIL');
    };

    const addFAQ = () => {
        if (!isAdmin || !newFAQ.question || !newFAQ.answer) return;
        const freshFAQ: FAQ = {
            id: Date.now(),
            category: newFAQ.category,
            question: newFAQ.question,
            answer: newFAQ.answer
        };
        const updated = [...faqs, freshFAQ];
        localStorage.setItem("weighter_faqs", JSON.stringify(updated));
        setFaqs(updated);
        setSupportView('FAQ');
        setNewFAQ({ category: "일반", question: "", answer: "" });
    };

    const updateFAQ = () => {
        if (!isAdmin || !selectedId || !newFAQ.question || !newFAQ.answer) return;
        const updated = faqs.map(f => {
            if (f.id === selectedId) {
                return { ...f, category: newFAQ.category, question: newFAQ.question, answer: newFAQ.answer };
            }
            return f;
        });
        localStorage.setItem("weighter_faqs", JSON.stringify(updated));
        setFaqs(updated);
        setSupportView('FAQ');
    };

    const deleteFAQ = (id: number) => {
        if (!isAdmin) return;
        const updated = faqs.filter(f => f.id !== id);
        localStorage.setItem("weighter_faqs", JSON.stringify(updated));
        setFaqs(updated);
        setSupportView('FAQ');
    };

    const submitInquiry = () => {
        if (!newInquiry.title || !newInquiry.content) return;
        const inquiry: Inquiry = {
            id: Date.now(),
            title: newInquiry.title,
            content: newInquiry.content,
            status: '문의중',
            timestamp: new Date().toISOString()
        };
        const updated = [inquiry, ...inquiries];
        localStorage.setItem("weighter_inquiries", JSON.stringify(updated));
        setInquiries(updated);
        setSupportView('INQUIRIES');
        setNewInquiry({ title: "", content: "" });
    };

    const replyInquiry = (id: number) => {
        if (!isAdmin || !answerInput) return;
        const updated = inquiries.map(iq => {
            if (iq.id === id) {
                return { ...iq, status: '답변완료' as const, answer: answerInput };
            }
            return iq;
        });
        localStorage.setItem("weighter_inquiries", JSON.stringify(updated));
        setInquiries(updated);
        setAnswerInput("");
        setSupportView('INQUIRY_DETAIL');
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-8 border-b border-[#E9ECEF] flex flex-col gap-6 bg-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white">
                                {activeTab === 'SETTINGS' ? <Settings className="w-6 h-6" /> : <Headphones className="w-6 h-6" />}
                            </div>
                            <h2 className="text-xl font-black text-[#212124]">{activeTab === 'SETTINGS' ? t.settingsTitle : t.customerSupport}</h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-[#F8F9FA] flex items-center justify-center text-[#ADB5BD] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-[#F8F9FA] rounded-2xl">
                        <button
                            onClick={() => setActiveTab('SETTINGS')}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'SETTINGS' ? 'bg-white text-[#FF6F0F] shadow-sm' : 'text-[#868B94]'}`}
                        >
                            {t.settings}
                        </button>
                        <button
                            onClick={() => setActiveTab('SUPPORT')}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'SUPPORT' ? 'bg-white text-[#FF6F0F] shadow-sm' : 'text-[#868B94]'}`}
                        >
                            {t.customerSupport}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                    {activeTab === 'SETTINGS' && (
                        <>
                            {settingsView === 'MENU' ? (
                                <>
                                    <div className="px-2 mb-4">
                                        <h3 className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest mb-3">일반 설정</h3>
                                        <div className="space-y-2">
                                            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group text-left">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-[#4D5159]">{t.accountManage}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-[#ADB5BD]" />
                                            </button>
                                            <button
                                                onClick={() => setSettingsView('ALERTS')}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                                                        <Bell className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-[#4D5159]">{t.alertSettings}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-[#ADB5BD]" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-2 mb-4">
                                        <h3 className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest mb-3">관리자/하드웨어 (보호됨)</h3>
                                        <div className="space-y-2">
                                            {(isAdmin && showAdminPanel) ? (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF9F5] border border-[#FFE0CC]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white text-[#FF6F0F] rounded-xl flex items-center justify-center border border-[#FFE0CC]">
                                                                <Camera className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-[#212124]">{t.cctvEnable}</p>
                                                                <p className="text-[10px] text-[#FF6F0F] font-bold">부정계량 자동 방지</p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={cctvEnabled}
                                                            onChange={(e) => { setCctvEnabled(e.target.checked); saveSettings('cctvEnabled', e.target.checked); }}
                                                            className="w-5 h-5 accent-[#FF6F0F]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white text-gray-500 rounded-xl flex items-center justify-center border border-gray-200">
                                                                <Cable className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-[#212124]">{t.commSettings || '통신 설정'}</p>
                                                                <p className="text-[10px] text-[#868B94] font-bold">Indicator Baud Rate: {baudRate}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-[#ADB5BD]" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Lock className="w-4 h-4 text-[#ADB5BD]" />
                                                        <p className="text-xs font-bold text-[#868B94]">{t.requestAdmin}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="password"
                                                            placeholder="Admin Password"
                                                            value={adminPassword}
                                                            onChange={(e) => setAdminPassword(e.target.value)}
                                                            className="flex-1 px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm font-bold outline-none focus:border-[#FF6F0F]"
                                                        />
                                                        <button
                                                            onClick={handleAdminAuth}
                                                            className="px-4 py-2 bg-[#FF6F0F] text-white rounded-xl text-xs font-black shadow-lg shadow-orange-100"
                                                        >
                                                            {t.confirm}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="px-2 space-y-6 animate-in slide-in-from-right-4 pb-8">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setSettingsView('MENU')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> 일반 설정
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-[#868B94] uppercase tracking-wider">알람 마스터</span>
                                            <div
                                                onClick={() => updateAlertSettings({ masterEnabled: !alertSettings.masterEnabled })}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alertSettings.masterEnabled ? 'bg-[#FF6F0F]' : 'bg-[#ADB5BD]'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${alertSettings.masterEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`space-y-6 transition-opacity ${alertSettings.masterEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-5">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-black text-[#212124]">알람 볼륨</p>
                                                    <span className="text-sm font-black text-[#FF6F0F]">{alertSettings.volume}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={alertSettings.volume}
                                                    onChange={(e) => updateAlertSettings({ volume: parseInt(e.target.value) })}
                                                    className="w-full accent-[#FF6F0F] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-sm font-black text-[#212124]">알람 벨소리 테마</p>
                                                <div className="flex gap-2">
                                                    {(['BELL', 'BEEP', 'SIREN'] as const).map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => updateAlertSettings({ soundType: type })}
                                                            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${alertSettings.soundType === type ? 'bg-[#FF6F0F] text-white shadow-lg' : 'bg-white border border-[#E9ECEF] text-[#868B94]'}`}
                                                        >
                                                            {type === 'BELL' ? '종소리' : type === 'BEEP' ? '비프음' : '사이렌'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-1 space-y-4">
                                            <h3 className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">이벤트 알림 토글</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { key: 'weighingComplete', label: '계량 완료 알림', desc: '두 번째 계량이 완료되었을 때 발생' },
                                                    { key: 'stableArrival', label: '중량 안정화 알림', desc: '흔들리던 중량이 고정되었을 때 발생' },
                                                    { key: 'overloadWarning', label: '과적 경고 알림', desc: '허용 중량 초과 시 긴급 경고' },
                                                    { key: 'dataTimeout', label: '수신 지연 알림', desc: '5초 이상 데이터 수신이 없을 때 발생' },
                                                    { key: 'systemError', label: '장비 오류 알림', desc: '연결 유실 등 장비 이상 발생 시' },
                                                    ...(isAdmin ? [{ key: 'adminAuth', label: '관리자 인증 알림', desc: '로그인 성공 또는 실패 시 피드백' }] : []),
                                                    { key: 'inquiryReply', label: '문의 답변 알림', desc: '1:1 문의에 답변이 등록되었을 때' },
                                                    { key: 'printReminder', label: '출력 권장 알림', desc: '계량 저장 후 영수증 출력을 안내' }
                                                ].map(event => (
                                                    <div key={event.key} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#F1F3F5] hover:border-[#E9ECEF] transition-all">
                                                        <div>
                                                            <p className="font-bold text-sm text-[#212124]">{event.label}</p>
                                                            <p className="text-[10px] text-[#ADB5BD] font-medium">{event.desc}</p>
                                                        </div>
                                                        <div
                                                            onClick={() => updateAlertSettings({
                                                                events: { ...alertSettings.events, [event.key]: !alertSettings.events[event.key as keyof typeof alertSettings.events] }
                                                            })}
                                                            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${alertSettings.events[event.key as keyof typeof alertSettings.events] ? 'bg-orange-400' : 'bg-gray-200'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${alertSettings.events[event.key as keyof typeof alertSettings.events] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => updateAlertSettings({ screenFlash: !alertSettings.screenFlash })}
                                            className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${alertSettings.screenFlash ? 'bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-50' : 'bg-[#F8F9FA] border-transparent'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alertSettings.screenFlash ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-sm ${alertSettings.screenFlash ? 'text-blue-700' : 'text-[#868B94]'}`}>스크린 플래시 (시각적 알림)</p>
                                                        <p className="text-[10px] font-bold text-[#ADB5BD]">소리가 들리지 않는 현장용 보조 알림</p>
                                                    </div>
                                                </div>
                                                <CheckCircle2 className={`w-5 h-5 transition-opacity ${alertSettings.screenFlash ? 'opacity-100 text-blue-500' : 'opacity-0'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'SUPPORT' && (
                        <div className="px-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 pb-10">
                            {supportView === 'MAIN' && (
                                <div className="space-y-2">
                                    <button onClick={() => setSupportView('NOTICES')} className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] hover:shadow-xl hover:shadow-gray-50 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 text-[#FF6F0F] rounded-2xl flex items-center justify-center">
                                                <Info className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#212124]">{t.noticeBoard}</p>
                                                <p className="text-xs font-bold text-[#868B94]">시스템 업데이트 및 중요 공지</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
                                    </button>
                                    <button onClick={() => setSupportView('FAQ')} className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] hover:shadow-xl hover:shadow-gray-50 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#212124]">{t.faqBoard}</p>
                                                <p className="text-xs font-bold text-[#868B94]">자주 묻는 질문 모음</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
                                    </button>
                                    <button onClick={() => setSupportView('INQUIRIES')} className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] hover:shadow-xl hover:shadow-gray-50 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#212124]">{t.inquiryBoard}</p>
                                                <p className="text-xs font-bold text-[#868B94]">상담사 1:1 문의 게시판</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
                                    </button>

                                    <div className="bg-[#FFF9F5] p-6 rounded-[2rem] border border-[#FFE0CC] text-center space-y-3 mt-4">
                                        <p className="text-xs font-black text-[#FF6F0F] uppercase tracking-widest">긴급 지원이 필요하신가요?</p>
                                        <p className="text-[11px] font-bold text-[#868B94] leading-relaxed">전화 상담 및 원격 지원은<br />평일 09:00 - 18:00에 가능합니다.</p>
                                        <button className="w-full py-3 bg-[#FF6F0F] text-white rounded-xl font-black text-sm shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform">
                                            {t.connectConsultant}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'NOTICES' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <button onClick={() => setSupportView('MAIN')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> {t.back || '뒤로'}
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => setSupportView('NOTICE_CREATE')} className="px-3 py-1.5 bg-[#FF6F0F] text-white rounded-lg text-xs font-black">
                                                글쓰기
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {notices.map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => { setSelectedId(n.id); setSupportView('NOTICE_DETAIL'); }}
                                                className="w-full p-4 rounded-xl bg-white border border-[#E9ECEF] text-left hover:border-[#FF6F0F] transition-all"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {n.isImportant && <span className="bg-red-50 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded">중요</span>}
                                                    <span className="text-xs font-bold text-[#ADB5BD]">{n.date}</span>
                                                </div>
                                                <p className="font-bold text-[#212124] text-sm truncate">{n.title}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {supportView === 'NOTICE_DETAIL' && selectedId && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setSupportView('NOTICES')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> 목록
                                        </button>
                                        {isAdmin && (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        const n = notices.find(item => item.id === selectedId);
                                                        if (n) {
                                                            setNewNotice({ title: n.title, content: n.content, isImportant: n.isImportant });
                                                            setSupportView('NOTICE_EDIT');
                                                        }
                                                    }}
                                                    className="text-xs font-bold text-[#FF6F0F]"
                                                >
                                                    수정
                                                </button>
                                                <button onClick={() => deleteNotice(selectedId)} className="text-xs font-bold text-red-500">삭제</button>
                                            </div>
                                        )}
                                    </div>
                                    {notices.filter(n => n.id === selectedId).map(n => (
                                        <div key={n.id} className="space-y-4">
                                            <h4 className="text-xl font-black text-[#212124]">{n.title}</h4>
                                            <p className="text-xs font-bold text-[#ADB5BD]">{n.date}</p>
                                            <div className="p-4 bg-[#F8F9FA] rounded-2xl text-sm font-bold text-[#4D5159] leading-relaxed whitespace-pre-wrap">
                                                {n.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {supportView === 'NOTICE_CREATE' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('NOTICES')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 취소
                                    </button>
                                    <div className="space-y-4">
                                        <input
                                            placeholder="제목을 입력하세요"
                                            className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F]"
                                            value={newNotice.title}
                                            onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="내용을 입력하세요"
                                            rows={6}
                                            className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                            value={newNotice.content}
                                            onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={newNotice.isImportant} onChange={e => setNewNotice({ ...newNotice, isImportant: e.target.checked })} className="w-4 h-4 accent-[#FF6F0F]" />
                                            <span className="text-sm font-bold text-[#4D5159]">중요 공지로 고정</span>
                                        </label>
                                        <button onClick={addNotice} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-lg shadow-lg">공지 게시</button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'NOTICE_EDIT' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('NOTICE_DETAIL')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 취소
                                    </button>
                                    <div className="space-y-4">
                                        <input
                                            placeholder="제목"
                                            className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F]"
                                            value={newNotice.title}
                                            onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="내용"
                                            rows={6}
                                            className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                            value={newNotice.content}
                                            onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={newNotice.isImportant} onChange={e => setNewNotice({ ...newNotice, isImportant: e.target.checked })} className="w-4 h-4 accent-[#FF6F0F]" />
                                            <span className="text-sm font-bold text-[#4D5159]">중요 공지로 고정</span>
                                        </label>
                                        <button onClick={updateNotice} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-lg shadow-lg">수정 완료</button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'FAQ' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setSupportView('MAIN')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> {t.back || '뒤로'}
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => { setNewFAQ({ category: "일반", question: "", answer: "" }); setSupportView('FAQ_CREATE'); }} className="px-3 py-1.5 bg-[#FF6F0F] text-white rounded-lg text-xs font-black">
                                                추가
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {faqs.map(f => (
                                            <div key={f.id} className="p-4 rounded-xl bg-white border border-[#E9ECEF] group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-[10px] font-black text-[#FF6F0F]">{f.category}</p>
                                                    {isAdmin && (
                                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setNewFAQ({ category: f.category, question: f.question, answer: f.answer });
                                                                    setSelectedId(f.id);
                                                                    setSupportView('FAQ_EDIT');
                                                                }}
                                                                className="text-[10px] font-bold text-[#FF6F0F]"
                                                            >
                                                                수정
                                                            </button>
                                                            <button onClick={() => deleteFAQ(f.id)} className="text-[10px] font-bold text-red-500">삭제</button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-bold text-[#212124] text-sm mb-2">Q. {f.question}</p>
                                                <p className="p-3 bg-[#F8F9FA] rounded-lg text-xs font-bold text-[#868B94] leading-normal italic">
                                                    A. {f.answer}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {supportView === 'FAQ_CREATE' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('FAQ')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 취소
                                    </button>
                                    <div className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">카테고리</label>
                                            <select
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] appearance-none"
                                                value={newFAQ.category}
                                                onChange={e => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                            >
                                                <option value="일반">일반</option>
                                                <option value="하드웨어">하드웨어</option>
                                                <option value="소프트웨어">소프트웨어</option>
                                                <option value="계정">계정</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">질문</label>
                                            <input
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F]"
                                                value={newFAQ.question}
                                                onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">답변</label>
                                            <textarea
                                                rows={4}
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                                value={newFAQ.answer}
                                                onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                            />
                                        </div>
                                        <button onClick={addFAQ} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-lg shadow-lg">등록 완료</button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'FAQ_EDIT' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('FAQ')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 취소
                                    </button>
                                    <div className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">카테고리</label>
                                            <select
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] appearance-none"
                                                value={newFAQ.category}
                                                onChange={e => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                            >
                                                <option value="일반">일반</option>
                                                <option value="하드웨어">하드웨어</option>
                                                <option value="소프트웨어">소프트웨어</option>
                                                <option value="계정">계정</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">질문</label>
                                            <input
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F]"
                                                value={newFAQ.question}
                                                onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">답변</label>
                                            <textarea
                                                rows={4}
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                                value={newFAQ.answer}
                                                onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                            />
                                        </div>
                                        <button onClick={updateFAQ} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-lg shadow-lg">수정 완료</button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'INQUIRIES' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <button onClick={() => setSupportView('MAIN')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> {t.back || '뒤로'}
                                        </button>
                                        <button onClick={() => setSupportView('INQUIRY_CREATE')} className="px-3 py-1.5 bg-[#FF6F0F] text-white rounded-lg text-xs font-black">
                                            문의하기
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {inquiries.length === 0 ? (
                                            <div className="py-20 text-center space-y-2">
                                                <MessageSquare className="w-10 h-10 text-[#E9ECEF] mx-auto" />
                                                <p className="text-sm font-bold text-[#ADB5BD]">등록된 문의 내역이 없습니다.</p>
                                            </div>
                                        ) : (
                                            inquiries.map(iq => (
                                                <button
                                                    key={iq.id}
                                                    onClick={() => { setSelectedId(iq.id); setSupportView('INQUIRY_DETAIL'); }}
                                                    className="w-full p-4 rounded-xl bg-white border border-[#E9ECEF] text-left hover:border-[#FF6F0F] transition-all flex items-center justify-between"
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="font-bold text-[#212124] text-sm truncate">{iq.title}</p>
                                                        <p className="text-[10px] font-bold text-[#ADB5BD] mt-1">{new Date(iq.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-black ${iq.status === '문의중' ? 'bg-orange-50 text-[#FF6F0F]' : 'bg-green-50 text-green-600'}`}>
                                                        {iq.status}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {supportView === 'INQUIRY_CREATE' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('INQUIRIES')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 취소
                                    </button>
                                    <div className="p-6 bg-[#F8F9FA] rounded-[2rem] border border-[#E9ECEF] space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">문의 제목</label>
                                            <input
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F]"
                                                value={newInquiry.title}
                                                onChange={e => setNewInquiry({ ...newInquiry, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider ml-1">문의 내용</label>
                                            <textarea
                                                rows={5}
                                                className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                                value={newInquiry.content}
                                                onChange={e => setNewInquiry({ ...newInquiry, content: e.target.value })}
                                            />
                                        </div>
                                        <button onClick={submitInquiry} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-lg shadow-lg">문의 등록</button>
                                    </div>
                                </div>
                            )}

                            {supportView === 'INQUIRY_DETAIL' && selectedId && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <button onClick={() => setSupportView('INQUIRIES')} className="text-sm font-bold text-[#868B94] flex items-center gap-1">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 목록
                                    </button>
                                    {inquiries.filter(iq => iq.id === selectedId).map(iq => (
                                        <div key={iq.id} className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black ${iq.status === '문의중' ? 'bg-orange-50 text-[#FF6F0F]' : 'bg-green-50 text-green-600'}`}>
                                                        {iq.status}
                                                    </span>
                                                    <span className="text-xs font-bold text-[#ADB5BD]">{new Date(iq.timestamp).toLocaleString()}</span>
                                                </div>
                                                <h4 className="text-xl font-black text-[#212124]">{iq.title}</h4>
                                                <div className="p-4 bg-white border border-[#E9ECEF] rounded-2xl text-sm font-bold text-[#4D5159] leading-relaxed">
                                                    {iq.content}
                                                </div>
                                            </div>

                                            {iq.status === '답변완료' && (
                                                <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-[#FF6F0F] rounded-lg flex items-center justify-center text-white">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-black text-[#212124]">운영자 답변</span>
                                                    </div>
                                                    <div className="p-5 bg-[#FFF9F5] border border-[#FFE0CC] rounded-2xl text-sm font-bold text-[#FF6F0F] leading-relaxed shadow-sm">
                                                        {iq.answer}
                                                    </div>
                                                </div>
                                            )}

                                            {isAdmin && iq.status === '문의중' && (
                                                <div className="p-6 bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] rounded-[2rem] space-y-4">
                                                    <p className="text-xs font-black text-[#212124] text-center">답변 작성 (관리자 전용)</p>
                                                    <textarea
                                                        rows={3}
                                                        placeholder="사용자에게 보낼 답변을 입력하세요"
                                                        className="w-full p-4 bg-white border border-[#E9ECEF] rounded-xl font-bold outline-none focus:border-[#FF6F0F] resize-none"
                                                        value={answerInput}
                                                        onChange={e => setAnswerInput(e.target.value)}
                                                    />
                                                    <button onClick={() => replyInquiry(iq.id)} className="w-full py-4 bg-[#FF6F0F] text-white rounded-xl font-black text-sm">답변 완료 및 승인</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="px-2 pt-4 border-t border-[#F8F9FA]">
                        <button
                            onClick={() => { onClose(); onOpenTerms(); }}
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 text-[#ADB5BD] rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-[#868B94]">{t.privacyTerms}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#ADB5BD]" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-[#F8F9FA] text-center shrink-0">
                    <p className="text-xs text-[#ADB5BD] font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Weighter v1.2.0 (Premium)
                    </p>
                    <p className="text-[10px] text-[#ADB5BD] mt-1">© Antigravity Co., Ltd. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
