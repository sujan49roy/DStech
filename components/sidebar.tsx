

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false)
      if (onToggle) onToggle()
    }
  }

  return (
    <div className="fixed top-2 rounded-md">
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-white bg-opacity-25 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed top-32 md:top-20 bottom-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-y-auto",
          isOpen || !isMobile ? "w-64 translate-x-0" : "-translate-x-full mt-20"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar header with close button for mobile */}
        {isMobile && isOpen && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}

        <div className="py-2 h-full">
          <nav className="space-y-1 px-3">
            <Link
              href="/dashboard"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mt-4",
                pathname === "/dashboard"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content Types
              </div>
            </div>

            {ContentTypes.map((type) => {
              const Icon = contentTypeIcons[type]
              const path = `/content/${type.toLowerCase().replace(/\s+/g, "-")}`
              return (
                <Link
                  key={type}
                  href={path}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === path
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{type}s</span>
                </Link>
              )
            })}

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                External
              </div>
            </div>

            <Link
              href="/github-repositories"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/github-repositories"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <Github className="h-5 w-5" />
              <span>GitHub Repositories</span>
            </Link>

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </div>
            </div>

            <Link
              href="/profile"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/profile"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/upload"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mt-4",
                pathname === "/upload"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                  : "text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              )}
            >
              <Plus className="h-5 w-5" />
              <span>Upload Content</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar