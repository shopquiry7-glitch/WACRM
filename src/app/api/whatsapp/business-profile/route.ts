import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getWhatsAppBusinessProfile,
  updateWhatsAppBusinessProfile,
  uploadResumableMedia,
} from '@/lib/whatsapp/meta-api'
import { decrypt } from '@/lib/whatsapp/encryption'
import path from 'path'
import fs from 'fs'

async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data?.account_id) return null
  return data.account_id as string
}

/**
 * GET /api/whatsapp/business-profile
 * Fetch current WhatsApp Business profile details (picture URL, about, etc.)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 400 })
    }

    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('phone_number_id, access_token, status')
      .eq('account_id', accountId)
      .maybeSingle()

    if (configError || !config) {
      return NextResponse.json({ error: 'WhatsApp is not configured' }, { status: 400 })
    }

    const accessToken = decrypt(config.access_token)
    const profile = await getWhatsAppBusinessProfile({
      phoneNumberId: config.phone_number_id,
      accessToken,
    })

    return NextResponse.json({
      success: true,
      profile,
      phoneNumberId: config.phone_number_id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch business profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/whatsapp/business-profile
 * Upload and update the WhatsApp Business profile picture (DP) and profile info.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 400 })
    }

    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('phone_number_id, access_token, status')
      .eq('account_id', accountId)
      .maybeSingle()

    if (configError || !config) {
      return NextResponse.json({ error: 'WhatsApp is not configured' }, { status: 400 })
    }

    const appId = process.env.META_APP_ID
    if (!appId) {
      return NextResponse.json(
        { error: 'META_APP_ID is not configured in server environment.' },
        { status: 500 }
      )
    }

    const accessToken = decrypt(config.access_token)

    let bodyJson: {
      about?: string
      description?: string
      email?: string
      websites?: string[]
      address?: string
      imagePath?: string
    } = {}

    try {
      bodyJson = await req.json()
    } catch {
      // Default empty if body not JSON
    }

    // Default to the square Jeose DP image
    const rawImageName = path.basename(
      bodyJson.imagePath || 'jeose-dp-square.png'
    )
    const fullPath = path.join(process.cwd(), 'public', 'images', rawImageName)

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: `Image file not found at ${relativeImagePath}` },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(fullPath)
    const fileName = path.basename(fullPath)
    const mimeType = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png'

    // Step 1: Upload via Meta Resumable Upload API to get the handle
    const { handle } = await uploadResumableMedia({
      appId,
      accessToken,
      fileName,
      mimeType,
      bytes: new Uint8Array(fileBuffer),
    })

    // Step 2: Update WhatsApp Business Profile
    await updateWhatsAppBusinessProfile({
      phoneNumberId: config.phone_number_id,
      accessToken,
      profilePictureHandle: handle,
      about: bodyJson.about || 'Jeose Services - Complete Website & Branding Solutions',
      description: bodyJson.description,
      email: bodyJson.email,
      websites: bodyJson.websites,
      address: bodyJson.address,
    })

    // Step 3: Fetch updated profile to verify
    let updatedProfile = null
    try {
      updatedProfile = await getWhatsAppBusinessProfile({
        phoneNumberId: config.phone_number_id,
        accessToken,
      })
    } catch {
      // Non-fatal if fetch fails right after upload
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Business DP successfully updated on Meta!',
      handle,
      profile: updatedProfile,
    })
  } catch (err: unknown) {
    console.error('Error updating WhatsApp business profile:', err)
    const message = err instanceof Error ? err.message : 'Failed to update WhatsApp profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
