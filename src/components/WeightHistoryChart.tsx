'use client';

import React from 'react';

export const WeightHistoryChart = () => {
    return (
        <div className="glass-card flex flex-col gap-6 border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-800">실시간 계량 추이 (최근 1시간)</h3>
                <span className="text-sm font-bold text-primary">● 실시간 자동 갱신 중</span>
            </div>

            <div className="relative h-[250px] w-full flex items-end gap-2 px-2">
                {/* 가상의 차트 바 (디자인용) */}
                {[40, 60, 45, 80, 55, 90, 70, 85, 65, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className="w-full bg-primary/20 rounded-t-lg transition-all duration-1000 border-t-4 border-primary"
                            style={{ height: `${h}%` }}
                        />
                        <span className="text-[10px] font-black text-slate-300">{10 * i}분</span>
                    </div>
                ))}

                {/* 가로 안내선 */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 pr-2">
                    {[100, 75, 50, 25, 0].map(val => (
                        <div key={val} className="w-full border-t border-slate-900 flex justify-end">
                            <span className="text-[10px] -mt-2">{val}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-8 justify-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-slate-500">평균 중량 계량</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-sm font-bold text-slate-500">대기 시간</span>
                </div>
            </div>
        </div>
    );
};
