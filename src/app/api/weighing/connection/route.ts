import { NextRequest, NextResponse } from 'next/server';
import { weighingManager } from '@/services/weighing/WeighingManager';

export async function GET() {
    return NextResponse.json({
        connected: weighingManager.getConnectedStatus(),
        status: weighingManager.getConnectionState()
    });
}

export async function POST(req: NextRequest) {
    try {
        const { action } = await req.json();
        if (action === 'connect') {
            await weighingManager.connect();
        } else if (action === 'disconnect') {
            await weighingManager.disconnect();
        }
        return NextResponse.json({
            success: true,
            connected: weighingManager.getConnectedStatus(),
            status: weighingManager.getConnectionState()
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Connection failed' }, { status: 500 });
    }
}
