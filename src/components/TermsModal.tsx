"use client";

import React from "react";
import { X, ShieldCheck, FileText, ScrollText } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export default function TermsModal({ isOpen, onClose, lang }: TermsModalProps) {
    if (!isOpen) return null;

    const t = translations[lang];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-[#E9ECEF] flex items-center justify-between bg-gradient-to-r from-white to-[#FFF9F5]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF6F0F]/10 rounded-2xl flex items-center justify-center text-[#FF6F0F]">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#212124]">{t.privacyTerms}</h2>
                            <p className="text-sm text-[#868B94] font-bold">{t.serviceIntro}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl hover:bg-[#F8F9FA] flex items-center justify-center text-[#868B94] transition-colors group"
                    >
                        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-[#F8F9FA]/30 custom-scrollbar">
                    {/* Section: Welcome */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FF6F0F]">
                            <ScrollText className="w-5 h-5" />
                            <h3 className="text-xl font-bold">{t.termsWelcome}</h3>
                        </div>
                        <div className="karrot-card p-8 bg-white space-y-4 leading-relaxed text-[#4D5159]">
                            <p>{t.termsWelcomeDesc1}</p>
                            <p>{t.termsWelcomeDesc2}</p>
                        </div>
                    </section>

                    {/* Section: Definitions */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FF6F0F]">
                            <FileText className="w-5 h-5" />
                            <h3 className="text-xl font-bold">{t.termsDefinition}</h3>
                        </div>
                        <div className="karrot-card p-8 bg-white space-y-6 text-[#4D5159]">
                            <div className="space-y-2">
                                <p className="font-extrabold text-[#212124]">{t.term1Title}</p>
                                <p>{t.term1Desc}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-extrabold text-[#212124]">{t.term2Title}</p>
                                <p>{t.term2Desc}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-extrabold text-[#212124]">{t.term3Title}</p>
                                <p>{t.term3Desc}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Privacy */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-[#FF6F0F]">
                            <ShieldCheck className="w-5 h-5" />
                            <h3 className="text-xl font-bold">{t.privacyTitle}</h3>
                        </div>
                        <div className="karrot-card p-8 bg-gradient-to-br from-[#FFF9F5] to-white border-[#FF6F0F]/10 space-y-4 text-[#4D5159]">
                            <p className="font-bold">{t.privacyDesc}</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><span className="font-bold">{t.ipItemTitle}</span> {t.ipItemValue}</li>
                                <li><span className="font-bold">{t.ipPurposeTitle}</span> {t.ipPurposeValue}</li>
                                <li><span className="font-bold">{t.ipPeriodTitle}</span> {t.ipPeriodValue}</li>
                            </ul>
                            <div className="p-4 bg-[#F8F9FA] rounded-xl text-sm border border-[#E9ECEF]">
                                {t.privacyFootnote}
                            </div>
                        </div>
                    </section>

                    {/* Add more sections as needed based on deep analysis */}
                    <section className="pt-8 text-center text-[#868B94]">
                        <p className="text-sm">{t.announcementDate}</p>
                        <p className="text-sm font-bold">{t.effectiveDate}</p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#E9ECEF] flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-[#FF6F0F] text-white font-black rounded-2xl hover:bg-[#E8650E] transition-all hover:scale-105 shadow-lg shadow-orange-100"
                    >
                        {t.closeModal}
                    </button>
                </div>
            </div>
        </div>
    );
}
