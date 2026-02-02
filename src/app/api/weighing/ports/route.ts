import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { SerialPort } = require('serialport');
        const ports = await SerialPort.list();
        return NextResponse.json({ success: true, ports });
    } catch (error) {
        return NextResponse.json({ success: false, ports: [], error: String(error) });
    }
}
