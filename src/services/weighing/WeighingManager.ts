import { WeighingReading, WeighingSource } from './types';
import { weighingSource } from './MockWeighingSource';

export class WeighingManager {
    private lastReadings: number[] = [];
    private readonly STABLE_THRESHOLD = 5;
    private currentReading: WeighingReading | null = null;
    private listeners: ((reading: WeighingReading) => void)[] = [];
    private isConnected: boolean = false;

    constructor(private source: WeighingSource) {
        this.source.onReading((data) => {
            this.processReading(data);
        });
    }

    private processReading(data: WeighingReading) {
        this.currentReading = data;

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
        if (!this.isConnected) {
            await this.source.connect();
            this.isConnected = true;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await this.source.disconnect();
            this.isConnected = false;
            this.currentReading = null;
            // 연결 해제됨을 알림
            this.listeners.forEach(fn => fn({
                status: 'ERROR',
                weight: 0,
                unit: 'kg',
                receivedAt: new Date(),
                raw: 'DEVICE_DISCONNECTED'
            }));
        }
    }

    getConnectedStatus() {
        return this.isConnected;
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
