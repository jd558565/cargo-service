import React from 'react';

interface WeighingTicketProps {
    data: {
        id: number;
        vehicleNumber: string;
        gross: number;
        tare: number;
        net: number;
        itemName: string;
        customerName: string;
        remarks: string;
        timestamp: string;
    } | null;
}

export const WeighingTicket: React.FC<WeighingTicketProps> = ({ data }) => {
    if (!data) return null;

    const printDate = new Date(data.timestamp);

    return (
        <div id="weighing-ticket" className="print-only p-12 bg-white text-black font-sans m-0" style={{ width: '210mm', minHeight: '148mm', color: '#000' }}>
            <div className="text-center mb-10 border-b-8 border-black pb-8">
                <h1 className="text-6xl font-black mb-4">계 량 증 명 서</h1>
                <p className="text-2xl font-bold opacity-80 uppercase tracking-widest">CERTIFICATE OF WEIGHING</p>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">계량 번호</span>
                        <span className="text-xl">{data.id}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">계량 일시</span>
                        <span className="text-xl">{printDate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">차량 번호</span>
                        <span className="text-xl font-black">{data.vehicleNumber}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">품 목</span>
                        <span className="text-xl">{data.itemName || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">거 래 처</span>
                        <span className="text-xl">{data.customerName || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-black pb-2">
                        <span className="text-xl font-bold">비 고</span>
                        <span className="text-xl">{data.remarks || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="border-[6px] border-black p-10 mb-12 relative bg-gray-50/50">
                <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-500 mb-2">총 중 량 (GROSS)</div>
                        <div className="text-4xl font-black">{data.gross.toLocaleString()} <span className="text-xl">kg</span></div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-500 mb-2">공차 중량 (TARE)</div>
                        <div className="text-4xl font-black">{data.tare.toLocaleString()} <span className="text-xl">kg</span></div>
                    </div>
                    <div className="text-center bg-black text-white p-4 rounded-xl">
                        <div className="text-lg font-bold opacity-70 mb-2">실 중 량 (NET)</div>
                        <div className="text-5xl font-black">{data.net.toLocaleString()} <span className="text-xl">kg</span></div>
                    </div>
                </div>

                {/* Stamp */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 h-28 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-xl transform rotate-12 opacity-80">
                    <div className="border-2 border-red-600 w-24 h-24 rounded-full flex items-center justify-center border-dashed">
                        계량인
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center text-lg mb-12">
                <div className="border-2 border-black p-6">
                    <div className="font-black mb-8">계량원</div>
                    <div className="opacity-40 text-sm">(인)</div>
                </div>
                <div className="border-2 border-black p-6">
                    <div className="font-black mb-8">운송자</div>
                    <div className="opacity-40 text-sm">(인)</div>
                </div>
                <div className="border-2 border-black p-6">
                    <div className="font-black mb-8">확인자</div>
                    <div className="opacity-40 text-sm">(인)</div>
                </div>
            </div>

            <div className="text-center text-sm font-bold opacity-60 pt-6 border-t border-dotted border-black">
                본 증명서는 정밀 계량 시스템에 의해 자동으로 발행되었습니다.
            </div>

            <style jsx global>{`
                @media screen {
                    .print-only { display: none !important; }
                }
                @media print {
                    @page {
                        size: A5 landscape;
                        margin: 0;
                    }
                    body * { visibility: hidden; }
                    #weighing-ticket, #weighing-ticket * { visibility: visible; }
                    #weighing-ticket {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 148mm;
                        padding: 40px;
                        display: block !important;
                        border: none !important;
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
};
