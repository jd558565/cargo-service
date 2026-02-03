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
                console.error('인쇄 설정 불러오기 실패');
            }
        }
    }, [data]);

    if (!data) return null;

    return (
        <div id="weighing-ticket" className="print-only p-12 bg-white text-black font-sans border-[6px] border-double border-black m-4" style={{ width: '210mm', minHeight: '148mm', color: '#000' }}>
            <div className="text-center mb-10">
                <h1 className="text-6xl font-black border-b-8 border-black pb-6 mb-4">계 량 증 명 서</h1>
                <p className="text-xl font-bold opacity-80 uppercase tracking-widest">공인 정밀 계량 증명</p>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">계량 번호</span>
                        <span className="text-2xl font-bold">{data.id}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">계량 일시</span>
                        <span className="text-2xl font-bold">{data.time.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">차량 번호</span>
                        <span className="text-2xl font-bold">{settings.carNumber}</span>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">품 목</span>
                        <span className="text-2xl font-bold">{settings.itemType}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">계량 업체</span>
                        <span className="text-2xl font-bold">{settings.companyName}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                        <span className="text-2xl font-black">연락처</span>
                        <span className="text-2xl font-bold">{settings.contact}</span>
                    </div>
                </div>
            </div>

            <div className="border-8 border-black p-12 text-center mb-16 relative overflow-hidden bg-gray-50">
                <div className="text-2xl text-gray-600 mb-4 font-black tracking-[0.3em]">실 제 중 량 (NET WEIGHT)</div>
                <div className="text-[100px] font-black leading-none">
                    {data.weight.toLocaleString()} <span className="text-5xl ml-2">kg</span>
                </div>

                {settings.showStamp && (
                    <div className="absolute right-12 bottom-6 w-32 h-32 border-8 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-2xl transform -rotate-15 opacity-90">
                        <div className="border-4 border-red-600 w-28 h-28 rounded-full flex items-center justify-center border-dashed">
                            계량인
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-8 text-center text-xl mb-16">
                <div className="border-2 border-black p-8">
                    <div className="font-black mb-10">계량원</div>
                    <div className="opacity-40 text-sm">서명 또는 날인</div>
                </div>
                <div className="border-2 border-black p-8">
                    <div className="font-black mb-10">운송자</div>
                    <div className="opacity-40 text-sm">서명 또는 날인</div>
                </div>
                <div className="border-2 border-black p-8">
                    <div className="font-black mb-10">확인자</div>
                    <div className="opacity-40 text-sm">서명 또는 날인</div>
                </div>
            </div>

            <div className="text-center text-sm font-bold opacity-60 mt-auto pt-10 border-t-2 border-dotted border-gray-400">
                본 증명서는 안티그래비티 정밀 계량 시스템에 의해 자동으로 발행되었습니다.
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
                        padding: 60px;
                        display: block !important;
                        border: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};
