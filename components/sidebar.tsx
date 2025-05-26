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
  ExternalLink,
  Github,
  Plus,
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
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} aria-hidden="true" />
      )}

      {/* Toggle button for mobile */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="py-4 h-full overflow-y-auto">
          <nav className="space-y-1 px-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <Home className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Dashboard</span>
            </Link>

            <div className="pt-4 pb-2">
              <div
                className={cn(
                  "px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  !isOpen && "md:text-center md:px-0",
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
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === path
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
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
                  !isOpen && "md:text-center md:px-0",
                )}
              >
                {isOpen || !isMobile ? "External" : ""}
              </div>
            </div>

            <Link
              href="/external"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/external"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <ExternalLink className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>External</span>
            </Link>

            <Link
              href="/github-projects"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/github-projects"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <Github className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>GitHub Projects</span>
            </Link>

            <div className="pt-4 pb-2">
              <div
                className={cn(
                  "px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  !isOpen && "md:text-center md:px-0",
                )}
              >
                {isOpen || !isMobile ? "Account" : ""}
              </div>
            </div>

            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/profile"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <User className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Profile</span>
            </Link>

            <Link
              href="/upload"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mt-4",
                pathname === "/upload"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                  : "text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
              )}
            >
              <Plus className="h-5 w-5" />
              <span className={cn("transition-opacity duration-200", !isOpen && "md:hidden")}>Upload Content</span>
            </Link>
          </nav>
        </div>

        {/* Toggle button for desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 bottom-4 hidden md:flex"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </>
  )
}
