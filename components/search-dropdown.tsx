"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ContentTypes } from "@/lib/models"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const contentTypeIcons = {
  Blog: "📝",
  "Code Snippet": "💻",
  Dataset: "📊",
  Project: "📁",
  Book: "📖",
  File: "📄",
}

type SearchResult = {
  _id: string
  title: string
  description: string
  type: string
  slug?: string
}

export function SearchDropdown() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setIsOpen(true)

    try {
      const queryParams = new URLSearchParams({
        q: query.trim(),
        ...(activeFilters.length > 0 && { type: activeFilters.join(',') }),
        limit: "5", // Limit results in dropdown
      })

      const response = await fetch(`/api/search?${queryParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Search error:", errorData)
        setResults([])
        return
      }

      const data = await response.json()
      console.log("Search results:", data)
      
      setResults(data)
      setIsOpen(data.length > 0)
    } catch (error) {
      console.error("Search fetch error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [activeFilters])

  const debouncedSearch = useCallback((query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 30)
  }, [performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const typeQuery = activeFilters.length > 0 
        ? `&type=${encodeURIComponent(activeFilters.join(','))}` 
        : ''
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}${typeQuery}`)
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const handleResultClick = (result: SearchResult) => {
    // Convert content type to slug format
    const typeSlug = result.type.toLowerCase().replace(/\s+/g, '-')
    router.push(`/content-view/${typeSlug}/${result.slug}`)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value
            setSearchQuery(value)
            
            // Trigger search for any input
            debouncedSearch(value)
          }}
          onFocus={() => {
            if (searchQuery.trim().length >= 1 && results.length > 0) {
              setIsOpen(true)
            }
          }}
          className="w-full pl-10 pr-10"
        />
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
          size={18} 
          onClick={() => performSearch(searchQuery)}
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </form>

      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-800 mt-1 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1">
            {ContentTypes.map((type) => (
              <Badge 
                key={type}
                variant={activeFilters.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter(type)}
              >
                {type}
                {activeFilters.includes(type) && (
                  <span className="ml-1 text-xs">✕</span>
                )}
              </Badge>
            ))}
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                No results found
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const icon = contentTypeIcons[result.type as keyof typeof contentTypeIcons] || "📄"
                  return (
                    <div 
                      key={result._id}
                      onClick={() => handleResultClick(result)}
                      className="cursor-pointer flex items-start gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <span className="text-xl mt-0.5">{icon}</span>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {result.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {result.type}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
                {results.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2 mt-1">
                    <button
                      onClick={handleSearch}
                      className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}