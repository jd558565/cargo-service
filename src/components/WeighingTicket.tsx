import React, { useEffect, useState } from 'react';

interface WeighingTicketProps {
    data: {
        weight: number;
        time: Date;
        id: number;
    } | null;
}

export const WeighingTicket: React.FC<WeighingTicketProps> = ({ data }) => {
    const [settings, setSettings] = useState({
        companyName: '(주)안티그래비티 로지스틱스',
        contact: '02-1234-5678',
        carNumber: '미등록',
        itemType: '일반 화물',
        showStamp: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('print_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load print settings for ticket');
            }
        }
    }, [data]); // 데이타가 바뀔 때(인쇄 시도 시) 설정을 최신으로 불러옴

    if (!data) return null;

    return (
        <div id="weighing-ticket" className="print-only p-12 bg-white text-black font-sans border-2 border-double border-black m-4" style={{ width: '210mm', minHeight: '148mm', color: '#000' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold border-b-4 border-black pb-4 mb-2">계 량 증 명 서</h1>
                <p className="text-sm opacity-60 uppercase">Weighing Certificate</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">계량 번호</span>
                        <span>{data.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">계량 일시</span>
                        <span>{data.time.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">차량 번호</span>
                        <span className="px-2">{settings.carNumber}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">품 목</span>
                        <span>{settings.itemType}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">계량 업체</span>
                        <span>{settings.companyName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">연락처</span>
                        <span>{settings.contact}</span>
                    </div>
                </div>
            </div>

            <div className="border-4 border-black p-8 text-center mb-12 relative overflow-hidden">
                <div className="text-sm text-gray-500 mb-2 font-bold uppercase tracking-widest">Net Weight</div>
                <div className="text-7xl font-black">
                    {data.weight.toLocaleString()} <span className="text-3xl">kg</span>
                </div>

                {settings.showStamp && (
                    <div className="absolute right-8 bottom-4 w-24 h-24 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-bold text-xl transform -rotate-12 opacity-80">
                        <div className="border-2 border-red-600 w-20 h-20 rounded-full flex items-center justify-center border-dashed">
                            계량인
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm mb-12">
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">계량원</div>
                    <div className="opacity-30 text-xs">서명 또는 날인</div>
                </div>
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">운송자</div>
                    <div className="opacity-30 text-xs">서명 또는 날인</div>
                </div>
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">확인자</div>
                    <div className="opacity-30 text-xs">서명 또는 날인</div>
                </div>
            </div>

            <div className="text-center text-[11px] opacity-60 mt-auto pt-8 border-t border-dotted border-gray-400">
                본 증명서는 정밀 계량 시스템(AntiGravity Logic)에 의해 자동으로 발행되었습니다.
            </div>

            <style jsx global>{`
                @media screen {
                    .print-only { display: none; }
                }
                @media print {
                    body * { visibility: hidden; }
                    #weighing-ticket, #weighing-ticket * { visibility: visible; }
                    #weighing-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 40px;
                        display: block !important;
                        border: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};
