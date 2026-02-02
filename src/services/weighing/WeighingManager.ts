import { WeighingReading, WeighingSource, ConnectionStatus } from './types';
import { weighingSource } from './MockWeighingSource';

export class WeighingManager {
    private lastReadings: number[] = [];
    private readonly STABLE_THRESHOLD = 5;
    private currentReading: WeighingReading | null = null;
    private listeners: ((reading: WeighingReading) => void)[] = [];
    private connectionStatus: ConnectionStatus = 'DISCONNECTED';

    constructor(private source: WeighingSource) {
        this.source.onReading((data) => {
            this.processReading(data);
        });
    }

    private processReading(data: WeighingReading) {
        this.currentReading = data;

        // 데이터가 들어온다는 것은 연결된 상태임
        if (this.connectionStatus !== 'CONNECTED') {
            this.connectionStatus = 'CONNECTED';
        }

        // 안정성 판단 로직
        if (data.status === 'STABLE') {
            this.lastReadings.push(data.weight);
            if (this.lastReadings.length > this.STABLE_THRESHOLD) {
                this.lastReadings.shift();
            }
        } else {
            this.lastReadings = [];
        }

        // 리스너들에게 알림
        this.listeners.forEach(fn => fn(data));
    }

    subscribe(callback: (reading: WeighingReading) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    getCurrentReading() {
        return this.currentReading;
    }

    // 실제 하드웨어 연결
    async connect() {
        if (this.connectionStatus === 'CONNECTED' || this.connectionStatus === 'CONNECTING') {
            return;
        }

        try {
            this.connectionStatus = 'CONNECTING';
            // 리스너들에게 상태 변경 알림 (가상 데이터 전송)
            this.notifyStatusChange();

            await this.source.connect();

            this.connectionStatus = 'CONNECTED';
            this.notifyStatusChange();
        } catch (error) {
            this.connectionStatus = 'ERROR';
            this.notifyStatusChange();
            console.error('Connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connectionStatus === 'DISCONNECTED') {
            return;
        }

        try {
            await this.source.disconnect();
        } finally {
            this.connectionStatus = 'DISCONNECTED';
            this.currentReading = null;
            this.notifyStatusChange();
        }
    }

    getConnectedStatus() {
        return this.connectionStatus === 'CONNECTED';
    }

    getConnectionState(): ConnectionStatus {
        return this.connectionStatus;
    }

    private notifyStatusChange() {
        if (!this.currentReading) {
            // 초기 더미 데이터로 상태만 전송
            this.listeners.forEach(fn => fn({
                status: this.connectionStatus === 'ERROR' ? 'ERROR' : 'UNSTABLE',
                weight: 0,
                unit: 'kg',
                receivedAt: new Date(),
                raw: `STATUS_CHANGE:${this.connectionStatus}`
            }));
        }
    }

    // 무게 설정 (Mock 전용)
    setMockWeight(weight: number, status?: WeighingReading['status']) {
        if (this.source.setMockWeight) {
            this.source.setMockWeight(weight, status);
        }
    }
}

// 글로벌 매니저 인스턴스
export const weighingManager = new WeighingManager(weighingSource);
// 더 이상 자동으로 초기화하지 않음. 사용자가 버튼을 눌러야 연결됨.
