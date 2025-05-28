import React from 'react';
import { NavBar } from '@/components/nav-bar'; // Assuming NavBar is adjusted or not needed here for simplicity

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* If NavBar is needed and takes props, ensure they are passed correctly
          For a simple static about page, it might be part of the main layout instead.
          <NavBar /> 
      */}
      <main className="container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for navbar height */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            About DStech
          </h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Welcome to DStech, your central hub for knowledge and collaboration. 
              Our platform is designed to empower individuals and teams by providing a 
              seamless way to store, share, and discover information.
            </p>
            <p>
              At DStech, we believe in the power of accessible knowledge. Whether you are
              documenting project details, sharing code snippets, curating datasets,
              or publishing insightful blogs, our tools are built to support your workflow
              and enhance productivity.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white pt-4 mb-3">
              Our Mission
            </h2>
            <p>
              Our mission is to provide a robust and intuitive platform that simplifies
              knowledge management and fosters a culture of continuous learning and
              information sharing. We strive to break down information silos and make
              valuable insights readily available to everyone.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white pt-4 mb-3">
              Why DStech?
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Centralized Knowledge:</strong> Keep all your important information in one place.</li>
              <li><strong>Easy Collaboration:</strong> Share and work on content with your team effortlessly.</li>
              <li><strong>Versatile Content Types:</strong> From blogs to datasets, manage diverse information types.</li>
              <li><strong>Powerful Search:</strong> Quickly find what you need with our efficient search functionality.</li>
              <li><strong>User-Friendly Interface:</strong> Enjoy a clean, intuitive, and responsive design.</li>
            </ul>
            <p className="pt-4">
              Thank you for being a part of the DStech community!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}