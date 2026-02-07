"use client";

import React from "react";
import { Language, translations } from "@/lib/translations";

interface SplashViewProps {
    lang: Language;
    showSplash: boolean;
}

const SplashView: React.FC<SplashViewProps> = ({ lang, showSplash }) => {
    const t = translations[lang];

    if (!showSplash) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 sm:p-0 animate-out fade-out duration-1000 fill-mode-forwards">
            <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
                {/* 로고 섹션 (LoginView와 1:1 매칭) */}
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

                    <h1 className="text-5xl font-black text-[#FF6F0F] tracking-tighter -mt-16">
                        Weighter
                    </h1>
                </div>

                {/* 로그인 폼 자리차지를 위한 투명 더미 (373px = Login Form 289px + Footer 20px + Gaps) */}
                <div className="w-full h-[373px] flex flex-col items-center justify-between">
                    <p className="text-xl text-[#868B94] font-bold tracking-tight animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
                        {t.splashSubtitle}
                    </p>

                    {/* 로딩 바 */}
                    <div className="w-48 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden mb-8">
                        <div className="h-full bg-[#FF6F0F] animate-[loading-fill_3.5s_linear_forwards]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplashView;
