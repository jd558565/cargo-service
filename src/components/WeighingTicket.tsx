import React from 'react';

interface WeighingTicketProps {
    data: {
        weight: number;
        time: Date;
        id: number;
    } | null;
}

export const WeighingTicket: React.FC<WeighingTicketProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div id="weighing-ticket" className="print-only p-12 bg-white text-black font-sans border-2 border-double border-black m-4" style={{ width: '210mm', minHeight: '148mm', color: '#000' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold border-b-4 border-black pb-4 mb-2">계 량 증 명 서</h1>
                <p className="text-sm opacity-60">WEIGHING CERTIFICATE</p>
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
                        <span className="bg-gray-100 px-4">미등록</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">품 목</span>
                        <span>일반 화물</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                        <span className="font-bold">거래처</span>
                        <span>현장 직거래</span>
                    </div>
                </div>
            </div>

            <div className="border-4 border-black p-8 text-center mb-12">
                <div className="text-sm text-gray-500 mb-2 font-bold uppercase tracking-widest">Net Weight</div>
                <div className="text-7xl font-black">
                    {data.weight.toLocaleString()} <span className="text-3xl">kg</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm mb-12">
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">계량원</div>
                    <div className="opacity-30">(인)</div>
                </div>
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">운송자</div>
                    <div className="opacity-30">(인)</div>
                </div>
                <div className="border border-black p-4">
                    <div className="font-bold mb-6">확인자</div>
                    <div className="opacity-30">(인)</div>
                </div>
            </div>

            <div className="text-center text-sm opacity-60 mt-auto pt-8 border-t border-dotted border-gray-400">
                본 증명서는 정밀 계량 시스템에 의해 자동으로 발행되었습니다.
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
                        padding: 30px;
                        display: block !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};
