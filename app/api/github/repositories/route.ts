import { NextResponse } from 'next/server';
import { getCurrentUser, decryptAccessToken } from '@/lib/auth'; // Adjust path if needed
// `connectToDatabase` might not be directly needed if `getCurrentUser` fetches the complete user object.

export async function GET() {
  try {
    // 5. Authenticate User
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 6. Retrieve and Decrypt Access Token
    if (!user.githubAccessToken) {
      return NextResponse.json({ error: 'GitHub account not linked or access token is missing.' }, { status: 400 });
    }

    let decryptedToken;
    try {
      decryptedToken = decryptAccessToken(user.githubAccessToken);
    } catch (error) {
      console.error('Failed to decrypt GitHub access token:', error);
      // This could indicate a problem with the token or the encryption key.
      // For security, treat as if the token is invalid or unavailable.
      return NextResponse.json({ error: 'Invalid or corrupted GitHub access token. Please re-authenticate with GitHub.' }, { status: 403 });
    }

    if (!decryptedToken) {
        // Should be caught by the try-catch block above, but as a safeguard:
        return NextResponse.json({ error: 'Failed to obtain decrypted GitHub access token.' }, { status: 500 });
    }

    // 7. Fetch Repositories from GitHub API
    // Fetches repositories the authenticated user has explicit permission to access
    // This includes owned repos, collaborator repos, and repos they are a member of in an organization.
    // Add query params for more specific results, e.g., type=owner, sort=updated, per_page=100
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&direction=desc&per_page=100', {
      headers: {
        Authorization: `token ${decryptedToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposResponse.ok) {
      const errorBody = await reposResponse.json().catch(() => ({ message: 'Unknown error from GitHub API' }));
      console.error('Failed to fetch repositories from GitHub:', reposResponse.status, errorBody);

      if (reposResponse.status === 401) {
        // Token might be invalid or revoked
        return NextResponse.json({ error: 'GitHub token is invalid or revoked. Please re-authenticate with GitHub.', details: errorBody }, { status: 401 });
      }
      if (reposResponse.status === 403) {
        // Rate limit or other access forbidden issues
         return NextResponse.json({ error: 'Access forbidden by GitHub API. You might have hit a rate limit or lack permissions.', details: errorBody }, { status: 403 });
      }
      return NextResponse.json({ error: 'Failed to fetch repositories from GitHub.', details: errorBody }, { status: reposResponse.status });
    }

    const repositories = await reposResponse.json();

    // 8. Return Repositories
    return NextResponse.json(repositories, { status: 200 });

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
