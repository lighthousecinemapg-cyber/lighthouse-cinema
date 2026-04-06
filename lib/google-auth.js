// ================================================================
// GOOGLE OAUTH 2.0 TOKEN MANAGER
// Auto-refreshes access tokens so you never re-authorize manually
// Supports: Google Business Profile API + Calendar API + Meet
// ================================================================

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Token cache (in production, store in Redis or database)
let tokenCache = {
  accessToken: process.env.GBP_ACCESS_TOKEN || null,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
  expiresAt: 0,
};

/**
 * Get a valid Google OAuth access token.
 * Auto-refreshes if expired or about to expire (5-minute buffer).
 */
export async function getGoogleAccessToken() {
  const now = Date.now();

  // Return cached token if still valid (with 5-min buffer)
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 300000) {
    return tokenCache.accessToken;
  }

  // Refresh the token
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = tokenCache.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Missing Google OAuth credentials. Using static token as fallback.');
    return process.env.GBP_ACCESS_TOKEN || null;
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Google token refresh failed:', err);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    tokenCache.accessToken = data.access_token;
    tokenCache.expiresAt = now + (data.expires_in * 1000);

    // If a new refresh token was issued, update it
    if (data.refresh_token) {
      tokenCache.refreshToken = data.refresh_token;
      console.log('New refresh token received â update your .env.local!');
    }

    console.log(`Google token refreshed. Expires in ${data.expires_in}s`);
    return data.access_token;

  } catch (err) {
    console.error('Google auth error:', err.message);
    // Fall back to static token
    return process.env.GBP_ACCESS_TOKEN || null;
  }
}

/**
 * Generate the initial OAuth authorization URL.
 * User visits this URL â grants access â receives authorization code.
 * Then exchange code for refresh_token (one-time setup).
 */
export function getAuthorizationUrl() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',     // GBP
    'https://www.googleapis.com/auth/calendar',             // Calendar
    'https://www.googleapis.com/auth/calendar.events',      // Calendar events
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',     // CRITICAL: gets refresh_token
    prompt: 'consent',          // Force consent to always get refresh_token
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange authorization code for access_token + refresh_token.
 * Called once during initial setup.
 */
export async function exchangeCodeForTokens(authorizationCode) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Code exchange failed: ${err}`);
  }

  const data = await response.json();

  // Cache the tokens
  tokenCache.accessToken = data.access_token;
  tokenCache.refreshToken = data.refresh_token;
  tokenCache.expiresAt = Date.now() + (data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
    message: 'Save the refresh_token in your .env.local as GOOGLE_REFRESH_TOKEN. You only need to do this once.',
  };
}
