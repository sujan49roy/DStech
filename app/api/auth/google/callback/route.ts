import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findOrCreateUserByGoogleProfile } from '@/lib/auth'; // Adjust path if needed
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // For CSRF, if implemented

  // Optional: Retrieve and validate state cookie
  // const storedState = cookies().get('google_oauth_state')?.value;
  // if (!state || !storedState || state !== storedState) {
  //   console.error('Invalid Google OAuth state.');
  //   return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  // }
  // cookies().delete('google_oauth_state'); // Clear state cookie

  if (!code) {
    console.error('No code received from Google.');
    return NextResponse.redirect(new URL('/login?error=google_no_code', request.url));
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (!googleClientId || !googleClientSecret || !nextAuthUrl) {
    console.error('Missing Google OAuth environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const redirectUri = `${nextAuthUrl}/api/auth/google/callback`;
  const oAuth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri);

  try {
    // 8. Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token;
    const idToken = tokens.id_token;

    if (!accessToken || !idToken) {
      console.error('Failed to retrieve access_token or id_token from Google.');
      return NextResponse.redirect(new URL('/login?error=google_token_missing', request.url));
    }

    // 9. Verify ID Token and Get User Profile
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      console.error('Invalid ID token payload from Google.');
      return NextResponse.redirect(new URL('/login?error=google_invalid_id_token', request.url));
    }

    const googleId = payload.sub; // Google User ID
    const email = payload.email;
    const name = payload.name || payload.given_name || 'User'; // Fallback for name
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      console.error('Email not available or not verified by Google.');
      // Consider how to handle this: error, or proceed if your app allows unverified emails from Google
      return NextResponse.redirect(new URL('/login?error=google_email_not_verified', request.url));
    }
    if (!googleId) {
        console.error('Could not retrieve googleId (sub) from token payload.');
        return NextResponse.redirect(new URL('/login?error=google_missing_sub', request.url));
    }


    // 10. Find or Create User
    // Pass the original access_token, not id_token, for potential API calls if needed by your app
    const user = await findOrCreateUserByGoogleProfile(googleId, email, name, accessToken);

    if (!user || !user._id) {
      console.error('Failed to find or create user via Google profile.');
      return NextResponse.redirect(new URL('/login?error=user_processing_failed', request.url));
    }

    // 11. Set Session Cookie
    const sessionMaxAge = 60 * 60 * 24 * 7; // 7 days
    cookies().set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionMaxAge,
      path: '/',
    });

    // 12. Redirect User
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    let errorMessage = 'google_callback_failed';
    if (error.response && error.response.data && error.response.data.error_description) {
        errorMessage = encodeURIComponent(error.response.data.error_description);
    } else if (error.message) {
        errorMessage = encodeURIComponent(error.message);
    }
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }
}
