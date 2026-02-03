import { WeighingReading, WeighingSource, ConnectionStatus } from './types';
import { SerialWeighingSource } from './SerialWeighingSource';

export class WeighingManager {
    private lastReadings: number[] = [];
    private readonly STABLE_THRESHOLD = 5;
    private currentReading: WeighingReading | null = null;
    private listeners: ((reading: WeighingReading) => void)[] = [];
    private connectionStatus: ConnectionStatus = 'DISCONNECTED';

    constructor(private source: WeighingSource) {
        console.log('[MANAGER] Created new instance');
        this.source.onReading((data) => {
            this.processReading(data);
        });
    }

    private processReading(data: WeighingReading) {
        this.currentReading = data;
        console.log(`[MANAGER PROCESS] Weight: ${data.weight}, Status: ${data.status}`); // 3단계: 매니저 수신 로그

        if (this.connectionStatus !== 'CONNECTED' && this.connectionStatus !== 'CONNECTING') {
            this.connectionStatus = 'CONNECTED';
        }

        if (data.status === 'STABLE') {
            this.lastReadings.push(data.weight);
            if (this.lastReadings.length > this.STABLE_THRESHOLD) {
                this.lastReadings.shift();
            }
        } else {
            this.lastReadings = [];
        }

        this.listeners.forEach(fn => {
            console.log(`[MANAGER NOTIFY] Triggering listener for ${data.weight}kg`);
            fn(data);
        });
    }

    subscribe(callback: (reading: WeighingReading) => void) {
        this.listeners.push(callback);
        console.log(`[MANAGER] New listener subscribed. Total listeners: ${this.listeners.length}`);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
            console.log(`[MANAGER] Listener unsubscribed. Total listeners: ${this.listeners.length}`);
        };
    }

    getCurrentReading() {
        return this.currentReading;
    }

    async connect() {
        if (this.connectionStatus === 'CONNECTED' || this.connectionStatus === 'CONNECTING') {
            return;
        }

        try {
            this.connectionStatus = 'CONNECTING';
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
            this.listeners.forEach(fn => fn({
                status: this.connectionStatus === 'ERROR' ? 'ERROR' : 'UNSTABLE',
                weight: 0,
                unit: 'kg',
                source: 'SERIAL',
                receivedAt: new Date(),
                raw: `STATUS_CHANGE:${this.connectionStatus}`
            }));
        }
    }

    setMockWeight(weight: number, status?: WeighingReading['status']) {
        if (this.source.setMockWeight) {
            this.source.setMockWeight(weight, status);
        }
    }
}

// Next.js 개발 모드에서 싱글톤 유지 (핫 리로딩 대응)
const globalForWeighing = global as unknown as { weighingManager: WeighingManager };

if (!globalForWeighing.weighingManager) {
    const COM_PORT = process.env.COM_PORT || 'COM3';
    console.log(`[Weighter] ★ 실제 하드웨어 모드 초기화 (Port: ${COM_PORT}, Settings: 2400 7E1)`);
    const activeSource = new SerialWeighingSource(COM_PORT);
    globalForWeighing.weighingManager = new WeighingManager(activeSource);
}

export const weighingManager = globalForWeighing.weighingManager;
