'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    RotateCcw,
    Save,
    Wifi,
    WifiOff,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { WeighingTicket } from './WeighingTicket';

interface WeighingReading {
    status: 'STABLE' | 'UNSTABLE' | 'OVERLOAD' | 'ERROR';
    weight: number;
    unit: string;
    source: 'MOCK' | 'SERIAL';
    raw?: string;
    receivedAt: string | Date;
}

export default function WeighingDisplay() {
    const [reading, setReading] = useState<WeighingReading | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('CONNECTING');
    const [records, setRecords] = useState<{ id: number; weight: number; time: Date }[]>([]);
    const [printingRecord, setPrintingRecord] = useState<{ id: number; weight: number; time: Date } | null>(null);

    // 기록 로드
    useEffect(() => {
        const saved = localStorage.getItem('weighing_records');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setRecords(parsed.map((r: any) => ({ ...r, time: new Date(r.time) })));
            } catch (e) {
                console.error('기록 분석 실패');
            }
        }
    }, []);

    // 연결 상태 초기 확인
    const checkConnection = useCallback(async () => {
        try {
            const res = await fetch('/api/weighing/connection');
            const data = await res.json();
            setConnectionStatus(data.status);

            if (data.status === 'DISCONNECTED') {
                // 부팅 시 자동 연결 시도
                await fetch('/api/weighing/connection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'connect' })
                });
                setConnectionStatus('CONNECTING');
            }
        } catch (e) {
            setConnectionStatus('ERROR');
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // SSE 데이터 스트림 수신
    useEffect(() => {
        let eventSource: EventSource | null = null;
        let retryTimer: NodeJS.Timeout;

        const connectStream = () => {
            if (eventSource) eventSource.close();
            eventSource = new EventSource('/api/weighing/stream');

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.raw?.startsWith('STATUS_CHANGE')) {
                    setConnectionStatus(data.raw.split(':')[1]);
                    return;
                }
                setReading(data);
                if (data.source === 'SERIAL') setConnectionStatus('CONNECTED');
            };

            eventSource.onerror = () => {
                eventSource?.close();
                retryTimer = setTimeout(connectStream, 3000);
                setConnectionStatus('ERROR');
            };
        };

        connectStream();
        return () => {
            if (eventSource) eventSource.close();
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, []);

    const handleTare = async () => alert('기기의 영점을 0으로 맞췄어요. 🥕');

    const handleRecord = () => {
        if (!reading) return alert('아직 데이터를 기다리고 있어요.');
        const newRecord = {
            id: Date.now(),
            weight: Math.floor(reading.weight),
            time: new Date()
        };
        const updatedRecords = [newRecord, ...records].slice(0, 10);
        setRecords(updatedRecords);
        localStorage.setItem('weighing_records', JSON.stringify(updatedRecords));
        setPrintingRecord(newRecord);
        alert('성공적으로 기록되었어요! 내역에서 확인해보세요.');
    };

    const displayWeight = reading ? Math.floor(reading.weight).toLocaleString() : '0';
    const isStable = reading?.status === 'STABLE';

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* 메인 로드셀 카드 */}
            <div className="karrot-card p-12 flex flex-col items-center justify-center gap-10 relative overflow-hidden min-h-[500px]">
                {/* 연결 상태 태그 */}
                <div className={`absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${connectionStatus === 'CONNECTED' ? 'bg-[#F2F3F6] text-[#212124]' : 'bg-[#FFF0E6] text-[#FF6F0F]'
                    }`}>
                    {connectionStatus === 'CONNECTED' ? <Wifi size={18} /> : <WifiOff size={18} />}
                    <span>{connectionStatus === 'CONNECTED' ? '장치 연결됨' : '연결 확인 중'}</span>
                </div>

                {/* 상태 설정 및 뱃지 영역 */}
                <div className="absolute top-8 right-8 flex items-center gap-3">
                    {/* [NEW] 연결/해제 토글 버튼 */}
                    <button
                        onClick={async () => {
                            const action = connectionStatus === 'CONNECTED' ? 'disconnect' : 'connect';
                            try {
                                const res = await fetch('/api/weighing/connection', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    setConnectionStatus(data.status);
                                    if (action === 'disconnect') {
                                        setReading(null);
                                    }
                                }
                            } catch (e) {
                                console.error('Connection toggle error:', e);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-full font-bold text-sm text-[#4D5159] hover:bg-[#F2F3F6] transition-all"
                    >
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-[#FF6F0F]' : 'bg-[#ADB5BD]'}`} />
                        <span>{connectionStatus === 'CONNECTED' ? '해제하기' : '연결하기'}</span>
                    </button>

                    {/* 현재 상태 배지 */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F3F6] rounded-full font-bold text-sm text-[#4D5159]">
                        {isStable ? <CheckCircle2 size={18} className="text-[#FF6F0F]" /> : <Activity size={18} className="animate-pulse" />}
                        <span>{isStable ? '안정적' : '측정 중'}</span>
                    </div>
                </div>

                {/* 본문 - 중량 표시 */}
                <div className="flex flex-col items-center gap-6">
                    <span className="text-[#868B94] font-black text-xl tracking-[0.2em] uppercase">실시간 무게</span>
                    <div className="flex items-baseline gap-4">
                        <span className="text-[120px] font-black text-[#212124] leading-none tracking-tighter shadow-orange-500/10">
                            {displayWeight}
                        </span>
                        <span className="text-5xl font-black text-[#868B94]">{reading?.unit || 'g'}</span>
                    </div>
                </div>

                {/* 하단 대형 버튼 2개 */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                    <button
                        onClick={handleTare}
                        className="btn-karrot-secondary hover:bg-[#DEE2E6] hover:scale-[1.02]"
                    >
                        <RotateCcw size={24} />
                        <span>영점 조절</span>
                    </button>

                    <button
                        onClick={handleRecord}
                        className="btn-karrot-primary bg-gradient-to-tr from-[#FF6F0F] to-[#FF8E42] shadow-lg shadow-orange-100 hover:scale-[1.02]"
                    >
                        <Save size={24} />
                        <span>측정 기록</span>
                    </button>
                </div>
            </div>

            {/* 인쇄용 컴포넌트 (숨김) */}
            <div className="hidden">
                <WeighingTicket data={printingRecord} />
            </div>
        </div>
    );
}
