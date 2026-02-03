import { NextRequest } from 'next/server';
import { weighingManager } from '@/services/weighing/WeighingManager';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const sendPing = () => {
                try {
                    controller.enqueue(encoder.encode(': ping\n\n'));
                } catch (e) {
                    clearInterval(pingInterval);
                }
            };

            const pingInterval = setInterval(sendPing, 5000);

            const unsubscribe = weighingManager.subscribe((reading) => {
                const data = `data: ${JSON.stringify(reading)}\n\n`;
                console.log(`[SSE PUSH] Sending weight: ${reading.weight}kg to client`); // 3단계: SSE 전송 로그
                try {
                    controller.enqueue(encoder.encode(data));
                } catch (e) {
                    unsubscribe();
                    clearInterval(pingInterval);
                }
            });

            req.signal.addEventListener('abort', () => {
                unsubscribe();
                clearInterval(pingInterval);
                try { controller.close(); } catch (e) { }
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
