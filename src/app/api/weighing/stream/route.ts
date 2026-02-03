import { NextRequest } from 'next/server';
import { weighingManager } from '@/services/weighing/WeighingManager';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            console.log('[SSE] Client connected to weight stream');
            const sendPing = () => {
                try {
                    controller.enqueue(encoder.encode(': ping\n\n'));
                } catch (e) {
                    clearInterval(pingInterval);
                }
            };

            const pingInterval = setInterval(sendPing, 5000);

            const unsubscribe = weighingManager.subscribe((reading) => {
                console.log(`[SSE] Pushing data to client: ${reading.weight}kg (${reading.status})`);
                const data = `data: ${JSON.stringify(reading)}\n\n`;
                try {
                    controller.enqueue(encoder.encode(data));
                } catch (e) {
                    console.error('[SSE] Enqueue error:', e);
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
