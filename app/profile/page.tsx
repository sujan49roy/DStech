"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorMessage } from "@/components/error-message"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, FileText, Code, Database, FolderKanban, BookOpen, File } from "lucide-react"
import Link from "next/link"
import type { Content } from "@/lib/models"

const contentTypeIcons = {
  Blog: FileText,
  "Code Snippet": Code,
  Dataset: Database,
  Project: FolderKanban,
  Book: BookOpen,
  File: File,
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch("/api/auth/user")
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data")
        }
        const userData = await userResponse.json()
        setUser(userData)

        const contentsResponse = await fetch("/api/contents")
        if (!contentsResponse.ok) {
          throw new Error("Failed to fetch contents")
        }
        const contentsData = await contentsResponse.json()
        setContents(contentsData)

        // Calculate content counts by type
        const counts: Record<string, number> = {}
        contentsData.forEach((content: Content) => {
          counts[content.type] = (counts[content.type] || 0) + 1
        })
        setContentCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
      setContents((prev) => {
        const updatedContents = prev.filter((content) => content._id?.toString() !== id)

        // Update content counts
        const counts: Record<string, number> = {}
        updatedContents.forEach((content: Content) => {
          counts[content.type] = (counts[content.type] || 0) + 1
        })
        setContentCounts(counts)

        return updatedContents
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message="User not found" />
      </div>
    )
  }

  const totalContents = contents.length

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Profile</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">Settings</TabsTrigger>
          <TabsTrigger value="contents" className="flex-1 sm:flex-none">My Contents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed to 2 columns */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Name</Label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>                    <Label className="text-sm text-gray-500">Member Since</Label>
                    <p className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Summary</CardTitle>
                <CardDescription>Overview of your knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Total Contents</Label>
                    <p className="text-2xl font-bold">{totalContents}</p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(contentCounts).map(([type, count]) => {
                      const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons]
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span>{type}s</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user.name} disabled className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} disabled className="bg-gray-50 dark:bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contents">
          <Card>
            <CardHeader>
              <CardTitle>My Contents</CardTitle>
              <CardDescription>Manage all your knowledge base contents</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorMessage message={error} />

              {contents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't created any content yet</p>
                  <Link href="/create">
                    <Button>Create your first content</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contents.map((content) => {
                        const Icon = contentTypeIcons[content.type as keyof typeof contentTypeIcons]
                        return (
                          <TableRow key={content._id?.toString()}>
                            <TableCell className="font-medium">
                              <Link href={`/view/${content._id}`} className="hover:underline">
                                {content.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-gray-500" />
                                <span>{content.type}</span>
                              </div>
                            </TableCell>                            <TableCell>{content.createdAt ? new Date(content.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                            <TableCell>{content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'Unknown'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/view/${content._id}`}>View</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/edit/${content._id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => handleDelete(content._id?.toString() || "")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
