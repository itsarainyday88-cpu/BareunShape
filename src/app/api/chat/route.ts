import { NextResponse } from 'next/server';
import { generateAgentResponseStream } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agentId, message, history, useSearch }: any = body;

        if (!agentId || !message) {
            return NextResponse.json({ error: 'Missing activeAgent or message' }, { status: 400 });
        }

        // --- Create a ReadableStream and return it immediately ---
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponseBuffer = ''; // Buffer to capture the main agent's output

                try {
                    // [Stage 1] Main Agent Generation
                    // Generate chunks using our Gemini wrapper
                    const generator = generateAgentResponseStream(agentId, message, history, useSearch);

                    for await (const chunk of generator) {
                        const encoded = encoder.encode(chunk);
                        controller.enqueue(encoded);
                        fullResponseBuffer += chunk; // Accumulate for review
                    }

                    controller.close();

                    // --- Cloud Sync: Save to Supabase ---
                    if (fullResponseBuffer.trim().length > 50) {
                        try {
                            const { error: dbError } = await supabase
                                .from('documents')
                                .insert([{
                                    agent_id: String(agentId),
                                    content: fullResponseBuffer,
                                    created_at: new Date().toISOString()
                                }]);

                            if (dbError) {
                                console.error('[Cloud Sync] DB insert error (documents):', dbError);
                            } else {
                                console.log(`[Cloud Sync] Document successfully synced to Supabase (agent: ${agentId})`);
                            }
                        } catch (syncErr) {
                            console.error('[Cloud Sync] Supabase sync unexpected error:', syncErr);
                        }
                    }
                } catch (error: any) {
                    console.error('Streaming Error:', error);
                    controller.error(error);
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('------- CHAT API ERROR -------');
        console.error('Agent ID:', (req as any).body?.agentId);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('------------------------------');

        return NextResponse.json({
            error: `Server Error: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
