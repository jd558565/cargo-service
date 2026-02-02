'use client';

import { useEffect, useState } from 'react';

interface WeighingReading {
    status: 'STABLE' | 'UNSTABLE' | 'OVERLOAD' | 'ERROR';
    weight: number;
    unit: string;
    raw?: string;
}

export default function WeighingDisplay() {
    const [reading, setReading] = useState<WeighingReading | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // 초기 연결 상태 확인
        fetch('/api/weighing/connection')
            .then(res => res.json())
            .then(data => setIsConnected(data.connected));

        let eventSource: EventSource | null = null;

        if (isConnected) {
            eventSource = new EventSource('/api/weighing/stream');
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.raw === 'DEVICE_DISCONNECTED') {
                    setIsConnected(false);
                    setReading(null);
                } else {
                    setReading(data);
                }
            };
        }

        return () => {
            eventSource?.close();
        };
    }, [isConnected]);

    const handleConnection = async () => {
        setIsConnecting(true);
        try {
            const res = await fetch('/api/weighing/connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isConnected ? 'disconnect' : 'connect' }),
            });
            const data = await res.json();
            setIsConnected(data.connected);
            if (!data.connected) setReading(null);
        } catch (error) {
            console.error('Connection error:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const getStatusColor = () => {
        if (!isConnected) return '#6b7280';
        if (!reading) return 'var(--primary)';
        switch (reading.status) {
            case 'STABLE': return 'var(--stable)';
            case 'UNSTABLE': return 'var(--unstable)';
            case 'OVERLOAD':
            case 'ERROR': return 'var(--error)';
            default: return 'var(--text-dim)';
        }
    };

    return (
        <div className="glass-card flex flex-col items-center justify-center gap-4 relative overflow-hidden" style={{ minWidth: '400px', minHeight: '350px' }}>
            {/* Background Glow */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: getStatusColor() }}
            />

            <div className="absolute top-4 left-6 flex items-center gap-2">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: getStatusColor(),
                        boxShadow: `0 0 10px ${getStatusColor()}`
                    }}
                />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: getStatusColor() }}>
                    {isConnected ? (reading?.status || 'CONNECTED') : 'DISCONNECTED'}
                </span>
            </div>

            <div className="flex flex-col items-center mt-4">
                <h2 className="text-[10px] font-bold text-dim uppercase tracking-[0.3em] mb-4 opacity-50" style={{ color: 'var(--text-dim)' }}>
                    Real-time Weight
                </h2>
                <div className="flex items-baseline gap-2">
                    <span className={`text-8xl font-black tracking-tighter ${isConnected ? 'gradient-text' : 'opacity-20 text-white'}`}>
                        {reading?.weight.toFixed(2) || '0.00'}
                    </span>
                    <span className="text-xl font-bold opacity-30">kg</span>
                </div>
            </div>

            <button
                onClick={handleConnection}
                disabled={isConnecting}
                className={`mt-6 px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isConnected
                        ? 'bg-transparent border border-white/10 text-white/50 hover:bg-white/5'
                        : 'bg-primary text-black glow-shadow hover:scale-105 active:scale-95'
                    }`}
                style={!isConnected ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
            >
                {isConnecting ? 'Processing...' : (isConnected ? 'Disconnect NEW-4321' : 'Connect NEW-4321 PLUS')}
            </button>

            {isConnected && (
                <div className="w-full px-8 mt-4">
                    <div className="w-full h-[2px] bg-white/5 rounded-full relative overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 ease-out"
                            style={{
                                width: `${Math.min((reading?.weight || 0) / 10, 100)}%`,
                                backgroundColor: getStatusColor(),
                                boxShadow: `0 0 10px ${getStatusColor()}`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
