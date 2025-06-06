"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileText, Code, Database, FolderKanban, BookOpen, File } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentTypes } from "@/lib/models"

const contentTypeIcons = {
  Blog: FileText,
  "Code Snippet": Code,
  Dataset: Database,
  Project: FolderKanban,
  Book: BookOpen,
  File: File,
}

type SearchResult = {
  _id: string
  title: string
  description: string
  type: string
  createdAt: string
  slug?: string
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams?.get("q") || ""
  const typeParam = searchParams?.get("type")?.split(',') || []
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>(typeParam)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch results if query exists
    if (!query) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const queryParams = new URLSearchParams({
          q: query.trim(),
          ...(activeFilters.length > 0 && { type: activeFilters.join(',') }),
          limit: "50", // Get more results for the full search page
        })

        const response = await fetch(`/api/search?${queryParams.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Search failed: ${response.statusText}`)
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Failed to perform search. Please try again.")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, activeFilters])

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate to content by ID instead of slug
    router.push(`/view/${result._id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Search Results {query ? `for "${query}"` : ""}
        </h1>
        <div>
          {activeFilters.map(filter => (
            <Badge key={filter} variant="secondary" className="ml-2">
              {filter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => toggleFilter(filter)}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Search Error</h2>
          <p>{error}</p>
          <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded">
            {error}
          </pre>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try using different keywords or removing filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const Icon = contentTypeIcons[result.type as keyof typeof contentTypeIcons] || File
            return (
              <div
                key={result._id}
                onClick={() => handleResultClick(result)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{result.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                      {result.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {result.type}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(result.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {results.length} result{results.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}