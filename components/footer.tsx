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
          // Fetch 2 most recent content items
          // This endpoint /api/contents?limit=2&sort=createdAt:desc needs to be created or adjusted
          const contentResponse = await fetch('/api/contents?limit=2&sort=createdAt:desc&recent=true');
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

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 mt-auto">
      <div className="container  mx-40 px-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-48 mb-4">
          {/* Column 1: Name and Motto */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">DStech</h3>
            <p className="text-sm">
              Your central hub for knowledge and collaboration. Store, share, and discover information seamlessly.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              {/* Add more links like Contact, FAQ if they exist */}
              <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Recent Content (Logged In) */}
          {isLoggedIn && recentContents.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Posts</h4>
              <ul className="space-y-2 text-sm">
                {recentContents.map((content) => (
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

        <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} DStech. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}