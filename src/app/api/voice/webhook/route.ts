import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let bodyData: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      bodyData = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        bodyData[key] = value.toString();
      });
    }

    // Determine event source (Twilio, Vapi, Retell)
    const callSid = bodyData.CallSid || bodyData.call_id || `call-${Date.now()}`;
    const from = bodyData.From || bodyData.caller || 'Unknown';
    const to = bodyData.To || bodyData.phone_number || 'Main Hotline';

    // Standard Twilio Voice response (TwiML) if requested by Twilio Voice webhook
    const isTwilio = !!bodyData.CallSid || !contentType.includes('application/json');

    if (isTwilio) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you for calling Apex Business Services. Connecting you to our AI Voice Receptionist.</Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna-Neural">Hello! How may I assist you today?</Say>
</Response>`;

      return new Response(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    return NextResponse.json({
      received: true,
      callSid,
      from,
      to,
      status: 'in-progress',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Voice webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Jeose CRM AI Voice Webhook Gateway',
    protocols: ['Twilio TwiML', 'Vapi Realtime Webhook', 'Retell AI SIP', 'ElevenLabs Conversational Webhook'],
  });
}
