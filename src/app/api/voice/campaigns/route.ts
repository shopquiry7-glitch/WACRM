import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_CAMPAIGNS } from '@/lib/voice-calling/presets';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ campaigns: INITIAL_CAMPAIGNS });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return NextResponse.json({ campaigns: INITIAL_CAMPAIGNS });
    }

    const { data: campaigns, error } = await supabase
      .from('voice_campaigns')
      .select('*')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false });

    if (error || !campaigns || campaigns.length === 0) {
      return NextResponse.json({ campaigns: INITIAL_CAMPAIGNS });
    }

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error('Error fetching voice campaigns:', err);
    return NextResponse.json({ campaigns: INITIAL_CAMPAIGNS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, agentId, agentName, leads = [], maxConcurrentCalls = 2 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    const newCampaign = {
      id: `camp-${Date.now()}`,
      name,
      agentId: agentId || 'agent-marketing-2',
      agentName: agentName || 'Alex - Outbound Marketing & Leads Qualifier',
      status: 'running',
      callingWindowStart: '09:00',
      callingWindowEnd: '18:00',
      maxConcurrentCalls: Number(maxConcurrentCalls) || 2,
      retryAttempts: 1,
      totalLeads: leads.length,
      completedCalls: 0,
      answeredCalls: 0,
      qualifiedLeads: 0,
      leads: leads.map((l: { id?: string; name?: string; phone: string; category?: string }, idx: number) => ({
        id: l.id || `lead-${Date.now()}-${idx}`,
        name: l.name || `Lead #${idx + 1}`,
        phone: l.phone,
        category: l.category || 'Prospect',
        status: 'pending',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err) {
    console.error('Failed to create voice campaign:', err);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
