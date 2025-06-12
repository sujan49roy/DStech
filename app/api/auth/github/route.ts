import { NextResponse } from 'next/server';

export async function GET() {
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  if (!githubClientId) {
    console.error('GITHUB_CLIENT_ID is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: GITHUB_CLIENT_ID is missing.' }, { status: 500 });
  }

  if (!nextAuthUrl) {
    console.error('NEXTAUTH_URL is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: NEXTAUTH_URL is missing.' }, { status: 500 });
  }

  const redirectUri = `https://dstechnology.vercel.app/api/auth/github/callback`;
  const scope = 'read:user user:email repo';
  // const state = crypto.randomBytes(16).toString('hex'); // Optional: CSRF protection

  // For simplicity, state is omitted here, but it's a security best practice.
  // If implementing state, you would typically set it in a HttpOnly cookie:
  // cookies().set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 10 });

  const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`; // &state=${state}

  return NextResponse.redirect(authorizationUrl);
}
