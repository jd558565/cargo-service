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

        // 연결 시뮬레이션 지연 (1초)
        await new Promise(resolve => setTimeout(resolve, 1000));

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
        this.currentWeight = Math.floor(Math.max(0, weight)); // 0 또는 자연수 강제
        this.currentStatus = status;

        // 무게가 설정되면 잠시 후 Stable로 변경되는 시뮬레이션
        if (status === 'UNSTABLE') {
            setTimeout(() => {
                if (this.currentWeight === Math.floor(Math.max(0, weight))) {
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
                // 노이즈 추가하되 결과는 항상 정수
                let noise = 0;
                if (this.currentStatus === 'UNSTABLE') {
                    // -2 ~ +2 사이의 정수 노이즈
                    noise = Math.floor(Math.random() * 5) - 2;
                }

                let finalWeight = this.currentWeight + noise;
                finalWeight = Math.max(0, finalWeight); // 음수 방지

                this.callback({
                    status: this.currentStatus,
                    weight: finalWeight,
                    unit: 'kg',
                    receivedAt: new Date(),
                    raw: `MOCK_DATA:${this.currentStatus}:${finalWeight}`
                });
            }
        }, 200); // 200ms 마다 전송
    }
}

// 싱글톤 인스턴스 (현 단계에서는 Mock 사용)
export const weighingSource: WeighingSource = new MockWeighingSource();
