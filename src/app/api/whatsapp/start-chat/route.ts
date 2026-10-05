import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { CONVERSATION_SELECT, normalizeConversation } from '@/lib/inbox/conversations';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { accountId, userId } = await requireRole('agent');
    const body = await request.json();
    const {
      phone: rawPhone,
      name,
      message,
      sendWebsiteInquiry,
      templateName,
      senderName: inputSender,
      companyName: inputCompany,
    } = body;

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with country code (e.g. +971... or +92...)' },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();
    const effectiveUserId = userId;

    // 1. Check if contact already exists by exact phone or suffix
    const suffix = digits.slice(-8);
    const { data: candidates } = await admin
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .like('phone', `%${suffix}`);

    let contact = candidates?.find((c) => c.phone.replace(/\D/g, '') === digits) || candidates?.[0];

    if (!contact) {
      const { data: newContact, error: createError } = await admin
        .from('contacts')
        .insert({
          user_id: effectiveUserId,
          account_id: accountId,
          phone: digits,
          name: name?.trim() || null,
        })
        .select()
        .single();

      if (createError || !newContact) {
        console.error('[start-chat] Failed to create contact:', createError);
        return NextResponse.json(
          { error: createError?.message || 'Failed to create contact' },
          { status: 500 }
        );
      }
      contact = newContact;
    } else if (name?.trim() && !contact.name) {
      const { data: updated } = await admin
        .from('contacts')
        .update({ name: name.trim() })
        .eq('id', contact.id)
        .select()
        .single();
      if (updated) contact = updated;
    }

    // 2. Find or create conversation
    let { data: conv } = await admin
      .from('conversations')
      .select(CONVERSATION_SELECT)
      .eq('account_id', accountId)
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: convError } = await admin
        .from('conversations')
        .insert({
          user_id: effectiveUserId,
          account_id: accountId,
          contact_id: contact.id,
          status: 'open',
          unread_count: 0,
        })
        .select(CONVERSATION_SELECT)
        .single();

      if (convError || !newConv) {
        console.error('[start-chat] Failed to create conversation:', convError);
        return NextResponse.json(
          { error: convError?.message || 'Failed to create conversation' },
          { status: 500 }
        );
      }
      conv = newConv;
    }

    // 3. If website inquiry template or initial message was requested, send it
    const shouldSendInquiry =
      sendWebsiteInquiry || templateName === 'website_service_inquiry';

    if (shouldSendInquiry) {
      const { data: userProfile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      const { data: accountData } = await admin
        .from('accounts')
        .select('name')
        .eq('id', accountId)
        .maybeSingle();

      const clientName = name?.trim() || contact.name?.trim() || 'there';
      const sender = inputSender?.trim() || userProfile?.full_name?.trim() || 'Our Team';
      const company = inputCompany?.trim() || accountData?.name?.trim() || 'Jeose CRM';

      const renderedText =
        message?.trim() ||
        `Hello ${clientName},\n\nI hope you’re doing well. We received your inquiry about our website services. Please let us know when you’re available for a quick chat, and we’ll be happy to discuss your requirements.\n\nBest regards,\n${sender}\n${company} team`;

      const { data: approvedTpl } = await admin
        .from('message_templates')
        .select('*')
        .in('name', ['website_service_inquiry', 'website_inquiry_service'])
        .eq('status', 'APPROVED')
        .maybeSingle();

      try {
        if (approvedTpl) {
          await sendMessageToConversation(admin, accountId, {
            conversationId: conv.id,
            messageType: 'template',
            templateName: approvedTpl.name,
            templateParams: [clientName, sender, company],
            contentText: renderedText,
          });
        } else {
          // Deliver text via approved fallback template so it sends immediately without 24h block
          await sendMessageToConversation(admin, accountId, {
            conversationId: conv.id,
            messageType: 'text',
            contentText: renderedText,
          });
        }
      } catch (sendErr) {
        console.error('[start-chat] Inquiry template send failed:', sendErr);
      }
    } else if (message && typeof message === 'string' && message.trim()) {
      try {
        await sendMessageToConversation(admin, accountId, {
          conversationId: conv.id,
          messageType: 'text',
          contentText: message.trim(),
        });
      } catch (sendErr) {
        console.error('[start-chat] Initial message send failed:', sendErr);
      }
    }

    const normalized = normalizeConversation(conv);
    return NextResponse.json({ conversation: normalized, contact });
  } catch (err) {
    console.error('[start-chat] error:', err);
    return toErrorResponse(err);
  }
}
