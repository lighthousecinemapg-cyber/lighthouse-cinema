// /app/api/auth/route.js â Staff login + token verification
import { verifyPassword, createToken, verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const validUser = process.env.STAFF_USERNAME || 'pg';
    const validHash = process.env.STAFF_PASSWORD_HASH;

    if (!validHash) {
      console.error('STAFF_PASSWORD_HASH env var not set');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (username !== validUser || !verifyPassword(password, validHash)) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(username);

    return new Response(JSON.stringify({ success: true, user: username }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `staff_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      },
    });
  } catch (err) {
    console.error('[auth] login error', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET = verify current token
export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/staff_token=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({ authenticated: true, user: payload.sub });
}

// DELETE = logout
export async function DELETE() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'staff_token=; Path=/; HttpOnly; Max-Age=0',
    },
  });
}
