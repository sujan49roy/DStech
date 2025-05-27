"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NavBar } from "@/components/nav-bar"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      }
    }

    fetchUser()
  }, [])

const handleContentClick = () => {
  console.log("Toggling sidebar, current state:", isSidebarOpen);
  setIsSidebarOpen(!isSidebarOpen)
}

  const safeUser = user ? { name: user.name, email: user.email } : null

  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NavBar initialUser={safeUser} onContentClick={handleContentClick} />
          <div className="flex min-h-screen pt-24 md:pt-20 bg-background">
{user && <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
              <main className={`flex-1 ${user ? "md:ml-64" : ""} p-6`}>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}