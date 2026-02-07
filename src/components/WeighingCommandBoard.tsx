"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Save, Truck, Package, Building2, FileText, Calculator, X, Printer, Keyboard } from "lucide-react";
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

interface WeighingCommandBoardProps {
    lang: Language;
    currentWeight: number;
    onRecordFinish: (record?: any) => void;
    recordTimestamp: number; // To detect consecutive records of the same weight
}

export default function WeighingCommandBoard({ lang, currentWeight, onRecordFinish, recordTimestamp }: WeighingCommandBoardProps) {
    const t = translations[lang];
    const [vehicleNo, setVehicleNo] = useState("");
    const [itemName, setItemName] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [remarks, setRemarks] = useState("");

    const [firstWeight, setFirstWeight] = useState<number | null>(null);
    const [firstWeightTime, setFirstWeightTime] = useState<string | null>(null);
    const [weighingStep, setWeighingStep] = useState<1 | 2>(1);

    // 모달 및 수동 입력 상태
    const [activeModal, setActiveModal] = useState<'none' | 'printPrompt' | 'manualInput'>('none');
    const [manualWeightInput, setManualWeightInput] = useState("");
    const [isManualFlow, setIsManualFlow] = useState(false);
    const [printingRecord, setPrintingRecord] = useState<WeighingRecord | null>(null);

    // 필드 초기화 함수
    const resetFields = useCallback(() => {
        setVehicleNo("");
        setItemName("");
        setCustomerName("");
        setRemarks("");
        setFirstWeight(null);
        setFirstWeightTime(null);
        setWeighingStep(1);
        setActiveModal('none');
        setManualWeightInput("");
        setIsManualFlow(false);
    }, []);

    // 실제 최종 저장 로직 (2차 계량 완료 시 호출)
    const performFinalSave = useCallback((targetSecondWeight: number, shouldPrint: boolean = false) => {
        if (!vehicleNo || firstWeight === null) return;

        const net = Math.abs(targetSecondWeight - firstWeight);
        const settings = JSON.parse(localStorage.getItem("weighter_settings") || "{}");
        let cctvSnapshot = undefined;
        if (settings.cctvEnabled) {
            // Mock snapshot base64 (tiny blue square for demo)
            cctvSnapshot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        }

        const completedRecord: WeighingRecord = {
            id: Date.now(),
            vehicleNumber: vehicleNo,
            gross: Math.max(targetSecondWeight, firstWeight),
            tare: Math.min(targetSecondWeight, firstWeight),
            net: net,
            itemName,
            customerName,
            remarks,
            firstWeightTimestamp: firstWeightTime,
            timestamp: new Date().toISOString(),
            cctvSnapshot
        };

        const history = JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
        history.unshift(completedRecord);
        localStorage.setItem("weighing_records_extended", JSON.stringify(history));

        const pending = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
        delete pending[vehicleNo];
        localStorage.setItem("weighter_pending_records", JSON.stringify(pending));

        if (shouldPrint) {
            setPrintingRecord(completedRecord);
            setTimeout(() => {
                window.print();
                setPrintingRecord(null);
                onRecordFinish(completedRecord);
            }, 100);
        } else {
            onRecordFinish();
        }

        resetFields();
    }, [vehicleNo, firstWeight, firstWeightTime, itemName, customerName, remarks, resetFields, onRecordFinish]);

    // 저장 버튼 핸들러 (메인 '측정기록' -> '저장' 버튼)
    const handleSave = useCallback(() => {
        if (!vehicleNo) {
            return;
        }

        if (weighingStep === 1) {
            // 1차 계량 저장
            const pending = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
            pending[vehicleNo] = {
                weight: currentWeight,
                itemName,
                customerName,
                remarks,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem("weighter_pending_records", JSON.stringify(pending));

            // Trigger storage event for local updates
            window.dispatchEvent(new Event('storage'));

            alert(t.firstWeighingComplete);
            resetFields(); // 1차 계량 후 바로 공란으로 비움
        } else {
            // 2차 계량 종료 (자동/실시간 중량 기반) -> 출력 여부 확인창 띄움
            setIsManualFlow(false);
            setActiveModal('printPrompt');

            // Trigger Print Reminder Alert
            const alerts = JSON.parse(localStorage.getItem("weighter_alerts") || "{}");
            if (alerts.masterEnabled && alerts.events?.printReminder) {
                console.log("🔊 🖨️ Print Reminder Alert triggered!");
            }
        }
    }, [vehicleNo, weighingStep, currentWeight, itemName, customerName, remarks, t, resetFields]);

    // 차량 조회
    const handleSearch = useCallback(() => {
        if (!vehicleNo) return;
        const history = JSON.parse(localStorage.getItem("weighter_pending_records") || "{}");
        if (history[vehicleNo]) {
            const record = history[vehicleNo];
            setFirstWeight(record.weight);
            setFirstWeightTime(record.timestamp);
            setItemName(record.itemName);
            setCustomerName(record.customerName);
            setRemarks(record.remarks);
            setWeighingStep(2);
        } else {
            setFirstWeight(null);
            setFirstWeightTime(null);
            setWeighingStep(1);
            alert(t.noVehicleData);
        }
    }, [vehicleNo, t]);

    // 자동 저장 로직 (메인 카드에서 기록 버튼 누를 때 트리거)
    useEffect(() => {
        if (recordTimestamp > 0) {
            if (vehicleNo) {
                handleSave();
            } else {
                alert(t.vehicleNumber + t.pleaseInput);
            }
        }
    }, [recordTimestamp, vehicleNo, handleSave, t]);

    const netWeight = firstWeight !== null ? Math.abs(currentWeight - firstWeight) : 0;

    return (
        <div className="karrot-card p-8 flex flex-col gap-8 bg-white h-full relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFF9F5] rounded-2xl flex items-center justify-center text-[#FF6F0F]">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-[#212124]">{t.commandBoardTitle}</h2>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${weighingStep === 1 ? 'bg-[#FFF0E6] text-[#FF6F0F]' : 'bg-[#E3F2FD] text-[#1976D2]'}`}>
                    {weighingStep === 1 ? t.firstWeighing : t.secondWeighing}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Input Fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#868B94] uppercase flex items-center gap-1.5 ml-1">
                            <Truck className="w-3 h-3" /> {t.vehicleNumber}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={vehicleNo}
                                onChange={(e) => setVehicleNo(e.target.value)}
                                placeholder="00가 0000"
                                className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-[1.2rem] font-bold text-[#212124] focus:outline-none focus:border-[#FF6F0F] transition-all"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-2 w-10 h-10 bg-white border border-[#E9ECEF] rounded-xl flex items-center justify-center text-[#868B94] hover:text-[#FF6F0F] transition-all"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#868B94] uppercase flex items-center gap-1.5 ml-1">
                            <Package className="w-3 h-3" /> {t.itemName}
                        </label>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-[1.2rem] font-bold text-[#212124] focus:outline-none focus:border-[#FF6F0F] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#868B94] uppercase flex items-center gap-1.5 ml-1">
                            <Building2 className="w-3 h-3" /> {t.customerName}
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-[1.2rem] font-bold text-[#212124] focus:outline-none focus:border-[#FF6F0F] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#868B94] uppercase flex items-center gap-1.5 ml-1">
                            <FileText className="w-3 h-3" /> {t.remarks}
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={2}
                            className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-[1.2rem] font-bold text-[#212124] focus:outline-none focus:border-[#FF6F0F] transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Weight Calculation Result Area */}
                <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col justify-between border border-[#E9ECEF] min-h-[360px]">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[#868B94]">
                                <span className="font-bold text-sm">{t.firstWeighing}</span>
                                <span className="font-black text-xl text-[#212124]">
                                    {weighingStep === 1 ? currentWeight.toLocaleString() : (firstWeight || 0).toLocaleString()} kg
                                </span>
                            </div>
                            {weighingStep === 2 && firstWeightTime && (
                                <div className="text-[10px] text-[#FF6F0F] font-bold text-right -mt-1 opacity-80">
                                    {t.weighingTime}: {new Date(firstWeightTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[#868B94]">
                                <span className="font-bold text-sm">{t.secondWeight}</span>
                                <span className="font-black text-xl text-[#212124]">
                                    {weighingStep === 2 ? currentWeight.toLocaleString() : "0"} kg
                                </span>
                            </div>
                            {weighingStep === 2 && (
                                <div className="text-[10px] text-[#1976D2] font-bold text-right -mt-1 opacity-80">
                                    {t.weighingTime}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center text-[#868B94]">
                            <span className="font-bold text-sm">{t.tareWeight}</span>
                            <span className="font-black text-xl text-[#212124]">
                                {weighingStep === 2 ? Math.min(currentWeight, firstWeight || 0).toLocaleString() : currentWeight.toLocaleString()} kg
                            </span>
                        </div>

                        <div className="pt-6 border-t border-[#E9ECEF] space-y-2">
                            <span className="text-xs font-black text-[#FF6F0F] uppercase tracking-wider">{t.calcResult} ({t.netWeight})</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-[#212124]">{weighingStep === 2 ? netWeight.toLocaleString() : '0'}</span>
                                <span className="text-xl font-bold text-[#868B94]">kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {weighingStep === 2 && (
                            <button
                                onClick={() => {
                                    setIsManualFlow(true);
                                    setActiveModal('manualInput');
                                }}
                                className="w-[80px] h-[64px] bg-white border-2 border-[#EDEDF0] text-[#868B94] rounded-[1.2rem] flex items-center justify-center hover:border-[#FF6F0F] hover:text-[#FF6F0F] transition-all group"
                                title="수동 입력"
                            >
                                <Keyboard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="flex-1 h-[64px] bg-[#FF6F0F] text-white rounded-[1.2rem] font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Save className="w-6 h-6" />
                            {t.saveRecord}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        {/* Close Button ('X') */}
                        <button
                            onClick={() => setActiveModal('none')}
                            className="absolute right-6 top-6 w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#ADB5BD] hover:text-[#212124] transition-all z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-10 space-y-8">
                            {activeModal === 'manualInput' ? (
                                <>
                                    <div className="space-y-3 pt-4">
                                        <div className="w-16 h-16 bg-[#FFF9F5] rounded-[1.5rem] flex items-center justify-center text-[#FF6F0F] mx-auto shadow-sm">
                                            <Keyboard className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#212124] text-center">{t.manualWeightTitle}</h3>
                                        <p className="text-sm font-bold text-[#868B94] text-center">2차 중량을 입력해 주세요.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={manualWeightInput}
                                                onChange={(e) => setManualWeightInput(e.target.value)}
                                                placeholder={t.manualWeightPlaceholder}
                                                autoFocus
                                                className="w-full px-8 py-6 bg-[#F8F9FA] border-2 border-[#EDEDF0] rounded-[1.5rem] font-black text-3xl text-center focus:outline-none focus:border-[#FF6F0F] transition-all placeholder:text-[#ADB5BD]"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-[#ADB5BD]">kg</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (!manualWeightInput) return;
                                                setActiveModal('printPrompt');
                                            }}
                                            className="w-full py-5 bg-[#FF6F0F] text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-orange-100 hover:brightness-110 transition-all"
                                        >
                                            {t.confirm}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3 pt-4">
                                        <div className="w-16 h-16 bg-[#FFF9F5] rounded-[1.5rem] flex items-center justify-center text-[#FF6F0F] mx-auto shadow-sm">
                                            <Printer className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#212124] text-center">{t.printPromptTitle}</h3>
                                        <p className="text-sm font-bold text-[#868B94] text-center">계량이 완료되었습니다. 출력하시겠습니까?</p>
                                    </div>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => performFinalSave(isManualFlow ? Number(manualWeightInput) : currentWeight, true)}
                                            className="w-full py-5 bg-[#FF6F0F] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-100 hover:brightness-110 transition-all"
                                        >
                                            <Printer className="w-5 h-5" />
                                            {t.printYes}
                                        </button>
                                        <button
                                            onClick={() => performFinalSave(isManualFlow ? Number(manualWeightInput) : currentWeight, false)}
                                            className="w-full py-5 bg-white border-2 border-[#EDEDF0] text-[#868B94] rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:border-[#ADB5BD] transition-all"
                                        >
                                            {t.printNo}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden Receipt for Printing */}
            <div className="hidden">
                {printingRecord && (
                    <div id="printable-receipt">
                        <Receipt record={printingRecord} lang={lang} />
                    </div>
                )}
            </div>
        </div>
    );
}
