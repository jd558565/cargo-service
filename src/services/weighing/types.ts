export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface WeighingReading {
    status: 'STABLE' | 'UNSTABLE' | 'OVERLOAD' | 'ERROR';
    weight: number; // kg, Integer only (0 or natural number)
    unit: 'kg';
    raw?: string;   // 원문 데이터
    receivedAt: Date;
}

export interface WeighingSource {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    onReading(callback: (data: WeighingReading) => void): void;
    // Mock 제어를 위한 추가 메서드 (필요시)
    setMockWeight?(weight: number, status?: WeighingReading['status']): void;
}
