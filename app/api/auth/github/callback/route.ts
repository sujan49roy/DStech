import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findOrCreateUserByGithubProfile } from '@/lib/auth'; // Adjust path if needed

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  // Optional: const state = searchParams.get('state');
  // Optional: const storedState = cookies().get('oauth_state')?.value;

  // Optional: CSRF protection by comparing state
  // if (!state || !storedState || state !== storedState) {
  //   console.error('Invalid OAuth state.');
  //   return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  // }
  // Optional: Clear the state cookie after use
  // cookies().delete('oauth_state');

  if (!code) {
    console.error('No code received from GitHub.');
    return NextResponse.redirect(new URL('/login?error=github_no_code', request.url));
  }

  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret || !nextAuthUrl) {
    console.error('Missing GitHub OAuth environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const redirectUri = `https://dstechnology.vercel.app/api/auth/github/callback`;

  try {
    // 7. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Failed to fetch access token from GitHub:', tokenResponse.status, errorBody);
      return NextResponse.redirect(new URL(`/login?error=github_token_exchange_failed&status=${tokenResponse.status}`, request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access_token in GitHub response:', tokenData);
      return NextResponse.redirect(new URL('/login?error=github_no_access_token', request.url));
    }

    // 8. Fetch GitHub User Profile
    const userProfileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userProfileResponse.ok) {
      const errorBody = await userProfileResponse.text();
      console.error('Failed to fetch user profile from GitHub:', userProfileResponse.status, errorBody);
      return NextResponse.redirect(new URL('/login?error=github_profile_fetch_failed', request.url));
    }

    const userProfile = await userProfileResponse.json();
    const githubId = userProfile.id.toString(); // Ensure it's a string
    const githubUsername = userProfile.login;

    if (!githubId || !githubUsername) {
        console.error('Could not retrieve githubId or githubUsername from profile:', userProfile);
        return NextResponse.redirect(new URL('/login?error=github_incomplete_profile', request.url));
    }

    // 9. Fetch GitHub User Email
    let primaryEmail: string | undefined = userProfile.email; // User profile email might be null

    if (!primaryEmail) { // If email is not available in main profile, try fetching from /user/emails
        const userEmailsResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!userEmailsResponse.ok) {
            console.warn('Failed to fetch user emails from GitHub:', userEmailsResponse.status);
            // Continue without primary email if this fails, findOrCreateUserByGithubProfile will handle it
        } else {
            const emailsData = await userEmailsResponse.json();
            if (Array.isArray(emailsData)) {
                const verifiedPrimary = emailsData.find(email => email.primary && email.verified);
                if (verifiedPrimary) {
                    primaryEmail = verifiedPrimary.email;
                } else {
                    // Fallback to first verified email if no primary verified, or first email if none verified
                    const firstVerified = emailsData.find(email => email.verified);
                    primaryEmail = firstVerified?.email || (emailsData.length > 0 ? emailsData[0].email : undefined);
                }
            }
        }
    }


    // 10. Find or Create User
    const user = await findOrCreateUserByGithubProfile(githubId, githubUsername, accessToken, primaryEmail);

    if (!user || !user._id) {
      console.error('Failed to find or create user.');
      return NextResponse.redirect(new URL('/login?error=user_creation_failed', request.url));
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
    // Redirecting to a page that can then fetch repositories or show dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url)); // Or /github-repositories

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'unknown_error';
    return NextResponse.redirect(new URL(`/login?error=github_callback_failed&message=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
