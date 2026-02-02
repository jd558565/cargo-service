import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { WeighingReading, WeighingSource } from './types';
import { AND4321Parser } from './AND4321Parser';

/**
 * A&D NEW-4321 PLUS 실기 연동 소스
 * 로컬 PC의 Serial Port(RS-232)를 통해 데이터를 수신합니다.
 */
export class SerialWeighingSource implements WeighingSource {
    private port: SerialPort | null = null;
    private parser: ReadlineParser | null = null;
    private readingCallback: ((data: WeighingReading) => void) | null = null;

    constructor(
        private path: string,
        private baudRate: number = 2400
    ) { }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.port = new SerialPort({
                    path: this.path,
                    baudRate: this.baudRate,
                    dataBits: 7,
                    parity: 'even',
                    stopBits: 1,
                    autoOpen: false
                });

                // 패킷 종료 문자인 CR LF (\r\n) 기준으로 분리
                this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

                this.port.open((err) => {
                    if (err) {
                        console.error('SerialPort Open Error:', err.message);
                        return reject(err);
                    }
                    console.log(`SerialPort (${this.path}) Opened at ${this.baudRate}bps`);

                    this.setupParser();
                    resolve();
                });

                this.port.on('error', (err) => {
                    console.error('SerialPort Error Event:', err.message);
                });

                this.port.on('close', () => {
                    console.log('SerialPort Closed');
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    private setupParser() {
        if (!this.parser) return;

        this.parser.on('data', (raw: string) => {
            console.log(`[SERIAL RAW] ${raw}`); // 1단계: 시리얼 수신 원문 로그
            const parsed = AND4321Parser.parse(raw);
            if (parsed && this.readingCallback) {
                this.readingCallback(parsed as WeighingReading);
            }
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.port && this.port.isOpen) {
                this.port.close(() => {
                    this.port = null;
                    this.parser = null;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    onReading(callback: (data: WeighingReading) => void): void {
        this.readingCallback = callback;
    }
}
