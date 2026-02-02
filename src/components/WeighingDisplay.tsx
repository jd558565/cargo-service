'use client';

import { useEffect, useState } from 'react';

interface WeighingReading {
    status: 'STABLE' | 'UNSTABLE' | 'OVERLOAD' | 'ERROR';
    weight: number;
    unit: string;
    raw?: string;
    receivedAt: string | Date; // Date 객체 또는 ISO 문자열
}

export default function WeighingDisplay() {
    const [reading, setReading] = useState<WeighingReading | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
    const [isProcessing, setIsProcessing] = useState(false);

    // 상태 폴링 (초기 로드 시)
    useEffect(() => {
        fetch('/api/weighing/connection')
            .then(res => res.json())
            .then(data => {
                setConnectionStatus(data.status);
            });
    }, []);

    // SSE 스트림 연결
    useEffect(() => {
        let eventSource: EventSource | null = null;

        // 연결된 상태이거나 연결 중일 때 스트림을 열어둠 (상태 변화 수신)
        if (connectionStatus !== 'DISCONNECTED') {
            eventSource = new EventSource('/api/weighing/stream');

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // 원시 메세지로 상태 감지
                if (data.raw?.startsWith('STATUS_CHANGE')) {
                    const newStatus = data.raw.split(':')[1];
                    setConnectionStatus(newStatus);
                    return;
                }

                if (data.raw === 'DEVICE_DISCONNECTED') {
                    setConnectionStatus('DISCONNECTED');
                    setReading(null);
                } else {
                    setReading(data);
                    // 데이터가 들어오면 연결된 것임
                    if (connectionStatus !== 'CONNECTED') {
                        setConnectionStatus('CONNECTED');
                    }
                }
            };

            eventSource.onerror = () => {
                // 스트림 에러 시 일단 닫음 (다음 주기나 버튼 클릭으로 복구)
                eventSource?.close();
            };
        }

        return () => {
            eventSource?.close();
        };
    }, [connectionStatus]);

    const handleConnection = async () => {
        if (isProcessing) return;

        const action = connectionStatus === 'CONNECTED' ? 'disconnect' : 'connect';
        setIsProcessing(true);

        // 연결 시도 즉시 UI 반영
        if (action === 'connect') {
            setConnectionStatus('CONNECTING');
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
                alert('연결 명령 실패: ' + data.error);
                setConnectionStatus('ERROR');
            }
        } catch (error) {
            console.error('Connection error:', error);
            setConnectionStatus('ERROR');
        } finally {
            setIsProcessing(false);
        }
    };

    // UI 텍스트 및 색상 매핑 (100% 한글 정책)
    const getStatusInfo = () => {
        switch (connectionStatus) {
            case 'CONNECTED':
                return { text: '연결됨', color: 'var(--primary)', glow: true };
            case 'CONNECTING':
                return { text: '연결 중...', color: '#fbbf24', glow: true }; // Amber
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
            case 'OVERLOAD': return { text: '과적 경고', color: 'var(--error)' };
            case 'ERROR': return { text: '기기 오류', color: 'var(--error)' };
            default: return { text: '대기 중', color: '#6b7280' };
        }
    };

    const statusInfo = getStatusInfo();
    const readingStatus = getReviewStatus();

    // 정수 표시 강제 (소수점 제거)
    const displayWeight = reading ? Math.floor(reading.weight).toLocaleString() : '0';

    return (
        <div className="glass-card flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            style={{ minWidth: '400px', minHeight: '350px' }}>

            {/* Background Glow */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: statusInfo.color }}
            />

            {/* Header Status */}
            <div className="absolute top-4 left-6 flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${statusInfo.glow ? 'animate-pulse' : ''}`}
                    style={{
                        backgroundColor: statusInfo.color,
                        boxShadow: `0 0 10px ${statusInfo.color}`
                    }}
                />
                <span className="text-[12px] font-bold tracking-wider" style={{ color: statusInfo.color }}>
                    {connectionStatus === 'CONNECTED' ? readingStatus.text : statusInfo.text}
                </span>
            </div>

            {/* Main Weight Display */}
            <div className="flex flex-col items-center mt-4">
                <h2 className="text-[11px] font-bold text-dim uppercase tracking-[0.3em] mb-4 opacity-50">
                    현재 중량 (Real-time Weight)
                </h2>
                <div className="flex items-baseline gap-2">
                    <span className={`text-8xl font-black tracking-tighter ${connectionStatus === 'CONNECTED' ? 'gradient-text' : 'opacity-20 text-white'}`}>
                        {displayWeight}
                    </span>
                    <span className="text-xl font-bold opacity-30">kg</span>
                </div>
            </div>

            {/* Control Button */}
            <button
                onClick={handleConnection}
                disabled={isProcessing || connectionStatus === 'CONNECTING'}
                className={`mt-8 px-10 py-3 rounded-full text-[12px] font-black tracking-wider transition-all duration-300 transform 
                    ${connectionStatus === 'CONNECTED'
                        ? 'bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                        : 'bg-primary text-black glow-shadow hover:scale-105 active:scale-95'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isProcessing || connectionStatus === 'CONNECTING'
                    ? '연결 시도 중...'
                    : (connectionStatus === 'CONNECTED' ? '연결 해제 (Disconnect)' : '계량기 연결 (Connect)')}
            </button>

            {/* Last Update */}
            {reading && (
                <div className="absolute bottom-4 right-6 text-[10px] opacity-30 text-right">
                    최근 수신: {new Date(reading.receivedAt).toLocaleTimeString()}
                </div>
            )}

            {/* Visualization Bar */}
            {connectionStatus === 'CONNECTED' && (
                <div className="w-full px-8 mt-4 absolute bottom-0 left-0 h-1">
                    <div className="w-full h-full bg-white/5">
                        <div
                            className="h-full transition-all duration-300 ease-out"
                            style={{
                                width: `${Math.min((reading?.weight || 0) / 100, 100)}%`, // 10,000kg max 가정 scaling
                                backgroundColor: readingStatus.color,
                                boxShadow: `0 0 10px ${readingStatus.color}`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
