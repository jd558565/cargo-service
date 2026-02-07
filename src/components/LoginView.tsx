"use client";

import React, { useState } from "react";
import { User, Lock, QrCode, ChevronRight } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { login, isAuthenticated } from "@/lib/auth";
import LanguageSelector from "@/components/LanguageSelector";

interface LoginViewProps {
    lang: Language;
    onLanguageChange: (lang: Language) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ lang, onLanguageChange }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [autoLogin, setAutoLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrTimer, setQrTimer] = useState(300); // 5 minutes in seconds
    const [isLoginSuccess, setIsLoginSuccess] = useState(false);

    const t = translations[lang];

    // Check if already authenticated on mount for auto-login animation
    React.useEffect(() => {
        if (isAuthenticated()) {
            setIsLoginSuccess(true);
        }
    }, []);

    // QR Timer Effect
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showQrModal && qrTimer > 0) {
            interval = setInterval(() => {
                setQrTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showQrModal, qrTimer]);

    // Post-Login Redirection Effect
    React.useEffect(() => {
        if (isLoginSuccess) {
            const timer = setTimeout(() => {
                window.location.href = "/";
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isLoginSuccess]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setIsError(true);
            setErrorMsg(t.loginErrorEmpty);
            return;
        }

        setIsLoading(true);
        setIsError(false);

        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock validation
        if (username === "admin" && password === "1234") {
            console.log("Login success");
            login("mock-token-" + Date.now(), autoLogin);
            setIsLoginSuccess(true);
        } else {
            setIsError(true);
            setErrorMsg(t.loginErrorInvalid);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-0">
            {/* Language Selector Overlay (Top Right) */}
            <div className="absolute top-4 right-4 z-20">
                <LanguageSelector currentLang={lang} onLanguageChange={onLanguageChange} />
            </div>

            <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
                {/* Logo Section */}
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                    <div className="relative w-96 h-96 flex items-center justify-center">
                        {/* 1. 차량 본체 (운전석 + 섀시/바퀴) - 미세 진동 */}
                        <div className="absolute inset-0 animate-truck">
                            <img
                                src="/images/weighter_logo.png"
                                alt="Truck Body"
                                className="w-full h-full object-contain mix-blend-multiply"
                                style={{ clipPath: 'polygon(0% 0%, 41% 0%, 41% 64.5%, 100% 64.5%, 100% 80%, 0% 80%)' }}
                            />
                        </div>

                        {/* 3. 화물(컨테이너) + 고리 - 함께 동기화 모션 */}
                        <div className="absolute inset-0 animate-cargo">
                            <img
                                src="/images/weighter_logo.png"
                                alt="Cargo Hook and Container"
                                className="w-full h-full object-contain mix-blend-multiply"
                                style={{ clipPath: 'polygon(41% 0%, 100% 0%, 100% 64.5%, 41% 64.5%)' }}
                            />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-[#FF6F0F] tracking-tighter -mt-16">Weighter</h1>
                </div>

                {/* Login Form Section or Progress Bar */}
                {!isLoginSuccess ? (
                    <div className={`w-full flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-150 ${isError ? 'animate-shake' : ''}`}>
                        <form onSubmit={handleLogin} className="flex flex-col">
                            <div className={`bg-white rounded-t-2xl border-x border-t flex items-center px-4 h-14 focus-within:ring-1 focus-within:ring-[#FF6F0F] focus-within:z-10 transition-all ${isError ? 'border-orange-500' : 'border-[#E9ECEF]'}`}>
                                <input
                                    type="text"
                                    placeholder={t.usernamePlaceholder}
                                    className="flex-1 bg-transparent outline-none text-[#212124] placeholder-[#ADB5BD] text-base"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setIsError(false); }}
                                />
                                {username && (
                                    <button type="button" onClick={() => setUsername("")} className="text-[#ADB5BD] hover:text-[#868B94]">
                                        <XCircleIcon size={18} />
                                    </button>
                                )}
                            </div>
                            <div className={`bg-white rounded-b-2xl border flex items-center px-4 h-14 focus-within:ring-1 focus-within:ring-[#FF6F0F] focus-within:z-10 transition-all ${isError ? 'border-orange-500' : 'border-[#E9ECEF]'}`}>
                                <input
                                    type="password"
                                    placeholder={t.passwordPlaceholder}
                                    className="flex-1 bg-transparent outline-none text-[#212124] placeholder-[#ADB5BD] text-base"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setIsError(false); }}
                                />
                                {password && (
                                    <button type="button" onClick={() => setPassword("")} className="text-[#ADB5BD] hover:text-[#868B94]">
                                        <XCircleIcon size={18} />
                                    </button>
                                )}
                            </div>

                            {isError && (
                                <p className="mt-2 text-sm text-orange-500 font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                                    {errorMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`mt-4 w-full h-14 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 ${isLoading ? 'bg-[#FF6F0F]/70 text-white/70 cursor-wait' : 'bg-[#FF6F0F] hover:bg-[#E85A00] text-white'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <SpinnerIcon className="animate-spin w-5 h-5 text-white" />
                                        {t.loginProcessing}
                                    </>
                                ) : (
                                    t.loginButton
                                )}
                            </button>
                        </form>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute w-full h-[1px] bg-[#E9ECEF]"></div>
                            <span className="relative px-4 bg-white text-[#ADB5BD] text-sm font-medium">{t.orText}</span>
                        </div>

                        <button
                            onClick={() => { setShowQrModal(true); setQrTimer(300); }}
                            className="w-full h-14 bg-white border border-[#E9ECEF] hover:bg-neutral-50 text-[#212124] font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        >
                            <QrCode size={20} className="text-[#FF6F0F]" />
                            {t.qrLoginButton}
                        </button>

                        <div className="flex items-center gap-2 mt-2">
                            <div
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => setAutoLogin(!autoLogin)}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${autoLogin ? 'bg-[#FF6F0F] border-[#FF6F0F]' : 'border-[#E9ECEF] group-hover:border-[#ADB5BD]'}`}>
                                    {autoLogin && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-[#4D5159] text-[15px] font-medium">{t.autoLogin}</span>
                            </div>
                            <div className="w-5 h-5 rounded-full border border-[#E9ECEF] flex items-center justify-center text-[#ADB5BD] text-xs italic">i</div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[373px] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
                        <div className="w-48 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-[#FF6F0F] animate-[loading-fill_3.5s_linear_forwards]" />
                        </div>
                        <p className="text-lg text-[#FF6F0F] font-black tracking-tight animate-pulse">
                            {t.loginProcessing}
                        </p>
                    </div>
                )}

                {/* Footer Links */}
                <div className="flex items-center gap-4 text-[#868B94] text-sm font-medium animate-in fade-in duration-1000 delay-500">
                    <button className="hover:text-[#212124] transition-colors">{t.findAccount}</button>
                    <div className="w-[1px] h-3 bg-[#E9ECEF]"></div>
                    <button className="hover:text-[#212124] transition-colors">{t.resetPassword}</button>
                </div>
            </div>

            {/* QR Code Modal Overlay */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowQrModal(false)}></div>
                    <div className="relative bg-white w-full max-w-[360px] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-6 right-6 text-[#ADB5BD] hover:text-[#212124] transition-colors text-2xl"
                        >
                            &times;
                        </button>

                        <div className="p-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mb-6">
                                <QrCode size={32} className="text-[#FF6F0F]" />
                            </div>

                            <h2 className="text-xl font-bold text-[#212124] mb-2">{t.qrModalTitle}</h2>
                            <p className="text-sm text-[#868B94] text-center mb-8">
                                {t.qrModalDesc}
                            </p>

                            <div className="relative w-48 h-48 bg-white border-4 border-[#FF6F0F] rounded-2xl flex items-center justify-center p-2 mb-6">
                                {/* Mock QR Code Image */}
                                <div className="w-full h-full bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=weighter-login-session-123"
                                        alt="Mock QR"
                                        className="w-full h-full p-2 grayscale opacity-80"
                                    />
                                </div>
                                {qrTimer === 0 && (
                                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 text-center">
                                        <p className="text-sm text-[#FF6F0F] font-bold mb-2">{t.qrExpired}</p>
                                        <button
                                            onClick={() => setQrTimer(300)}
                                            className="text-xs text-[#212124] underline underline-offset-4"
                                        >
                                            {t.qrRetry}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-10">
                                <span className="text-sm text-[#868B94]">{t.qrTimeLeft}</span>
                                <span className={`text-sm font-bold ${qrTimer < 60 ? 'text-orange-500' : 'text-[#FF6F0F]'}`}>
                                    {formatTime(qrTimer)}
                                </span>
                                <button
                                    onClick={() => setQrTimer(300)}
                                    className="p-1 text-[#ADB5BD] hover:text-[#FF6F0F] transition-colors"
                                >
                                    <RotateCcwIcon size={14} />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowQrModal(false)}
                                className="text-sm text-[#868B94] hover:text-[#212124] transition-colors underline underline-offset-4"
                            >
                                {t.qrBack}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper components for the window-like header
const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

const MinusIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

const SquareIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
);

const XCircleIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
);

const SpinnerIcon = ({ className, size = 20 }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const RotateCcwIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
);

export default LoginView;
