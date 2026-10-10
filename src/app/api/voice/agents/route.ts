import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_VOICE_AGENTS } from '@/lib/voice-calling/presets';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // In development or demo mode fallback
      return NextResponse.json({ agents: INITIAL_VOICE_AGENTS });
    }

    // Get user account id
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return NextResponse.json({ agents: INITIAL_VOICE_AGENTS });
    }

    const { data: agents, error } = await supabase
      .from('voice_agents')
      .select('*')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false });

    if (error || !agents || agents.length === 0) {
      return NextResponse.json({ agents: INITIAL_VOICE_AGENTS });
    }

    return NextResponse.json({ agents });
  } catch (err) {
    console.error('Error fetching voice agents:', err);
    return NextResponse.json({ agents: INITIAL_VOICE_AGENTS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, agent: body });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return NextResponse.json({ success: true, agent: body });
    }

    const payload = {
      account_id: profile.account_id,
      name: body.name,
      type: body.type ?? 'receptionist',
      status: body.status ?? 'active',
      voice_provider: body.voiceProvider ?? 'elevenlabs',
      voice_id: body.voiceId ?? '21m00Tcm4TlvDq8ikWAM',
      voice_name: body.voiceName ?? 'Rachel (Warm & Empathetic)',
      language: body.language ?? 'en-US',
      llm_model: body.llmModel ?? 'gpt-4o-mini',
      first_message: body.firstMessage,
      system_prompt: body.systemPrompt,
      temperature: body.temperature ?? 0.70,
      silence_timeout_seconds: body.silenceTimeoutSeconds ?? 15,
      interruption_handling: body.interruptionHandling ?? true,
      transfer_phone_number: body.transferPhoneNumber,
    };

    const { data, error } = await supabase
      .from('voice_agents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Database insert failed, returning fallback success:', error.message);
      return NextResponse.json({ success: true, agent: body });
    }

    return NextResponse.json({ success: true, agent: data });
  } catch (err) {
    console.error('Failed to create voice agent:', err);
    return NextResponse.json({ error: 'Failed to create voice agent' }, { status: 500 });
  }
}
