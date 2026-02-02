import { WeighingReading, WeighingSource } from './types';

export class MockWeighingSource implements WeighingSource {
    private callback: ((data: WeighingReading) => void) | null = null;
    private currentWeight: number = 0;
    private currentStatus: WeighingReading['status'] = 'STABLE';
    private timer: NodeJS.Timeout | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('MockWeighingSource already connected');
            return;
        }
        this.isConnected = true;
        console.log('MockWeighingSource connected');
        this.startStreaming();
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('MockWeighingSource disconnected');
    }

    onReading(callback: (data: WeighingReading) => void): void {
        this.callback = callback;
    }

    setMockWeight(weight: number, status: WeighingReading['status'] = 'UNSTABLE'): void {
        this.currentWeight = weight;
        this.currentStatus = status;

        // 무게가 설정되면 잠시 후 Stable로 변경되는 시뮬레이션
        if (status === 'UNSTABLE') {
            setTimeout(() => {
                if (this.currentWeight === weight) {
                    this.currentStatus = 'STABLE';
                }
            }, 2000);
        }
    }

    private startStreaming() {
        // 기존 타이머가 있다면 제거하여 중복 실행 방지
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.timer = setInterval(() => {
            if (this.callback && this.isConnected) {
                // 미세한 노이즈 추가
                const noise = this.currentStatus === 'UNSTABLE' ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.1;

                this.callback({
                    status: this.currentStatus,
                    weight: parseFloat((this.currentWeight + noise).toFixed(2)),
                    unit: 'kg',
                    receivedAt: new Date(),
                    raw: `MOCK_DATA:${this.currentStatus}:${this.currentWeight}`
                });
            }
        }, 200); // 200ms 마다 전송
    }
}

// 싱글톤 인스턴스 (현 단계에서는 Mock 사용)
export const weighingSource: WeighingSource = new MockWeighingSource();
