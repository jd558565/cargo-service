import { NextRequest } from 'next/server';
import { weighingManager } from '@/services/weighing/WeighingManager';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const unsubscribe = weighingManager.subscribe((reading) => {
                const data = `data: ${JSON.stringify(reading)}\n\n`;
                try {
                    controller.enqueue(encoder.encode(data));
                } catch (e) {
                    // Controller might be closed
                    unsubscribe();
                }
            });

            req.signal.addEventListener('abort', () => {
                unsubscribe();
                controller.close();
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
