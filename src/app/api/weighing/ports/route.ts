import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { SerialPort } = require('serialport');
        const ports = await SerialPort.list();
        console.log(`[API PORTS] Discovery found ${ports.length} ports`);
        return NextResponse.json({ success: true, ports });
    } catch (error) {
        console.error(`[API PORTS] Discovery failed:`, error);
        return NextResponse.json({ success: false, ports: [], error: String(error) });
    }
}
