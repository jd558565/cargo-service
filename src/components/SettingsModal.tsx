"use client";

import React from "react";
import { X, Settings, User, Bell, Shield, ChevronRight } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTerms: () => void;
    lang: Language;
}

export default function SettingsModal({ isOpen, onClose, onOpenTerms, lang }: SettingsModalProps) {
    if (!isOpen) return null;

    const t = translations[lang];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-[#E9ECEF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-[#212124]">{t.settingsTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-[#F8F9FA] flex items-center justify-center text-[#868B94] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2">
                    {/* Menu Items */}
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-[#4D5159]">{t.accountManage}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#ADB5BD] group-hover:text-[#FF6F0F] transition-colors" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                                <Bell className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-[#4D5159]">{t.alertSettings}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#ADB5BD] group-hover:text-[#FF6F0F] transition-colors" />
                    </button>

                    <button
                        onClick={() => {
                            onClose();
                            onOpenTerms();
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#F8F9FA] transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-50 text-[#FF6F0F] rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-[#4D5159]">{t.privacyTerms}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#ADB5BD] group-hover:text-[#FF6F0F] transition-colors" />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-8 bg-[#F8F9FA] text-center">
                    <p className="text-xs text-[#ADB5BD] font-bold">Weighter v1.0.0</p>
                    <p className="text-[10px] text-[#ADB5BD] mt-1">© Antigravity Co., Ltd. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
