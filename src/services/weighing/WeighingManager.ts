import { WeighingReading, WeighingSource, ConnectionStatus } from './types';
import { weighingSource as mockSource } from './MockWeighingSource';

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
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
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
                source: COM_PORT ? 'SERIAL' : 'MOCK',
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

// 환경변수 COM_PORT가 있으면 실기 연동, 없으면 Mock 사용
const COM_PORT = process.env.COM_PORT || '';

let activeSource = mockSource;

if (COM_PORT) {
    try {
        const { SerialWeighingSource } = require('./SerialWeighingSource');
        activeSource = new SerialWeighingSource(COM_PORT);
        console.log(`[Weighter] ★ 실제 하드웨어 모드 (Port: ${COM_PORT})`);
    } catch (e) {
        console.error(`[Weighter] SerialPort 로드 실패:`, e);
    }
} else {
    console.log(`[Weighter] ⚠ 시뮬레이션 모드 가동 중 (COM_PORT 설정 없음)`);

    // 사용 가능한 포트 리스트를 출력하여 사용자에게 도움을 줌
    try {
        console.log(`[Weighter] 시리얼 포트 탐색 시작...`);
        const { SerialPort } = require('serialport');
        SerialPort.list().then((ports: any[]) => {
            if (ports.length > 0) {
                console.log(`[Weighter] ★ 연결 가능한 포트 ${ports.length}개 발견:`);
                ports.forEach(p => console.log(`  - ${p.path} (${p.manufacturer || '알 수 없는 제조사'})`));
                console.log(`[Weighter] 위 포트 중 하나를 사용하려면 .env.local 파일에 COM_PORT=포트명 을 입력하세요.`);
            } else {
                console.log(`[Weighter] ⚠ 감지된 시리얼 포트가 없습니다. 계량기가 연결되어 있는지 확인하세요.`);
            }
        }).catch((err: any) => {
            console.error(`[Weighter] 시리얼 포트 목록을 가져오는 중 오류 발생:`, err);
        });
    } catch (e) {
        console.error(`[Weighter] SerialPort 라이브러리 로드 실패:`, e);
    }
}

export const weighingManager = new WeighingManager(activeSource);
