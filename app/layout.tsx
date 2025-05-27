import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NavBar } from "@/components/nav-bar"
import { Sidebar } from "@/components/sidebar"
import { getCurrentUser } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DStech - Personal Knowledge Base",
  description: "A personal knowledge base for data scientists and developers",
    generator: 'v0.dev'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // Remove password from user object
  const safeUser = user ? { name: user.name, email: user.email } : null
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NavBar  initialUser={safeUser}   />
          <div className="flex min-h-screen pt-16 mt-20 ">
            {user && <Sidebar />}
            <main className={`flex-1 ${user ? "md:ml-16" : ""} p-6`}>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
