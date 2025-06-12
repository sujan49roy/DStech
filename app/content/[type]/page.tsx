"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlphabetFilter } from "@/components/alphabet-filter"
import { ErrorMessage } from "@/components/error-message"
import { Plus, Search } from "lucide-react"
import type { Content, ContentType } from "@/lib/models"
import { Spinner } from "@/components/ui/spinner" // Import Spinner

export default function ContentTypePage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter()
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const [typeFromParams, setTypeFromParams] = useState<string | null>(null)

  // Convert URL param to proper content type
  const contentType = useMemo(() => {
    if (!typeFromParams) return null
    return typeFromParams
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") as ContentType;
  }, [typeFromParams]);

  useEffect(() => {
    const resolveParams = async () => {
      const { type } = await params
      setTypeFromParams(type)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!contentType) return

    const fetchContents = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/contents?type=${encodeURIComponent(contentType)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch ${contentType} contents`)
        }

        const data = await response.json()
        setContents(data)
        setFilteredContents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchContents()
  }, [contentType])

  useEffect(() => {
    // Filter contents based on search query and active letter
    let filtered = [...contents]

    if (searchQuery) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (activeLetter) {
      if (activeLetter === "#") {
        // Filter for items that start with a number or special character
        filtered = filtered.filter((content) => !/^[a-zA-Z]/.test(content.title.charAt(0)))
      } else {
        filtered = filtered.filter((content) => content.title.charAt(0).toUpperCase() === activeLetter)
      }
    }

    setFilteredContents(filtered)
  }, [contents, searchQuery, activeLetter])

  const handleLetterClick = (letter: string | null) => {
    setActiveLetter(letter)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return
    }

    try {
      const response = await fetch(`/api/contents/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete content")
      }

      // Remove the deleted content from the state
      setContents((prev) => prev.filter((content) => content._id?.toString() !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (!contentType) {
    return (
      <div className="container mx-auto py-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">{contentType}s</h1>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New {contentType}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder={`Search ${contentType.toLowerCase()}s...`}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      <AlphabetFilter activeLetter={activeLetter} onLetterClick={handleLetterClick} />

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] py-8"> {/* Container to center spinner */}
          <Spinner size="lg" />
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No {contentType.toLowerCase()}s found</p>
          <Link href="/create">
            <Button>Create your first {contentType.toLowerCase()}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => (
            <ContentCard key={content._id?.toString()} content={content} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
