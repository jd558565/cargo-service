"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Printer, Trash2, CheckSquare, Square, Search, Download } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface WeighingRecord {
    id: number;
    vehicleNumber: string;
    gross: number;
    tare: number;
    net: number;
    itemName: string;
    customerName: string;
    remarks: string;
    timestamp: string;
    firstWeightTimestamp?: string | null;
}

interface WeighingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export default function WeighingHistoryModal({ isOpen, onClose, lang }: WeighingHistoryModalProps) {
    const t = translations[lang];
    const [records, setRecords] = useState<WeighingRecord[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    // 데이터 로드
    useEffect(() => {
        if (isOpen) {
            const saved = JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
            setRecords(saved);
            setSelectedIds(new Set());
            setSearchTerm("");
        }
    }, [isOpen]);

    // 검색 필터링
    const filteredRecords = useMemo(() => {
        return records.filter(r =>
            r.vehicleNumber.includes(searchTerm) ||
            r.itemName.includes(searchTerm) ||
            r.customerName.includes(searchTerm)
        );
    }, [records, searchTerm]);

    // 전체 선택 토글
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredRecords.map(r => r.id)));
        }
    };

    // 개별 선택 토글
    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    // 선택 내역 출력 (간이 구현 - 콘솔로그 + 윈도우 프린트)
    const handlePrintSelected = () => {
        const selected = records.filter(r => selectedIds.has(r.id));
        if (selected.length === 0) return;

        console.log("Printing selected records:", selected);
        // 실제 운영 환경에서는 인쇄용 레이아웃을 따로 팝업으로 띄우거나 함
        window.print();
    };

    // 선택 내역 삭제
    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        if (!confirm("선택한 내역을 삭제하시겠습니까?")) return;

        const nextRecords = records.filter(r => !selectedIds.has(r.id));
        localStorage.setItem("weighing_records_extended", JSON.stringify(nextRecords));
        setRecords(nextRecords);
        setSelectedIds(new Set());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-[#E9ECEF] flex items-center justify-between bg-[#F8F9FA]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF6F0F] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#212124]">{t.historyTitle}</h3>
                            <p className="text-sm font-bold text-[#868B94]">저장된 계량 이력을 관리하고 출력할 수 있습니다.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center text-[#ADB5BD] hover:text-[#212124] hover:border-[#FF6F0F] transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ADB5BD]" />
                            <input
                                type="text"
                                placeholder="차량번호, 품목, 거래처 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl font-bold text-sm focus:outline-none focus:border-[#FF6F0F] transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-3 bg-white border border-[#E9ECEF] rounded-xl font-bold text-sm text-[#868B94] hover:bg-[#F8F9FA] transition-all flex items-center gap-2"
                        >
                            {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-[#FF6F0F]" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            {t.selectAll}
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.size === 0}
                            className="px-4 py-3 bg-white border border-[#E9ECEF] rounded-xl font-bold text-sm text-[#F44336] hover:bg-[#FFEBEE] transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-white"
                        >
                            <Trash2 className="w-4 h-4" />
                            {translations[lang].deleteSelected || "삭제"}
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                    {filteredRecords.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-[#F8F9FA] z-10">
                                <tr>
                                    <th className="p-4 w-12 border-b border-[#E9ECEF]"></th>
                                    <th className="p-4 text-left text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.vehicleNumber}</th>
                                    <th className="p-4 text-left text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.itemName}</th>
                                    <th className="p-4 text-left text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.customerName}</th>
                                    <th className="p-4 text-right text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.grossWeight}</th>
                                    <th className="p-4 text-right text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.tareWeight}</th>
                                    <th className="p-4 text-right text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.netWeight}</th>
                                    <th className="p-4 text-center text-xs font-black text-[#868B94] uppercase tracking-wider border-b border-[#E9ECEF]">{t.weighingTime}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8F9FA]">
                                {filteredRecords.map((record) => (
                                    <tr
                                        key={record.id}
                                        onClick={() => toggleSelect(record.id)}
                                        className={`hover:bg-[#FFF9F5] transition-all cursor-pointer ${selectedIds.has(record.id) ? 'bg-[#FFF5EE]' : ''}`}
                                    >
                                        <td className="p-4 text-center">
                                            {selectedIds.has(record.id) ? (
                                                <CheckSquare className="w-5 h-5 text-[#FF6F0F] mx-auto" />
                                            ) : (
                                                <Square className="w-5 h-5 text-[#ADB5BD] mx-auto" />
                                            )}
                                        </td>
                                        <td className="p-4 font-black text-[#212124]">{record.vehicleNumber}</td>
                                        <td className="p-4 font-bold text-[#868B94]">{record.itemName}</td>
                                        <td className="p-4 font-bold text-[#868B94]">{record.customerName}</td>
                                        <td className="p-4 text-right font-black text-[#212124]">{record.gross?.toLocaleString()}kg</td>
                                        <td className="p-4 text-right font-black text-[#212124]">{record.tare?.toLocaleString()}kg</td>
                                        <td className="p-4 text-right font-black text-[#FF6F0F] bg-orange-50/30">{record.net?.toLocaleString()}kg</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black text-[#212124]">
                                                    {new Date(record.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#868B94]">
                                                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-[#ADB5BD]">
                            <Search className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-black text-lg">{t.noHistory}</p>
                            <p className="text-sm font-bold opacity-60">저장된 내역이 없거나 검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-between">
                    <div className="text-sm font-bold text-[#868B94]">
                        선택됨: <span className="text-[#FF6F0F] font-black">{selectedIds.size}</span> / 전체: {filteredRecords.length}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-white border-2 border-[#EDEDF0] text-[#868B94] rounded-2xl font-black text-lg hover:border-[#ADB5BD] transition-all"
                        >
                            닫기
                        </button>
                        <button
                            onClick={handlePrintSelected}
                            disabled={selectedIds.size === 0}
                            className="px-10 py-4 bg-[#FF6F0F] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-100 hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            <Printer className="w-6 h-6" />
                            {t.printSelected}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
