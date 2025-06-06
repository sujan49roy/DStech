"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Content } from '@/lib/models'; // Assuming Content model is available

interface FooterProps {
  // Props if needed, e.g., for user state if not fetched internally
}

export function Footer({}: FooterProps) {
  const [recentContents, setRecentContents] = useState<Content[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Or use a global auth state

  // Effect to check login status and fetch recent content
  useEffect(() => {
    const checkAuthAndFetchContent = async () => {
      try {
        const userResponse = await fetch('/api/auth/user');
        if (userResponse.ok) {
          setIsLoggedIn(true);
          // Fetch 3 most recent content items
          // This endpoint /api/contents?limit=3&sort=createdAt:desc needs to be created or adjusted
          const contentResponse = await fetch('/api/contents?limit=3&sort=createdAt:desc&recent=true');
          if (contentResponse.ok) {
            const data = await contentResponse.json();
            setRecentContents(data);
          }
        } else {
          setIsLoggedIn(false);
          setRecentContents([]);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
        setIsLoggedIn(false);
        setRecentContents([]);
      }
    };
    checkAuthAndFetchContent();
  }, []);

  return (    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-3 md:px-4 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto max-w-5xl px-0 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-3">
          {/* Column 1: Name and Motto */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">DStech</h3>
            <p className="text-xs">
              Your central hub for knowledge and collaboration. Store, share, and discover information seamlessly.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="mb-6 md:mb-0 text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-xs">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Recent Content (Logged In) */}
          {isLoggedIn && recentContents.length > 0 && (
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Posts</h4>
              <ul className="space-y-1 text-xs">
                {recentContents.slice(0, 3).map((content) => (
                  <li key={content._id?.toString()}>
                    <Link href={`/view/${content._id?.toString()}`} className="hover:underline">
                      {content.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-2 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} DStech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}