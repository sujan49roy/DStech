"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContentTypes } from "@/lib/models"
import {
  ChevronLeft,
  ChevronRight,
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

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleNavClick = () => {
    if (isMobile) setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed top-16 bottom-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-y-auto",
          isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        {/* Mobile header with close button */}
        {isMobile && isOpen && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Close sidebar">
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Desktop toggle button */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-0 top-4 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 z-50",
              isOpen ? "-right-4" : "right-0"
            )}
            onClick={toggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </Button>
        </div>

        <div className="py-6 h-full">
          <nav className="space-y-1 px-3">
            <Link
              href="/dashboard"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <Home className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Dashboard</span>
            </Link>

            <div className="pt-4 pb-2">
              <div
                className={cn(
                  "px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  !isOpen && "md:text-center md:px-0"
                )}
              >
                {isOpen || !isMobile ? "Content Types" : ""}
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
                  <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>{type}s</span>
                </Link>
              )
            })}

            <div className="pt-4 pb-2">
              <div
                className={cn(
                  "px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  !isOpen && "md:text-center md:px-0"
                )}
              >
                {isOpen || !isMobile ? "External" : ""}
              </div>
            </div>

            <Link
              href="https://github.com/search?q=data+science+projects&type=repositories"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/github-projects"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <Github className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>GitHub Projects</span>
            </Link>

            <div className="pt-4 pb-2">
              <div
                className={cn(
                  "px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  !isOpen && "md:text-center md:px-0"
                )}
              >
                {isOpen || !isMobile ? "Account" : ""}
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
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Profile</span>
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
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Upload Content</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar