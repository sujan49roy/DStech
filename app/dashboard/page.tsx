"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContentTypes } from "@/lib/models"
import { formatNumber } from "@/lib/utils"
import { ErrorMessage } from "@/components/error-message"
import {
  FileText,
  Code,
  Database,
  FolderKanban,
  BookOpen,
  File,
  Plus,
  Info,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react"
import type { Content } from "@/lib/models"

const contentTypeIcons = {
  Blog: FileText,
  "Code Snippet": Code,
  Dataset: Database,
  Project: FolderKanban,
  Book: BookOpen,
  File: File,
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [featuredContents, setFeaturedContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/auth/user")
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data")
        }
        const userData = await userResponse.json()
        setUser(userData)

        // Fetch all contents
        const contentsResponse = await fetch("/api/contents")
        if (!contentsResponse.ok) {
          throw new Error("Failed to fetch contents")
        }
        const contentsData = await contentsResponse.json()
        setContents(contentsData)

        // Set featured contents (most recent 3)
        setFeaturedContents(contentsData.slice(0, 3))

        // Calculate content counts by type
        const counts: Record<string, number> = {}
        ContentTypes.forEach((type) => {
          counts[type] = contentsData.filter((content: Content) => content.type === type).length
        })
        setContentCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  const totalContents = contents.length

  return (
    <div className="container mx-auto py-4 overflow-hidden">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your personal data science knowledge hub. Explore, learn, and share.
        </p>
      </div>

      {/* Main Content and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area - 75% */}
        <div className="lg:col-span-3 space-y-8">
          {/* Category Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Content Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ContentTypes.map((type) => {
                const Icon = contentTypeIcons[type]
                const count = contentCounts[type] || 0
                return (
                  <Link key={type} href={`/content/${type.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Card className="hover:shadow-md transition-shadow overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Icon className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{type}s</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{formatNumber(count)}</p>
                        <p className="text-sm text-gray-500">items</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/upload" className="flex-1">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Content
              </Button>
            </Link>
            <Link href="/about" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Info className="mr-2 h-5 w-5" />
                About DStech
              </Button>
            </Link>
          </div>

          {/* Featured Content */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredContents.length > 0 ? (
                featuredContents.map((content) => {
                  const Icon = contentTypeIcons[content.type as keyof typeof contentTypeIcons]
                  return (
                    <Card key={content._id?.toString()} className="hover:shadow-md transition-shadow overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 max-w-[80%]">{content.title}</CardTitle>
                          <Icon className="h-5 w-5 text-blue-500 shrink-0" />
                        </div>
                        <CardDescription className="text-xs">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2">{content.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/view/${content._id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No featured content yet</p>
                  <Link href="/upload" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">
                      Add Content
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar - 25% */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Content</h3>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{formatNumber(totalContents)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Content by Type</h3>
                <div className="space-y-2">
                  {Object.entries(contentCounts).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm">{type}s</span>
                      <span className="font-medium">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h3>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">
                    {contents.length > 0
                      ? `Last update: ${new Date(
                          Math.max(...contents.map((c) => new Date(c.updatedAt).getTime())),
                        ).toLocaleDateString()}`
                      : "No activity yet"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Content Distribution</h3>
                <div className="flex items-center justify-center py-4">
                  <PieChart className="h-24 w-24 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

