import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Decrypt function matching src/lib/whatsapp/encryption.ts
function decrypt(encryptedText, keyHex) {
  const parts = encryptedText.split(':');
  if (parts.length === 3) {
    const [ivHex, ctHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let dec = decipher.update(ctHex, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
  const [ivHex, ctHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(keyHex, 'hex'), iv);
  let dec = decipher.update(ctHex, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

async function main() {
  console.log('🚀 Starting WhatsApp Business Profile Picture (DP) Update...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const appId = process.env.META_APP_ID;

  if (!supabaseUrl || !supabaseKey || !encryptionKey || !appId) {
    console.error('❌ Missing environment variables in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch WhatsApp configuration
  console.log('📦 Fetching WhatsApp configuration from database...');
  const { data: configs, error: dbError } = await supabase
    .from('whatsapp_config')
    .select('*')
    .eq('status', 'connected')
    .limit(1);

  if (dbError || !configs || configs.length === 0) {
    console.error('❌ Could not find connected WhatsApp config in database:', dbError);
    process.exit(1);
  }

  const config = configs[0];
  const phoneNumberId = config.phone_number_id;
  const accessToken = decrypt(config.access_token, encryptionKey);

  console.log(`✅ Found WhatsApp Config for Phone Number ID: ${phoneNumberId}`);

  // 2. Load square Jeose DP image
  const imgPath = path.resolve('public/images/jeose-dp-square.png');
  if (!fs.existsSync(imgPath)) {
    console.error(`❌ Image file not found: ${imgPath}`);
    process.exit(1);
  }

  const fileBytes = fs.readFileSync(imgPath);
  console.log(`📸 Loaded Image: ${imgPath} (${(fileBytes.length / 1024).toFixed(1)} KB)`);

  // 3. Step 1: Start Resumable Upload session on Meta
  console.log('🌐 Opening Resumable Upload session on Meta Graph API...');
  const startParams = new URLSearchParams({
    file_name: 'jeose-dp-square.png',
    file_length: String(fileBytes.byteLength),
    file_type: 'image/png',
    access_token: accessToken,
  });

  const sessionRes = await fetch(
    `https://graph.facebook.com/v21.0/${appId}/uploads?${startParams.toString()}`,
    { method: 'POST' }
  );

  const sessionData = await sessionRes.json();
  if (!sessionRes.ok || !sessionData.id) {
    console.error('❌ Meta Resumable Upload session creation failed:', sessionData);
    process.exit(1);
  }

  console.log(`✅ Upload session created: ${sessionData.id}`);

  // 4. Step 2: Upload image bytes to the session
  console.log('📤 Uploading image binary data to Meta...');
  const uploadRes = await fetch(`https://graph.facebook.com/v21.0/${sessionData.id}`, {
    method: 'POST',
    headers: {
      Authorization: `OAuth ${accessToken}`,
      file_offset: '0',
    },
    body: fileBytes,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.h) {
    console.error('❌ Meta binary upload failed:', uploadData);
    process.exit(1);
  }

  const handle = uploadData.h;
  console.log(`✅ Meta Media Handle received: ${handle}`);

  // 5. Step 3: Update WhatsApp Business Profile Picture
  console.log('🔄 Setting DP on WhatsApp Business Profile...');
  const updateRes = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_profile`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        profile_picture_handle: handle,
        about: 'Jeose Services - Complete Website & Branding Solutions',
      }),
    }
  );

  const updateData = await updateRes.json();
  if (!updateRes.ok || !updateData.success) {
    console.error('❌ Failed to update WhatsApp business profile:', updateData);
    process.exit(1);
  }

  console.log('🎉 SUCCESS! WhatsApp Business Profile Picture has been successfully updated on Meta!');
  console.log('📱 Any client receiving a message from this WhatsApp number will now see the Jeose logo DP!');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
