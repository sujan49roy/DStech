"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContentTypes } from "@/lib/models"
import {
  FileText,
  Code,
  Database,
  FolderKanban,
  BookOpen,
  File,
  User,
  Home,
  Github,
  Plus,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const contentTypeIcons = {
  Blog: FileText,
  "Code Snippet": Code,
  Dataset: Database,
  Project: FolderKanban,
  Book: BookOpen,
  File: File,
}

export function Sidebar({ isOpen: initialIsOpen = false, onToggle }: { isOpen?: boolean; onToggle?: () => void }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

 useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    if (mobile) setIsOpen(false)
  }
  checkMobile()
  window.addEventListener("resize", checkMobile)
  return () => window.removeEventListener("resize", checkMobile)
}, [])

useEffect(() => {
  setIsOpen(initialIsOpen)
}, [initialIsOpen])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
    if (onToggle) onToggle()
  }

  const handleNavClick = (href: string) => {
    if (isMobile) {
      setIsOpen(false)
      if (onToggle) onToggle()

      // Use setTimeout to ensure the sidebar closes visually before navigation
      setTimeout(() => {
        router.push(href)
      }, 100)

      return false // Prevent default Link behavior
    }
    return true
  }
  return (
    <div className="relative">
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-35"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}      <div
        className={cn(
          "fixed top-14 md:top-16 bottom-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-y-auto",
          isOpen || !isMobile ? "w-56 translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar header with close button for mobile */}
        {isMobile && isOpen && (          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="py-4 px-4">
        
        </div>        <div className="py-1 h-full">
          <nav className="space-y-0.5 px-2">
            {isMobile ? (
              <div
                onClick={() => handleNavClick("/dashboard")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium mt-2 cursor-pointer", // Changed py-1 to py-2
                  pathname === "/dashboard"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <Home className="h-4 w-4" />
                <span className="text-xs">Dashboard</span>
              </div>
            ) : (
              <Link href="/dashboard" passHref>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs md:text-sm font-medium mt-2 cursor-pointer", // Changed py-1.5 to py-2
                    pathname === "/dashboard"
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
            )}

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content Types
              </div>
            </div>

            {ContentTypes.map((type) => {
              const Icon = contentTypeIcons[type]
              const path = `/content/${type.toLowerCase().replace(/\s+/g, "-")}`
              return isMobile ? (
                <div
                  key={type}
                  onClick={() => handleNavClick(path)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium cursor-pointer", // Changed py-1.5 to py-2
                    pathname === path
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{type}s</span>
                </div>
              ) : (
                <Link href={path} key={type} passHref>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                      pathname === path
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{type}s</span>
                  </div>
                </Link>
              )
            })}

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                External
              </div>
            </div>

            {isMobile ? (
              <div
                onClick={() => handleNavClick("/github-repositories")}
                className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium cursor-pointer", // Changed py-1.5 to py-2
                  pathname === "/github-repositories"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <Github className="h-4 w-4" />
                <span className="text-xs">GitHub Repositories</span>
              </div>
            ) : (
              <Link href="/github-repositories" passHref>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                    pathname === "/github-repositories"
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Github className="h-5 w-5" />
                  <span>GitHub Repositories</span>
                </div>
              </Link>
            )}

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </div>
            </div>

            {isMobile ? (
              <div
                onClick={() => handleNavClick("/profile")}
                className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium cursor-pointer", // Changed py-1.5 to py-2
                  pathname === "/profile"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <User className="h-4 w-4" />
                <span className="text-xs">Profile</span>
              </div>
            ) : (
              <Link href="/profile" passHref>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                    pathname === "/profile"
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </Link>
            )}

            {isMobile ? (
              <div
                onClick={() => handleNavClick("/upload")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium mt-4 cursor-pointer", // Changed py-1.5 to py-2
                  pathname === "/upload"
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                    : "text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                )}
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Upload Content</span>
              </div>
            ) : (
              <Link href="/upload" passHref>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mt-4 cursor-pointer",
                    pathname === "/upload"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <span>Upload Content</span>
                </div>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
