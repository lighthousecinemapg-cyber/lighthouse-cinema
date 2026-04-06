import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-auth';

// Visit this URL to start Google OAuth flow (one-time setup)
export async function GET() {
  const url = getAuthorizationUrl();
  return NextResponse.redirect(url);
}
