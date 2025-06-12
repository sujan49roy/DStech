"use client";

import React, { useEffect, useState } from 'react';
import { Github, Star, GitFork, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Define a more specific type for repository data
interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
  };
  private: boolean;
}

export default function GitHubRepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);


  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/github/repositories');
        if (response.ok) {
          const data = await response.json();
          setRepositories(data);
          setIsUserAuthenticated(true);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          if (response.status === 401) {
            setError('Authentication required. Please login with GitHub to view your repositories.');
            setIsUserAuthenticated(false);
          } else if (response.status === 400) {
            setError(errorData.error || 'GitHub account not connected or access token missing. Please connect your GitHub account.');
            setIsUserAuthenticated(false); // Or true, depending on if they are logged in but GH not linked
          } else if (response.status === 403) {
             setError(errorData.error || 'Access to GitHub repositories is forbidden. Your token might be invalid or lack permissions.');
             setIsUserAuthenticated(true); // Still authenticated to our app, but GitHub access issue
          } else {
            setError(errorData.error || `Error fetching repositories: ${response.statusText}`);
            // We don't know auth status for sure here, might be server error
          }
        }
      } catch (err) {
        console.error('Network or unexpected error fetching repositories:', err);
        setError('Failed to fetch repositories due to a network or unexpected error.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <Card key={`skeleton-${i}`} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-2">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                <Skeleton className="h-3 sm:h-4 w-2/3" />
              </CardDescription>
            </div>
            <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-xs sm:text-sm">
          <div className="flex items-center gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
            <span className="flex items-center">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
            </span>
            <span className="flex items-center">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> <Skeleton className="h-3 w-6 sm:h-4 sm:w-8" />
            </span>
            <span className="flex items-center">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> <Skeleton className="h-3 w-6 sm:h-4 sm:w-8" />
            </span>
          </div>
          <Skeleton className="h-8 w-24 mt-3" />
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Github className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700 dark:text-gray-300" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Your GitHub Repositories
          </h1>
        </div>

        {isUserAuthenticated === false && !isLoading && (
           <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
             Connect your GitHub account to view your repositories.
           </p>
        )}
        {isUserAuthenticated && !isLoading && repositories.length > 0 && (
             <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Displaying your public and private repositories.
             </p>
        )}


        {/* Login with GitHub Button - Show if not authenticated or if error suggests re-auth */}
        {(isUserAuthenticated === false || (error && (error.includes("Authentication required") || error.includes("GitHub account not connected")))) && !isLoading && (
          <div className="mb-6 sm:mb-8">
            <a href="/api/auth/github" className="inline-block">
              <Button className="w-full sm:w-auto">
                <Github className="mr-2 h-4 w-4" /> Login with GitHub
              </Button>
            </a>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {renderSkeletons()}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 dark:text-red-400 mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-300 mb-1 sm:mb-2">Error Fetching Repositories</p>
          <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          {/* Optionally, add a retry button if it makes sense for the error type */}
        </div>
      )}

      {!isLoading && !error && repositories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {repositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      <CardTitle className="text-base sm:text-lg mb-1 text-blue-600 dark:text-blue-400 break-all">
                        {repo.name}
                      </CardTitle>
                    </a>
                    <CardDescription className="text-xs sm:text-sm h-10 overflow-hidden">
                      {repo.description || "No description provided."}
                    </CardDescription>
                  </div>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="ml-2 flex-shrink-0">
                    <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-xs sm:text-sm flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
                    {repo.language && (
                      <span className="flex items-center" title="Language">
                        <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-1.5`} style={{ backgroundColor: getLanguageColor(repo.language) }} /> {repo.language}
                      </span>
                    )}
                    <span className="flex items-center" title="Stars">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center" title="Forks">
                      <GitFork className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {repo.forks_count}
                    </span>
                     {repo.private && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">(Private)</span>
                    )}
                  </div>
                </div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    View on GitHub <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && repositories.length === 0 && isUserAuthenticated && (
        <div className="text-center py-10">
          <Github className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">No Repositories Found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn't find any repositories associated with your GitHub account, or you may not have any public repositories.
          </p>
        </div>
      )}

      {/* Fallback message if not loading, no error, no repos, and user auth status is unknown/null */}
      {!isLoading && !error && repositories.length === 0 && isUserAuthenticated === null && (
         <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Could not determine repository status.</p>
         </div>
      )}


      {/* Additional Info - keep or remove as needed */}
      { (isLoading || (!error && repositories.length === 0)) && (
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-4">
              {isLoading ? "Loading your repositories..." : (isUserAuthenticated ? "Connect your GitHub account to see your repositories listed here." : "If you have repositories, they will appear here after connecting your account.")}
            </p>
          </div>
        )
      }
    </div>
  );
}

// Helper function for language colors (can be expanded)
// Simple version, a more comprehensive one would map more languages
const languageColors: { [key: string]: string } = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Ruby: '#701516',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Go: '#00ADD8',
  Rust: '#dea584',
  Kotlin: '#F18E33',
  Swift: '#ffac45',
  Other: '#ededed' // Default/fallback color
};

function getLanguageColor(language: string): string {
  return languageColors[language] || languageColors['Other'];
}