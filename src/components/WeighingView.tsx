"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Truck, Package, HelpCircle, Edit2, Trash2, Clock, MapPin, Calculator, Building2, FileText } from "lucide-react";
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
    const [pendingRecords, setPendingRecords] = useState<any[]>([]);
    const [printData, setPrintData] = useState<any>(null);
    const [dashboardCards, setDashboardCards] = useState({
        stats: false,
        pending: false,
        recent: false
    });

    // 데이터 로드
    const loadRecords = useCallback(() => {
        const savedExtended = JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
        setExtendedRecords(savedExtended);

        const savedPending = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
        const pendingList = Object.entries(savedPending).map(([vehicleNo, data]: [string, any]) => ({
            vehicleNumber: vehicleNo,
            ...data
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPendingRecords(pendingList);

        const savedCards = JSON.parse(localStorage.getItem("weighter_dashboard_cards") || "{\"stats\":false,\"pending\":false,\"recent\":false}");
        setDashboardCards(savedCards);
    }, []);

    useEffect(() => {
        loadRecords();

        const handleStorage = () => loadRecords();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadRecords, recordTimestamp]);

    const deletePending = (vehicleNo: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const savedPending = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
        delete savedPending[vehicleNo];
        localStorage.setItem("weighter_pending_records", JSON.stringify(savedPending));
        loadRecords();
    };

    const editPending = (vehicleNo: string) => {
        const item = pendingRecords.find(p => p.vehicleNumber === vehicleNo);
        if (!item) return;

        const newRemarks = prompt('비고를 수정해 주세요', item.remarks || "");
        if (newRemarks !== null) {
            const savedPending = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
            if (savedPending[vehicleNo]) {
                savedPending[vehicleNo].remarks = newRemarks;
                localStorage.setItem("weighter_pending_records", JSON.stringify(savedPending));
                loadRecords();
            }
        }
    };

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

            {/* 하단 보조 구역 - 설정에 따라 노출 제어 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {dashboardCards.stats && (
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
                )}

                {dashboardCards.pending && (
                    <div className="karrot-card p-8 bg-white border border-[#E9ECEF]">
                        <h3 className="text-xl font-black text-[#212124] mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#FF6F0F]" />
                            {t.pendingList}
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {pendingRecords.length > 0 ? (
                                pendingRecords.map((record) => (
                                    <div key={record.vehicleNumber} className="relative group/item p-4 bg-[#F8F9FA] rounded-[1.2rem] border border-[#EDEDF0] hover:border-[#FF6F0F] hover:bg-white transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-black text-[#212124] text-sm">{record.vehicleNumber}</p>
                                            <span className="text-[10px] font-bold text-[#FF6F0F] bg-orange-50 px-2 py-0.5 rounded-full">1차 완료</span>
                                        </div>
                                        <div className="space-y-3 mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 bg-orange-50/50 px-2.5 py-1 rounded-[0.8rem] border border-orange-100/50">
                                                    <Calculator className="w-3.5 h-3.5 text-[#FF6F0F]" />
                                                    <span className="text-[11px] font-black text-[#FF6F0F]">{record.weight.toLocaleString()}kg</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-blue-50/50 px-2.5 py-1 rounded-[0.8rem] border border-blue-100/50">
                                                    <Package className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[11px] font-black text-blue-600">{record.itemName || t.products}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 pl-0.5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-[#868B94]">
                                                    <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center border border-[#EDEDF0] shadow-sm">
                                                        <Building2 className="w-3 h-3 text-[#ADB5BD]" />
                                                    </div>
                                                    <span className="truncate">{record.customerName || "-"}</span>
                                                </div>
                                                {record.remarks && (
                                                    <div className="flex items-start gap-2 p-2.5 bg-[#F1F3F5]/50 rounded-[1rem] border border-[#E9ECEF]/50">
                                                        <FileText className="w-3 h-3 mt-0.5 text-[#ADB5BD]" />
                                                        <p className="text-[10px] font-bold text-[#868B94] leading-relaxed italic">
                                                            {record.remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute right-3 bottom-3 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => editPending(record.vehicleNumber)}
                                                className="w-8 h-8 bg-white border border-[#E9ECEF] rounded-lg flex items-center justify-center text-[#868B94] hover:text-[#FF6F0F] hover:border-[#FF6F0F] shadow-sm transition-all"
                                                title={t.edit}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => deletePending(record.vehicleNumber)}
                                                className="w-8 h-8 bg-white border border-[#E9ECEF] rounded-lg flex items-center justify-center text-[#868B94] hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
                                                title={t.delete}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-[#ADB5BD]">
                                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="font-bold text-xs">{t.noPendingData}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {dashboardCards.recent && (
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
                )}
            </div>

            {/* Floating Help Button */}
            <button
                className="fab-help group scale-100 hover:scale-110 active:scale-95 transition-all"
                onClick={() => {
                    // This will be handled in page.tsx by listening to a custom event or shared state
                    window.dispatchEvent(new CustomEvent('open-support-modal'));
                }}
            >
                <HelpCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            </button>

            {/* 인쇄용 티켓 (화면에는 안 보임) */}
            <WeighingTicket data={printData} />
        </div>
    );
}
