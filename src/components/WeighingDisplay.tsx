'use client';

import { useEffect, useState } from 'react';

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
    const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
    const [isProcessing, setIsProcessing] = useState(false);
    const [records, setRecords] = useState<{ id: number; weight: number; time: Date }[]>([]);
    const [retryCount, setRetryCount] = useState(0);
    const [hasReceivedData, setHasReceivedData] = useState(false); // 실제 데이터 수신 여부
    const [availablePorts, setAvailablePorts] = useState<any[]>([]); // 기기에서 감지된 포트
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // 기록 불러오기 (초기 로드)
    useEffect(() => {
        const saved = localStorage.getItem('weighing_records');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setRecords(parsed.map((r: any) => ({ ...r, time: new Date(r.time) })));
            } catch (e) {
                console.error('Failed to parse records');
            }
        }
    }, []);

    // 기록 저장하기 (데이터 변경 시)
    useEffect(() => {
        localStorage.setItem('weighing_records', JSON.stringify(records));
    }, [records]);

    // 상태 및 포트 리스트 초기 로드
    useEffect(() => {
        fetch('/api/weighing/connection')
            .then(res => res.json())
            .then(data => setConnectionStatus(data.status));

        fetch('/api/weighing/ports')
            .then(res => res.json())
            .then(data => {
                if (data.success) setAvailablePorts(data.ports);
            });
    }, []);

    // SSE 스트림 연결 및 자동 재연결 로직
    useEffect(() => {
        let eventSource: EventSource | null = null;
        let retryTimer: NodeJS.Timeout;

        const connectStream = () => {
            if (connectionStatus === 'DISCONNECTED' || connectionStatus === 'ERROR') {
                if (eventSource) eventSource.close();
                return;
            }

            eventSource = new EventSource('/api/weighing/stream');

            eventSource.onopen = () => {
                console.log('[UI SSE] SSE Channel Opened. Waiting for data...');
                setRetryCount(0);
            };

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                console.log(`[UI RECEIVE] Source: ${data.source}, Weight: ${data.weight}`);

                if (data.raw?.startsWith('STATUS_CHANGE')) {
                    const newStatus = data.raw.split(':')[1];
                    if (newStatus === 'DISCONNECTED' || newStatus === 'ERROR') {
                        setConnectionStatus(newStatus);
                        setHasReceivedData(false);
                    }
                    return;
                }

                if (data.raw === 'DEVICE_DISCONNECTED') {
                    setConnectionStatus('DISCONNECTED');
                    setReading(null);
                    setHasReceivedData(false);
                } else {
                    setReading(data);
                    // 실제 하드웨어 데이터 수신 시에만 진짜 '수신 성공'으로 간주
                    if (data.source === 'SERIAL' && !hasReceivedData) {
                        console.log('[UI STATUS] Real Serial Hardware data detected.');
                        setHasReceivedData(true);
                    }

                    if (connectionStatus !== 'CONNECTED' && connectionStatus !== 'CONNECTING') {
                        setConnectionStatus('CONNECTED');
                    }
                }
            };

            eventSource.onerror = (err) => {
                console.error('[UI SSE] SSE Error (Possible Timeout/504):', err);
                eventSource?.close();
                setHasReceivedData(false);

                // 에러 발생 시(504 등) 자동으로 짧은 지연 후 재연결 시도
                if (connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING') {
                    setRetryCount(prev => prev + 1);
                    retryTimer = setTimeout(() => {
                        console.log('[UI SSE] Attempting Auto-reconnect...');
                        connectStream();
                    }, 1000); // 1초 후 재연결
                }
            };
        };

        connectStream();

        return () => {
            if (eventSource) eventSource.close();
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [connectionStatus, hasReceivedData]);

    const handleConnection = async () => {
        if (isProcessing) return;

        const action = (connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING') ? 'disconnect' : 'connect';
        setIsProcessing(true);

        if (action === 'connect') {
            setConnectionStatus('CONNECTING');
            setHasReceivedData(false);
        }

        try {
            const res = await fetch('/api/weighing/connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (data.status) {
                setConnectionStatus(data.status);
            }

            if (!data.success) {
                setErrorDetails(data.error || '알 수 없는 오류가 발생했습니다.');
                setShowErrorModal(true);
                setConnectionStatus('ERROR');
            }
        } catch (error: any) {
            console.error('Connection error:', error);
            setErrorDetails(error.message || '서버와의 통신 중 오류가 발생했습니다.');
            setShowErrorModal(true);
            setConnectionStatus('ERROR');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRecord = () => {
        if (!reading || connectionStatus !== 'CONNECTED') return;

        const newRecord = {
            id: Date.now(),
            weight: Math.floor(reading.weight),
            time: new Date()
        };

        setRecords(prev => [newRecord, ...prev].slice(0, 10)); // 최근 10개만 유지
    };

    // UI 텍스트 및 색상 매핑
    const getStatusInfo = () => {
        // 하드웨어 계량 중
        if (reading?.source === 'SERIAL') {
            return { text: '실시간 하드웨어 계량 중', color: 'var(--primary)', glow: true };
        }

        // SSE는 열렸으나 데이터가 아직 안 들어온 경우
        if (connectionStatus === 'CONNECTED' && !hasReceivedData) {
            return { text: '서버 연결됨 (데이터 대기 중)', color: '#60a5fa', glow: true };
        }

        switch (connectionStatus) {
            case 'CONNECTED':
                return { text: '연결됨', color: 'var(--primary)', glow: true };
            case 'CONNECTING':
                return { text: retryCount > 0 ? `재연결 중 (${retryCount})...` : '연결 중...', color: '#fbbf24', glow: true };
            case 'DISCONNECTED':
                return { text: '연결 안 됨', color: '#6b7280', glow: false };
            case 'ERROR':
                return { text: '오류 발생', color: 'var(--error)', glow: false };
            default:
                return { text: '상태 불명', color: '#6b7280', glow: false };
        }
    };

    const getReviewStatus = () => {
        if (!reading) return { text: '대기 중', color: '#6b7280' };
        switch (reading.status) {
            case 'STABLE': return { text: '안정', color: 'var(--stable)' };
            case 'UNSTABLE': return { text: '측정 중', color: 'var(--unstable)' };
            case 'OVERLOAD': return { text: '과적', color: 'var(--error)' };
            case 'ERROR': return { text: '오류', color: 'var(--error)' };
            default: return { text: '대기 중', color: '#6b7280' };
        }
    };

    const statusInfo = getStatusInfo();
    const readingStatus = getReviewStatus();
    const displayWeight = reading ? Math.floor(reading.weight).toLocaleString() : '0';

    return (
        <div className="flex flex-col gap-6">
            <div className="glass-card flex flex-col items-center justify-center gap-4 relative overflow-hidden"
                style={{ minWidth: '400px', minHeight: '380px' }}>

                <div
                    className="absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000"
                    style={{ backgroundColor: statusInfo.color }}
                />

                <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${statusInfo.glow ? 'animate-pulse' : ''}`}
                        style={{
                            backgroundColor: statusInfo.color,
                            boxShadow: `0 0 10px ${statusInfo.color}`
                        }}
                    />
                    <span className="text-[12px] font-bold tracking-wider" style={{ color: statusInfo.color }}>
                        {reading?.source === 'SERIAL' ? `[${readingStatus.text}] 실시간 하드웨어 수신 중` : statusInfo.text}
                    </span>
                </div>

                <div className="flex flex-col items-center mt-4">
                    <h2 className="text-[11px] font-bold text-dim uppercase tracking-[0.3em] mb-4 opacity-50">
                        현재 중량 (HARDWARE)
                    </h2>


                    <div className="flex items-baseline gap-2">
                        <span className={`text-8xl font-black tracking-tighter 
                            ${reading?.source === 'SERIAL' ? 'gradient-text' : 'opacity-20 text-white'}`}>
                            {displayWeight}
                        </span>
                        <span className="text-xl font-bold opacity-30">kg</span>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleConnection}
                        disabled={isProcessing}
                        className={`px-8 py-3 rounded-full text-[12px] font-black tracking-wider transition-all duration-300
                            ${connectionStatus === 'CONNECTED'
                                ? 'bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                                : 'bg-primary text-black glow-shadow hover:scale-105 active:scale-95'
                            } disabled:opacity-50`}
                    >
                        {connectionStatus === 'CONNECTED' ? '연결 해제' : '인디케이터 연결'}
                    </button>

                    {connectionStatus === 'CONNECTED' && (
                        <button
                            onClick={handleRecord}
                            className="px-8 py-3 rounded-full text-[12px] font-black tracking-wider bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                        >
                            무게 기록
                        </button>
                    )}
                </div>

                {reading && (
                    <div className="absolute bottom-4 right-6 text-[10px] opacity-30 text-right">
                        수신 시각: {new Date(reading.receivedAt).toLocaleTimeString()}
                    </div>
                )}

                {connectionStatus === 'CONNECTED' && (
                    <div className="w-full px-8 mt-4 absolute bottom-0 left-0 h-1">
                        <div className="w-full h-full bg-white/5">
                            <div
                                className="h-full transition-all duration-300 ease-out"
                                style={{
                                    width: `${Math.min((reading?.weight || 0) / 100, 100)}%`,
                                    backgroundColor: readingStatus.color,
                                    boxShadow: `0 0 10px ${readingStatus.color}`
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Records List */}
            <div className="glass-card p-6 flex flex-col gap-4" style={{ minWidth: '400px' }}>
                <h3 className="text-xs font-bold text-dim uppercase tracking-widest border-b border-white/5 pb-2">
                    최근 계량 기록
                </h3>
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {records.length === 0 ? (
                        <p className="text-[11px] text-center py-4 opacity-30 italic">기록된 데이터가 없습니다.</p>
                    ) : (
                        records.map(record => (
                            <div key={record.id} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-[12px] font-bold text-primary">{record.weight.toLocaleString()} kg</span>
                                <span className="text-[10px] opacity-40">{record.time.toLocaleTimeString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* Connection Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 p-6">
                    <div className="glass-card max-w-md w-full p-8 border-2 border-error/50 animate-in zoom-in duration-300 flex flex-col items-center gap-6 shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <span className="text-3xl">🚫</span>
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-black text-error tracking-tight mb-2">계량기 연결 실패</h2>
                            <p className="text-sm text-white/60 leading-relaxed">
                                인디케이터와의 통신을 시작할 수 없습니다.<br />
                                하드웨어 연결 상태를 확인해 주세요.
                            </p>
                        </div>

                        <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-40 uppercase font-bold tracking-wider">대상 포트</span>
                                    <span className="font-mono text-error">COM3</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-40 uppercase font-bold tracking-wider">통신 설정</span>
                                    <span className="font-mono opacity-80">2400 7E1 (Even Parity)</span>
                                </div>
                                <div className="h-[1px] bg-white/5 my-1" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-30 uppercase font-bold tracking-wider text-center mb-1">Error Message</span>
                                    <p className="text-[11px] text-white/80 font-mono text-center break-all whitespace-pre-wrap">
                                        {errorDetails}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full py-4 bg-error text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-error/20"
                            >
                                오류 확인
                            </button>
                            <p className="text-[10px] text-white/30 text-center leading-tight">
                                ※ Vercel 배포 주소가 아닌 <br />
                                <span className="text-primary opacity-60">http://localhost:3000</span> 에서만 작동합니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
