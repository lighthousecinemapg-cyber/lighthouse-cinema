import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-auth';

// ================================================================
// GOOGLE OAUTH CALLBACK
// One-time setup: user authorizes â we get refresh_token
// Visit /api/auth/google/start to begin the flow
// ================================================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({
      error: 'Authorization denied',
      details: error,
      message: 'You need to grant access to Business Profile and Calendar.',
    }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({
      error: 'No authorization code received',
      message: 'Start the flow by visiting /api/auth/google/start',
    }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // In production, you'd store these securely. For now, display them.
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Google Auth Success</title>
      <style>
        body { font-family: Inter, sans-serif; background: #0A0A0A; color: #FAFAFA; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { color: #C9A84C; font-family: Georgia, serif; }
        .token-box { background: #111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 20px; margin: 16px 0; word-break: break-all; font-family: monospace; font-size: 0.85rem; }
        .label { color: #C9A84C; font-weight: 600; display: block; margin-bottom: 4px; }
        .warning { color: #FFA726; margin-top: 24px; padding: 16px; background: rgba(255,167,38,0.1); border-radius: 8px; }
      </style>
      </head>
      <body>
        <h1>Google Authorization Successful!</h1>
        <p>Copy these values to your <code>.env.local</code> file on Vercel:</p>

        <div class="token-box">
          <span class="label">GOOGLE_REFRESH_TOKEN=</span>
          ${tokens.refreshToken}
        </div>

        <div class="token-box">
          <span class="label">GBP_ACCESS_TOKEN= (temporary, auto-refreshes)</span>
          ${tokens.accessToken}
        </div>

        <div class="token-box">
          <span class="label">Expires in:</span>
          ${tokens.expiresIn} seconds
        </div>

        <div class="token-box">
          <span class="label">Scopes granted:</span>
          ${tokens.scope}
        </div>

        <div class="warning">
          <strong>Important:</strong> Save the <code>GOOGLE_REFRESH_TOKEN</code> value above into your Vercel environment variables immediately.
          This token does not expire and allows the system to auto-refresh access tokens forever. You will never need to authorize again.
        </div>

        <p style="margin-top: 24px; color: #888;">You can close this page now. Your CineMax AI system is connected to Google.</p>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (err) {
    return NextResponse.json({
      error: 'Token exchange failed',
      details: err.message,
      message: 'Check your GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local',
    }, { status: 500 });
  }
}
