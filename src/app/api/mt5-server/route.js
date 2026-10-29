import { NextResponse } from 'next/server';
import clientPipeline from "./helper";


const MT5_SERVER = "test.gtcfx.com"; // Replace with actual MT5 server
const MT5_PORT = 443; // Typically 443 for HTTPS

export async function POST(req) {
    try {
        const body = await req.json(); // Parse incoming request body
        const result = await clientPipeline(body)

        // Return JSON response
        return NextResponse.json({ success: result?.success, data: result, message: result?.message }, { status: 200 });
    } catch (error) {
        console.error('API Error:', error); 

        // Ensure a response is always returned
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}