"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Printer, Trash2, CheckSquare, Square, Search, Download, FileText } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import Receipt from "./Receipt";

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
    modified?: boolean;
    editHistory?: any[];
    cctvSnapshot?: string;
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
    const [detailRecord, setDetailRecord] = useState<WeighingRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<WeighingRecord>>({});
    const [printingRecord, setPrintingRecord] = useState<WeighingRecord | null>(null);

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
        const selected = filteredRecords.filter(r => selectedIds.has(r.id));
        if (selected.length === 0) return;

        setPrintingRecord(selected[0]);
        setTimeout(() => {
            window.print();
            setPrintingRecord(null);
        }, 100);
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

    const handleSaveEdit = () => {
        if (!detailRecord) return;

        const historyLog = detailRecord.editHistory || [];
        const newLogEntry: any = {
            timestamp: Date.now(),
            changes: []
        };

        let isChanged = false;
        const updatedRecord = { ...detailRecord, ...editValues, modified: true };

        const fieldsToTrack: (keyof WeighingRecord)[] = ['vehicleNumber', 'itemName', 'customerName', 'remarks'];
        fieldsToTrack.forEach(field => {
            if (editValues[field] !== undefined && editValues[field] !== detailRecord[field]) {
                newLogEntry.changes.push({
                    field,
                    old: detailRecord[field],
                    new: editValues[field]
                });
                isChanged = true;
            }
        });

        if (!isChanged) {
            setIsEditing(false);
            return;
        }

        updatedRecord.editHistory = [...historyLog, newLogEntry];

        const nextRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
        localStorage.setItem("weighing_records_extended", JSON.stringify(nextRecords));
        setRecords(nextRecords);
        setDetailRecord(updatedRecord);
        setIsEditing(false);
    };

    const handlePrint = (record: WeighingRecord) => {
        setPrintingRecord(record);
        setTimeout(() => {
            window.print();
            setPrintingRecord(null);
        }, 100);
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
                                        className={`hover:bg-[#FFF9F5] transition-all cursor-pointer ${selectedIds.has(record.id) ? 'bg-[#FFF5EE]' : ''}`}
                                    >
                                        <td className="p-4 text-center" onClick={(e) => { e.stopPropagation(); toggleSelect(record.id); }}>
                                            {selectedIds.has(record.id) ? (
                                                <CheckSquare className="w-5 h-5 text-[#FF6F0F] mx-auto" />
                                            ) : (
                                                <Square className="w-5 h-5 text-[#ADB5BD] mx-auto" />
                                            )}
                                        </td>
                                        <td className="p-4 font-black text-[#212124]" onClick={() => setDetailRecord(record)}>
                                            <div className="flex items-center gap-2">
                                                {record.vehicleNumber}
                                                {record.modified && (
                                                    <span className="text-[9px] bg-[#E3F2FD] text-[#1976D2] px-1.5 py-0.5 rounded-md font-bold">수정됨</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-[#868B94]" onClick={() => setDetailRecord(record)}>{record.itemName}</td>
                                        <td className="p-4 font-bold text-[#868B94]" onClick={() => setDetailRecord(record)}>{record.customerName}</td>
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

            </div>

            {/* Detail View Modal Overlay */}
            {detailRecord && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-end">
                    <div className="bg-white h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-8 border-b border-[#E9ECEF] flex items-center justify-between bg-[#F8F9FA]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FF6F0F] rounded-xl flex items-center justify-center text-white">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black text-[#212124]">계량 상세 정보</h4>
                            </div>
                            <button onClick={() => { setDetailRecord(null); setIsEditing(false); }} className="p-2 hover:bg-white rounded-full transition-all">
                                <X className="w-6 h-6 text-[#ADB5BD]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {/* CCTV Snapshot Section */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-black text-[#868B94] uppercase tracking-wider">CCTV 스냅샷 (부정계량 방지)</h5>
                                {detailRecord.cctvSnapshot ? (
                                    <div className="rounded-[1.5rem] overflow-hidden border border-[#E9ECEF] bg-black aspect-video relative group">
                                        <img src={detailRecord.cctvSnapshot} alt="Snapshot" className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                            <p className="text-[10px] text-white font-bold">계량 시점 자동 캡처됨 · {new Date(detailRecord.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-[1.5rem] border-2 border-dashed border-[#E9ECEF] py-12 flex flex-col items-center justify-center text-[#ADB5BD]">
                                        <Download className="w-10 h-10 mb-2 opacity-20" />
                                        <p className="text-sm font-bold">저장된 이미지가 없습니다.</p>
                                    </div>
                                )}
                            </div>

                            {/* Data Section */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">{t.vehicleNumber}</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editValues.vehicleNumber ?? detailRecord.vehicleNumber}
                                                onChange={e => setEditValues({ ...editValues, vehicleNumber: e.target.value })}
                                                className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg font-bold outline-none border-[#FF6F0F]"
                                            />
                                        ) : (
                                            <p className="text-lg font-black text-[#212124]">{detailRecord.vehicleNumber}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">{t.itemName}</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editValues.itemName ?? detailRecord.itemName}
                                                onChange={e => setEditValues({ ...editValues, itemName: e.target.value })}
                                                className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg font-bold outline-none border-[#FF6F0F]"
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-[#212124]">{detailRecord.itemName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">{t.customerName}</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editValues.customerName ?? detailRecord.customerName}
                                                onChange={e => setEditValues({ ...editValues, customerName: e.target.value })}
                                                className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg font-bold outline-none border-[#FF6F0F]"
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-[#212124]">{detailRecord.customerName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">{t.remarks}</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editValues.remarks ?? detailRecord.remarks}
                                                onChange={e => setEditValues({ ...editValues, remarks: e.target.value })}
                                                className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg font-bold outline-none border-[#FF6F0F] resize-none"
                                                rows={2}
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-[#868B94]">{detailRecord.remarks || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#FFF9F5] p-6 rounded-[1.5rem] border border-[#FFE0CC] grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-[#FF6F0F] uppercase mb-1">{t.grossWeight}</p>
                                    <p className="text-xl font-black text-[#212124]">{detailRecord.gross.toLocaleString()} <span className="text-xs text-[#868B94]">kg</span></p>
                                </div>
                                <div className="text-center border-x border-[#FFE0CC]">
                                    <p className="text-[10px] font-black text-[#FF6F0F] uppercase mb-1">{t.tareWeight}</p>
                                    <p className="text-xl font-black text-[#212124]">{detailRecord.tare.toLocaleString()} <span className="text-xs text-[#868B94]">kg</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-[#FF6F0F] uppercase mb-1">{t.netWeight}</p>
                                    <p className="text-xl font-black text-[#FF6F0F]">{detailRecord.net.toLocaleString()} <span className="text-xs">kg</span></p>
                                </div>
                            </div>

                            {/* Audit Trail Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-black text-[#868B94] uppercase tracking-wider">{t.editHistory || '수정 이력'}</h5>
                                    {detailRecord.modified && (
                                        <span className="text-[10px] bg-[#E3F2FD] text-[#1976D2] px-2 py-1 rounded-md font-bold">감사 추적 활성됨</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {(detailRecord.editHistory && detailRecord.editHistory.length > 0) ? (
                                        detailRecord.editHistory.map((log: any, idx: number) => (
                                            <div key={idx} className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E9ECEF] text-xs">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-black text-[#212124]">{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span className="font-bold text-[#FF6F0F]">데이터 수정됨</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {log.changes.map((c: any, cidx: number) => (
                                                        <p key={cidx} className="text-[#868B94]">
                                                            <span className="font-bold">{c.field}</span>: {c.old} → <span className="text-[#212124] font-black">{c.new}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm font-bold text-[#ADB5BD] italic py-4 text-center">변경 이력이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-[#E9ECEF] bg-white flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-4 bg-[#F8F9FA] text-[#868B94] rounded-2xl font-black text-lg border border-[#E9ECEF] hover:bg-[#E9ECEF]"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 py-4 bg-[#FF6F0F] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 hover:brightness-110 transition-all"
                                    >
                                        수정사항 저장
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setEditValues({}); setIsEditing(true); }}
                                        className="flex-1 py-4 bg-white border-2 border-[#FFE0CC] text-[#FF6F0F] rounded-2xl font-black text-lg hover:bg-[#FFF9F5] transition-all"
                                    >
                                        이력 수정하기
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-[#212124] text-white rounded-2xl font-black text-lg shadow-lg shadow-gray-200 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Printer className="w-5 h-5" />
                                        본 내역만 출력
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for Printing */}
            <div className="hidden">
                {printingRecord && (
                    <div id="printable-receipt-history">
                        <Receipt record={printingRecord} lang={lang} />
                    </div>
                )}
            </div>
        </div>
    );
}
