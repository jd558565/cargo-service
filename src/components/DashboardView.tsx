"use client";

import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import * as XLSX from "xlsx";
import { Download, Calendar, TrendingUp, Package } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface DashboardViewProps {
    lang: Language;
}

export default function DashboardView({ lang }: DashboardViewProps) {
    const t = translations[lang];

    // LocalStorage에서 데이터 로드 (실제로는 API 연동 필요)
    const records = useMemo(() => {
        if (typeof window === "undefined") return [];
        return JSON.parse(localStorage.getItem("weighing_records_extended") || "[]");
    }, []);

    // 통계 데이터 가공
    const stats = useMemo(() => {
        const today = new Date();
        const dailyData: Record<string, number> = {};

        records.forEach((r: any) => {
            const date = new Date(r.timestamp).toLocaleDateString("en-CA"); // YYYY-MM-DD
            dailyData[date] = (dailyData[date] || 0) + (r.net || 0);
        });

        // 최근 7일 데이터 생성
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString("en-CA");
            chartData.push({
                name: dateStr.slice(5), // MM-DD
                weight: dailyData[dateStr] || 0
            });
        }
        return chartData;
    }, [records]);

    const totalWeight = records.reduce((acc: number, cur: any) => acc + (cur.net || 0), 0);
    const totalCount = records.length;

    // Excel 다운로드 핸들러
    const handleDownloadExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(records.map((r: any) => ({
            "계량번호": r.id,
            "일시": new Date(r.timestamp).toLocaleString(),
            "차량번호": r.vehicleNumber,
            "품목": r.itemName,
            "거래처": r.customerName,
            "총중량(kg)": r.gross,
            "공차중량(kg)": r.tare,
            "실중량(kg)": r.net,
            "비고": r.remarks
        })));

        XLSX.utils.book_append_sheet(wb, ws, "계량기록");
        XLSX.writeFile(wb, `Weighing_History_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-[#212124] mb-2">{t.dashboard}</h2>
                    <p className="text-[#868B94] font-bold">전체 계량 현황을 한눈에 확인하세요.</p>
                </div>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-5 py-3 bg-[#217346] text-white rounded-xl font-bold hover:bg-[#1E6B40] transition-colors shadow-lg shadow-green-100"
                >
                    <Download className="w-5 h-5" />
                    <span>Excel 다운로드</span>
                </button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="karrot-card p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF6F0F]">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#868B94]">총 누적 중량</p>
                        <p className="text-2xl font-black text-[#212124]">{totalWeight.toLocaleString()} <span className="text-base text-[#868B94]">kg</span></p>
                    </div>
                </div>
                <div className="karrot-card p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1976D2]">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#868B94]">총 계량 횟수</p>
                        <p className="text-2xl font-black text-[#212124]">{totalCount.toLocaleString()} <span className="text-base text-[#868B94]">건</span></p>
                    </div>
                </div>
                <div className="karrot-card p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#868B94]">오늘 날짜</p>
                        <p className="text-xl font-black text-[#212124]">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="karrot-card p-8">
                    <h3 className="text-xl font-black text-[#212124] mb-6">최근 7일 물동량 (kg)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#868B94', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#868B94', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F8F9FA' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="weight" fill="#FF6F0F" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="karrot-card p-8">
                    <h3 className="text-xl font-black text-[#212124] mb-6">주간 추이</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#868B94', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#868B94', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="weight" stroke="#1976D2" strokeWidth={3} dot={{ r: 4, fill: '#1976D2', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
