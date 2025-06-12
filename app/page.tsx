"use client"

import type React from "react"
import Head from "next/head" // Import Head

import { useState, useEffect } from "react"
import Link from "next/link"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorMessage } from "@/components/error-message"
import { Plus, Search } from "lucide-react"
import type { Content } from "@/lib/models"
import { ContentTypes } from "@/lib/models"

export default function HomePage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")

  const fetchContents = async (type?: string, query?: string) => {
    setLoading(true)
    try {
      let url = "/api/contents"

      // If we have a search query, use the search endpoint
      if (query) {
        url = `/api/search?q=${encodeURIComponent(query)}`
        if (type) {
          url += `&type=${encodeURIComponent(type)}`
        }
      } else if (type) {
        // Otherwise use the contents endpoint with type filter
        url = `/api/contents?type=${encodeURIComponent(type)}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch contents")
      }

      const data = await response.json()
      setContents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContents(selectedType || undefined, searchQuery || undefined)
  }, [selectedType, searchQuery])

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

      // Refresh the content list
      fetchContents(selectedType || undefined, searchQuery || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContents(selectedType || undefined, searchQuery || undefined)
  }

  return (
    <>
      <Head>
        <title>DStech: Your Personal Vault for Data Science</title>
        <meta name="description" content="DStech is a personal vault and storage solution designed for data science projects, notes, and resources. Organize your work securely." />
        <meta name="keywords" content="dstech, data science, personal vault, storage for data science, productivity, notes, code snippets" />
        <link rel="canonical" href="https://dstech.example.com/" />
        {/* Open Graph */}
        <meta property="og:title" content="DStech: Your Personal Vault for Data Science" />
        <meta property="og:description" content="Securely store and manage your data science projects, notes, and resources with DStech." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dstech.example.com/" />
        <meta property="og:image" content="https://dstech.example.com/placeholder-og-image.jpg" />
        <meta property="og:site_name" content="DStech" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DStech: Your Personal Vault for Data Science" />
        <meta name="twitter:description" content="Securely store and manage your data science projects, notes, and resources with DStech." />
        <meta name="twitter:image" content="https://dstech.example.com/placeholder-twitter-image.jpg" />
        {/* <meta name="twitter:site" content="@YourTwitterHandle"> Optional */}
      </Head>
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* The H1 title here is "DStech Dashboard", which might be inconsistent with the page title "DStech: Your Personal Vault for Data Science" */}
          <h1 className="text-3xl font-bold">DStech Dashboard</h1>
          <Link href="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ContentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No content found</p>
          <Link href="/create">
            <Button>Create your first content</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <ContentCard key={content._id?.toString()} content={content} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
