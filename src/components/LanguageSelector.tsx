"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface LanguageSelectorProps {
    currentLang: Language;
    onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: "ko", name: "한국어", flag: "🇰🇷" },
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "zh", name: "中文", flag: "🇨🇳" },
        { code: "ja", name: "日本語", flag: "🇯🇵" },
    ];

    const t = translations[currentLang];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-2xl font-bold text-[#4D5159] hover:bg-[#F8F9FA] transition-all"
            >
                <Globe className="w-4 h-4 text-[#FF6F0F]" />
                <span className="text-sm">{t.languageLabel}</span>
                <ChevronDown className={`w-4 h-4 text-[#ADB5BD] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[1.5rem] shadow-xl border border-[#E9ECEF] overflow-hidden z-[120] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onLanguageChange(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${currentLang === lang.code ? "bg-[#FFF9F5] text-[#FF6F0F]" : "hover:bg-[#F8F9FA] text-[#4D5159]"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="font-bold text-sm tracking-tight">{lang.name}</span>
                                </div>
                                {currentLang === lang.code && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
