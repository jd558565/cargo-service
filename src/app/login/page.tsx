"use client";

import { useState, useEffect } from "react";
import LoginView from "@/components/LoginView";
import { Language } from "@/lib/translations";

export default function LoginPage() {
    const [lang, setLang] = useState<Language>('ko');

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

    return <LoginView lang={lang} onLanguageChange={handleLanguageChange} />;
}
