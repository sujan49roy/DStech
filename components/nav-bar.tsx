"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"; // Import cn
import { User, LogOut, Search, AlignLeft, Settings } from "lucide-react"
import { SearchDropdown } from "@/components/search-dropdown" // Import our new SearchDropdown component




interface NavBarProps {
  initialUser?: { name: string; email: string } | null
  onContentClick?: () => void
  onUserChange?: (user: { name: string; email: string } | null) => void
}

export function NavBar({ initialUser, onContentClick, onUserChange }: NavBarProps) {
  const router = useRouter()
  const pathname = usePathname() // Get current pathname
  const [user, setUser] = useState(initialUser)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          if (onUserChange) onUserChange(userData) // Notify parent about user state change
        } else {
          // If initialUser was provided, don't immediately nullify it
          // if the fetch fails, to prevent flicker on initial load.
          // Only set to null if there was no initialUser or if it's a subsequent fetch.
          if (!initialUser || user) { // user check means it's not the very first fetch
            setUser(null)
            if (onUserChange) onUserChange(null) // Notify parent about user state change
          }
        }
      } catch (error) {
        if (!initialUser || user) {
           setUser(null)
           if (onUserChange) onUserChange(null) // Notify parent about user state change
        }
      }
    }

    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount; rely on router.refresh() and initialUser prop for updates

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      if (onUserChange) onUserChange(null) // Notify parent about user state change
      // Force a complete page reload to ensure navbar updates
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
      // Even if logout fails, redirect to login
      window.location.href = "/login"
    }
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 w-full max-w-none", // Change z-index from z-100 to z-50
      user ? "h-20" : "h-24" // Conditional height
    )}>
      <div className="mx-auto px-4 h-full bg-white dark:bg-gray-800">
        <div className={cn("flex justify-between items-center h-full")}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center"> {/* Link to home if not logged in */}
              {/* Image removed as per request */}
              <span className={cn(
                "font-bold font-sans",
                user ? "text-2xl" : "text-4xl mx-6" // Updated conditional text size
              )}>DStech</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          {user && (
            <div className="hidden md:flex items-center max-w-md w-full mx-4">
              <SearchDropdown />
            </div>
          )}

          {/* User Menu and Settings - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant={pathname === "/login" ? "default" : "ghost"}
                    size={user ? "sm" : "lg"}
                    className={cn(
                      "transition-all duration-200",
                      pathname === "/login" 
                        ? "bg-black text-white hover:bg-black/90 rounded-md scale-105" 
                        : "hover:bg-black hover:text-white rounded-md",
                      !user ? "px-6 py-3 text-base" : ""
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant={pathname === "/register" ? "default" : "ghost"}
                    size={user ? "sm" : "lg"}
                    className={cn(
                      "transition-all duration-200",
                      pathname === "/register" 
                        ? "bg-black text-white hover:bg-black/90 rounded-md scale-105" 
                        : "hover:bg-black hover:text-white rounded-md",
                      !user ? "px-6 py-3 text-base" : ""
                    )}
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <User size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile search bar and Content button */}
        {user && (
          <div className="md:hidden py-2 relative z-10 bg-white dark:bg-gray-800"> {/* Added background to match navbar */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <div className="bg-white dark:bg-gray-800"> {/* Ensure search dropdown has same background */}
                  <SearchDropdown />
                </div>
              </div>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log("Content button clicked");
                  onContentClick?.();
                }}
                aria-label="Open sidebar"
                className="flex-shrink-0"
              >
                <AlignLeft size={20} />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm font-medium">{user.name}</div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}