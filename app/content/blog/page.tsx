"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/error-message"
import { Search, Plus, Calendar } from "lucide-react"
import type { Content } from "@/lib/models"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Content[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("newest")

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/contents?type=Blog")

        if (!response.ok) {
          throw new Error("Failed to fetch blogs")
        }

        const data = await response.json()
        setBlogs(data)
        setFilteredBlogs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    // Filter and sort blogs
    let filtered = [...blogs]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      if (sortOption === "newest") {
        return dateB - dateA
      } else if (sortOption === "oldest") {
        return dateA - dateB
      } else if (sortOption === "a-z") {
        return a.title.localeCompare(b.title)
      } else if (sortOption === "z-a") {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    setFilteredBlogs(filtered)
  }, [blogs, searchQuery, sortOption])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortOption(value)
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blogs</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse and read data science articles and tutorials</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/upload">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No blogs found</p>
          <Link href="/upload">
            <Button>Create your first blog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog._id?.toString()} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link href={`/view/${blog._id}`} className="hover:text-blue-600 transition-colors">
                    {blog.title}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{blog.description}</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                <Link href={`/view/${blog._id}`}>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </Link>
                <div className="text-sm text-gray-500">{blog.content.length > 1000 ? "Long read" : "Quick read"}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
