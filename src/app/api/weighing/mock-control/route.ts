import { NextRequest, NextResponse } from 'next/server';
import { weighingManager } from '@/services/weighing/WeighingManager';

export async function POST(req: NextRequest) {
    try {
        const { weight, status } = await req.json();
        weighingManager.setMockWeight(weight, status);
        return NextResponse.json({ success: true, weight, status });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}
