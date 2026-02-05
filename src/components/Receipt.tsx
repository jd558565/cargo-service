"use client";

import React from "react";
import { Language, translations } from "@/lib/translations";
import { CheckCircle2 } from "lucide-react";

interface ReceiptProps {
    record: {
        vehicleNumber: string;
        gross: number;
        tare: number;
        net: number;
        itemName: string;
        customerName: string;
        remarks: string;
        timestamp: string;
        firstWeightTimestamp?: string | null;
    };
    lang: Language;
}

export default function Receipt({ record, lang }: ReceiptProps) {
    const t = translations[lang];
    const date = new Date(record.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <div className="receipt-container bg-white p-8 w-[380px] font-mono text-[#212124] border border-gray-100 shadow-sm mx-auto overflow-hidden">
            {/* Logo / Header */}
            <div className="text-center space-y-2 mb-8">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-[#FF6F0F] rounded-lg flex items-center justify-center text-white">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter decoration-[#FF6F0F] underline decoration-4 underline-offset-4">WEIGHTER</h1>
                </div>
                <p className="text-[10px] font-bold text-[#868B94] uppercase tracking-[0.2em]">{t.splashSubtitle}</p>
            </div>

            {/* Receipt Info */}
            <div className="border-y-2 border-dashed border-[#E9ECEF] py-4 my-6 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                    <span>DATE</span>
                    <span>{dateStr}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                    <span>TIME</span>
                    <span>{timeStr}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                    <span>TICKET NO.</span>
                    <span>#{record.timestamp.slice(-6)}</span>
                </div>
            </div>

            {/* Vehicle & Item Details */}
            <div className="space-y-4 mb-8">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#FF6F0F] uppercase tracking-wider">{t.vehicleNumber}</label>
                    <p className="text-lg font-black tracking-tight">{record.vehicleNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider">{t.itemName}</label>
                        <p className="text-sm font-bold">{record.itemName || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider">{t.customerName}</label>
                        <p className="text-sm font-bold">{record.customerName || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Weights Area */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 space-y-3 border border-[#E9ECEF]">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#868B94]">{t.grossWeight}</span>
                    <span className="font-black text-lg">{record.gross.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#E9ECEF]">
                    <span className="text-xs font-bold text-[#868B94]">{t.tareWeight}</span>
                    <span className="font-black text-lg">{record.tare.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-black text-[#FF6F0F] tracking-wide">{t.netWeight}</span>
                    <span className="text-3xl font-black text-[#212124]">{record.net.toLocaleString()} kg</span>
                </div>
            </div>

            {/* Remarks */}
            {record.remarks && (
                <div className="mt-8 pt-6 border-t border-dashed border-[#E9ECEF]">
                    <label className="text-[10px] font-black text-[#868B94] uppercase tracking-wider">{t.remarks}</label>
                    <p className="text-[11px] font-bold text-[#4D5159] mt-1 leading-relaxed">{record.remarks}</p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-10 text-center space-y-4">
                <div className="flex justify-center">
                    {/* Mock Barcode */}
                    <div className="h-10 w-full flex gap-1 items-end">
                        {[...Array(40)].map((_, i) => (
                            <div key={i} className={`bg-[#212124] w-[1px] ${i % 3 === 0 ? 'h-full' : i % 2 === 0 ? 'h-4/5' : 'h-3/5'}`} />
                        ))}
                    </div>
                </div>
                <p className="text-[9px] font-black text-[#ADB5BD]">THANK YOU FOR CHOOSING WEIGHTER PREMIER SERVICE</p>
                <div className="pt-4 border-t border-[#F8F9FA]">
                    <p className="text-[8px] font-bold text-[#ADB5BD]">© ANTIGRAVITY CO., LTD. | WWW.ANTIGRAVITY.CO.KR</p>
                </div>
            </div>

            {/* Print Only Styles */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-container, .receipt-container * {
                        visibility: visible;
                    }
                    .receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}
