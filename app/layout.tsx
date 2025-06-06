"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NavBar } from "@/components/nav-bar"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer" // Import Footer
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const pathname = usePathname() // Add this to track path changes

  // This effect will run when pathname changes, which happens after login/logout navigation
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
  }, [pathname]) // Add pathname as a dependency to refresh auth state when routes change
const handleContentClick = () => {
  console.log("Toggling sidebar, current state:", isSidebarOpen);
  setIsSidebarOpen(!isSidebarOpen)
}

  // Function to handle user state changes from NavBar
  const handleUserChange = (newUser: { name: string; email: string } | null) => {
    setUser(newUser)
  }

  const safeUser = user ? { name: user.name, email: user.email } : null

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen ">
            <NavBar
              initialUser={safeUser}
              onContentClick={handleContentClick}
              onUserChange={handleUserChange} // Add this prop
            />
            <div className="flex flex-1 pt-32 bg-background"> {/* pt-16 to account for NavBar height, adjust as needed */}
             {user && <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
              {/* Main content area needs to be aware of sidebar */}
              <main className={`flex-1 ${user ? "md:ml-64" : ""} p-6 mt-0`}> {/* Ensure no top margin if pt is on parent */}
                {children}
              </main>

            </div>
                  <Footer />
          </div>

        </ThemeProvider>

      </body>
       
    </html>
  )
}