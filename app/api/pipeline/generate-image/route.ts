import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { project_id, image_prompt, parsed } = await req.json() as {
      project_id: string;
      image_prompt: string;
      parsed: Record<string, unknown>;
    };

    if (!project_id || !image_prompt) {
      return NextResponse.json({ error: 'project_id and image_prompt required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate image via DALL-E 3
    let image_url = '';
    if (process.env.OPENAI_API_KEY) {
      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: image_prompt,
          n: 1,
          size: '1792x1024',
          quality: 'hd',
        }),
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json() as { data: { url: string }[] };
        image_url = imgData.data[0].url;
      }
    }

    // Update project with image URL
    await supabase.from('xai_projects').update({ approved_image_url: image_url, status: 'pending_approval' }).eq('id', project_id);

    // Send approval email via Gmail API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xab-system.vercel.app';
    const approveUrl = `${baseUrl}/api/pipeline/approve?project_id=${project_id}&action=approve`;
    const rejectUrl = `${baseUrl}/api/pipeline/approve?project_id=${project_id}&action=reject`;

    const businessName = (parsed.business_name as string) ?? 'Your Website';
    const location = (parsed.location as string) ?? '';

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 30px;">
  <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 12px; padding: 40px;">
    <h1 style="color: #f59e0b; margin: 0 0 8px;">🎨 Hero Image Ready for Approval</h1>
    <p style="color: #94a3b8; margin: 0 0 30px;">Your website pipeline is ready for the next step</p>
    
    <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; color: #cbd5e1;"><strong style="color: #f59e0b;">Project:</strong> ${businessName}</p>
      <p style="margin: 8px 0 0; color: #cbd5e1;"><strong style="color: #f59e0b;">Location:</strong> ${location}</p>
      <p style="margin: 8px 0 0; color: #cbd5e1;"><strong style="color: #f59e0b;">Project ID:</strong> ${project_id}</p>
    </div>

    ${image_url ? `
    <div style="margin-bottom: 24px;">
      <p style="color: #94a3b8; margin: 0 0 12px; font-size: 14px;">Generated hero image:</p>
      <img src="${image_url}" style="width: 100%; border-radius: 8px; border: 2px solid #334155;" alt="Generated hero image" />
    </div>
    ` : `<p style="color: #94a3b8;">Image generation is in progress. Approve to continue with the build.</p>`}

    <div style="display: flex; gap: 16px; margin-top: 30px;">
      <a href="${approveUrl}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; flex: 1; text-align: center;">
        ✅ APPROVE — BUILD THE SITE
      </a>
    </div>
    <div style="margin-top: 12px;">
      <a href="${rejectUrl}" style="display: inline-block; background: transparent; color: #94a3b8; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; border: 1px solid #334155; text-align: center; width: 100%; box-sizing: border-box;">
        ❌ Reject — Start Over
      </a>
    </div>

    <p style="color: #475569; font-size: 12px; margin-top: 24px; text-align: center;">
      Clicking APPROVE will automatically create the GitHub repo, Vercel project, Drive folder, and build your website.
    </p>
  </div>
</body>
</html>`;

    // Send via Gmail API
    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GMAIL_SEND_TOKEN ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: Buffer.from(
          `To: jeremy@strategicmindsai.com\r\nFrom: XAB AutoBuilder <noreply@autobuilderos.com>\r\nSubject: ✅ Approve Your Hero Image — ${businessName}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${emailHtml}`
        ).toString('base64url'),
      }),
    });

    const emailSent = gmailRes.ok;

    return NextResponse.json({
      success: true,
      project_id,
      image_url,
      email_sent: emailSent,
      approve_url: approveUrl,
      reject_url: rejectUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image generation failed';
    console.error('[pipeline/generate-image]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
