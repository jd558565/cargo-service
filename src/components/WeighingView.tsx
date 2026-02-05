"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Truck, Package } from "lucide-react";
import WeighingDisplay from "@/components/WeighingDisplay";
import WeighingCommandBoard from "@/components/WeighingCommandBoard";
import { WeighingTicket } from "@/components/WeighingTicket";
import { Language, translations } from "@/lib/translations";

interface WeighingViewProps {
    lang: Language;
}

export default function WeighingView({ lang }: WeighingViewProps) {
    const t = translations[lang];
    const [capturedWeight, setCapturedWeight] = useState<number>(0);
    const [recordTimestamp, setRecordTimestamp] = useState<number>(0);
    const [extendedRecords, setExtendedRecords] = useState<any[]>([]);
    const [printData, setPrintData] = useState<any>(null);

    // 기록 로드
    const loadRecords = useCallback(() => {
        const saved = JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
        setExtendedRecords(saved);
    }, []);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, recordTimestamp]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* 상단 섹션: 계량 정보와 컨트롤 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#212124] mb-2">{t.realtimeTitle}</h1>
                    <p className="text-[#868B94] font-bold">{t.realtimeSubtitle}</p>
                </div>
            </div>

            {/* 계량 구역: 좌 메인측정, 우 명령판 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* 중량 표시 컴포넌트 */}
                <div className="h-full">
                    <WeighingDisplay
                        lang={lang}
                        onRecord={(w) => {
                            setCapturedWeight(w);
                            setRecordTimestamp(Date.now());
                        }}
                    />
                </div>

                {/* 계량명령판 컴포넌트 */}
                <div className="h-full">
                    <WeighingCommandBoard
                        lang={lang}
                        currentWeight={capturedWeight}
                        recordTimestamp={recordTimestamp}
                        onRecordFinish={(record) => {
                            loadRecords();
                            if (record) {
                                setPrintData(record);
                                setTimeout(() => {
                                    window.print();
                                    setPrintData(null);
                                }, 100);
                            }
                        }}
                    />
                </div>
            </div>

            {/* 하단 보조 구역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="karrot-card p-8 bg-gradient-to-br from-white to-[#FFF9F5]">
                    <h3 className="text-xl font-black text-[#212124] mb-4">{t.statsTitle}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[#868B94] font-bold">{t.todayThroughput}</span>
                            <span className="text-2xl font-black text-[#FF6F0F]">2,450 kg</span>
                        </div>
                        <div className="w-full bg-[#EDEDF0] h-3 rounded-full overflow-hidden">
                            <div className="bg-[#FF6F0F] width-[65%] h-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="karrot-card p-8">
                    <h3 className="text-xl font-black text-[#212124] mb-4">{t.recentHistory}</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {extendedRecords.length > 0 ? (
                            extendedRecords.slice(0, 5).map((record) => (
                                <div key={record.id} className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-[1.2rem] border border-[#EDEDF0] hover:border-[#FF6F0F] transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF6F0F] shadow-sm group-hover:bg-[#FF6F0F] group-hover:text-white transition-all">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-black text-[#212124]">{record.vehicleNumber}</p>
                                            <p className="text-[10px] font-bold text-[#ADB5BD]">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className="text-xs font-bold text-[#868B94]">{record.itemName || t.products} · <span className="text-[#FF6F0F] font-black">{record.net.toLocaleString()}kg</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-[#ADB5BD]">
                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                <p className="font-bold text-sm">기록이 없습니다</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="karrot-card p-8 bg-[#FF6F0F] text-white">
                    <h3 className="text-xl font-bold mb-4 opacity-90">{t.helpTitle}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-80">
                        {t.helpContent}
                    </p>
                </div>
            </div>

            {/* 인쇄용 티켓 (화면에는 안 보임) */}
            <WeighingTicket data={printData} />
        </div>
    );
}
