import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // For state cookie if implemented
import crypto from 'crypto'; // For state generation if implemented

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (!googleClientId) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: GOOGLE_CLIENT_ID is missing.' }, { status: 500 });
  }

  if (!nextAuthUrl) {
    console.error('NEXTAUTH_URL is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: NEXTAUTH_URL is missing.' }, { status: 500 });
  }

  const redirectUri = `${nextAuthUrl}/api/auth/google/callback`;
  const scope = 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

  // CSRF protection: Generate and store state in a cookie
  // const state = crypto.randomBytes(16).toString('hex');
  // cookies().set('google_oauth_state', state, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   maxAge: 60 * 10, // 10 minutes
  //   path: '/',
  //   sameSite: 'lax',
  // });
  // For simplicity in this step, state is omitted as per instruction, but it's highly recommended.

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'online', // 'offline' if refresh tokens are needed
    // prompt: 'consent', // Optional: to ensure consent screen is always shown
    // state: state, // Include state for CSRF protection
  });

  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authorizationUrl);
}
