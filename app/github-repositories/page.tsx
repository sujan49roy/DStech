"use client";

import React, { useState } from 'react';
import { Github, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function GitHubRepositoriesPage() {
  const [githubUsername, setGithubUsername] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUsername.trim()) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Skeleton repositories for demonstration
  const skeletonRepos = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `repository-${i + 1}`,
    description: `This is a sample description for repository ${i + 1}. It contains various features and functionalities.`,
  }));

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Github className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700 dark:text-gray-300" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            GitHub Repositories
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Enter your GitHub username to view your repositories
        </p>

        {/* GitHub Username Input */}
        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter GitHub username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 w-full"
              />
            </div>
            <Button type="submit" disabled={!githubUsername.trim()} className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </form>

        {/* Feature Coming Soon Message */}
        {showMessage && (
          <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 font-medium">
              🚀 Feature will be available soon!
            </p>
          </div>
        )}
      </div>

      {/* Skeleton Repository Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {skeletonRepos.map((repo) => (
          <Card key={repo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg mb-2">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-2/3" />
                  </CardDescription>
                </div>
                <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" />
                    <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
                    <Skeleton className="h-3 sm:h-4 w-6 sm:w-8" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
                    <Skeleton className="h-3 sm:h-4 w-6 sm:w-8" />
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 sm:mt-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-4">
          This page will display your GitHub repositories once the feature is implemented.
        </p>
      </div>
    </div>
  );
}