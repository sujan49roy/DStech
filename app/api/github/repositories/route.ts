import { NextResponse } from 'next/server';
import { getCurrentUser, decryptAccessToken } from '@/lib/auth'; // Adjust path if needed
import { logger, apiErrorResponse } from "@/lib/logger"; // Import logger and helper

export async function GET() {
  let userId: string | undefined;
  try {
    // 5. Authenticate User
    const user = await getCurrentUser();

    if (!user) {
      const response = apiErrorResponse("Unauthorized", 401);
      return NextResponse.json(response.json, { status: response.status });
    }
    userId = user._id?.toString();

    // 6. Retrieve and Decrypt Access Token
    if (!user.githubAccessToken) {
      const response = apiErrorResponse("GitHub account not linked or access token is missing.", 400);
      return NextResponse.json(response.json, { status: response.status });
    }

    let decryptedToken;
    try {
      decryptedToken = decryptAccessToken(user.githubAccessToken);
    } catch (error) {
      logger.error('Failed to decrypt GitHub access token', error, { userId });
      // This could indicate a problem with the token or the encryption key.
      // For security, treat as if the token is invalid or unavailable.
      const response = apiErrorResponse("Invalid or corrupted GitHub access token. Please re-authenticate with GitHub.", 403);
      return NextResponse.json(response.json, { status: response.status });
    }

    if (!decryptedToken) {
        // Should be caught by the try-catch block above, but as a safeguard:
        logger.error('Decrypted token is unexpectedly null or empty after successful decryption attempt.', undefined, { userId });
        const response = apiErrorResponse("Failed to obtain decrypted GitHub access token.", 500);
        return NextResponse.json(response.json, { status: response.status });
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
      logger.error('Failed to fetch repositories from GitHub API', undefined, {
        userId,
        githubResponseStatus: reposResponse.status,
        githubResponseBody: errorBody
      });

      let message = 'Failed to fetch repositories from GitHub.';
      if (reposResponse.status === 401) {
        message = 'GitHub token is invalid or revoked. Please re-authenticate with GitHub.';
      } else if (reposResponse.status === 403) {
        message = 'Access forbidden by GitHub API. You might have hit a rate limit or lack permissions.';
      }
      const responseDetails = reposResponse.status === 401 || reposResponse.status === 403 ? errorBody : undefined;
      const response = apiErrorResponse(message, reposResponse.status, responseDetails);
      return NextResponse.json(response.json, { status: response.status });
    }

    const repositories = await reposResponse.json();

    // 8. Return Repositories
    return NextResponse.json(repositories, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred while fetching GitHub repositories.';
    logger.error('Error fetching GitHub repositories', error, { userId });
    const response = apiErrorResponse(errorMessage, 500);
    return NextResponse.json(response.json, { status: response.status });
  }
}
