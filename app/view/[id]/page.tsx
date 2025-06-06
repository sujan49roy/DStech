"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Content } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Edit, Trash2, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ViewContentById({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log("Fetching content by ID:", params.id);
        const response = await fetch(`/api/contents/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching content:", errorData);
          throw new Error(errorData.error || "Failed to fetch content")
        }

        const data = await response.json()
        console.log("Content data:", data);
        setContent(data)
      } catch (err) {
        console.error("Error in content view:", err);
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [params.id])

  const handleDelete = async () => {
    if (!content) return;
    
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch(`/api/contents/${content._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete content")
      }

      // Redirect to the dashboard
      router.push(`/dashboard`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const renderContentBody = () => {
    if (!content) return null;
    
    switch (content.type) {
      case "Blog":
        return (
          <div className="prose dark:prose-invert max-w-none">
            {content.content}
          </div>
        );
      case "Code Snippet":
        return (
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{content.content}</code>
          </pre>
        );
      case "Dataset":
        return (
          <div>
            {content.content && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p>{content.content}</p>
              </div>
            )}
            {content.fileUrl && (
              <div className="mt-4">
                <Button asChild variant="outline">
                  <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Dataset
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      case "Project":
        return (
          <div>
            <div className="prose dark:prose-invert max-w-none mb-4">
              {content.content}
            </div>
            {content.fileUrl && (
              <div className="mt-4">
                <Button asChild variant="outline">
                  <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Project Files
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      case "Book":
        return (
          <div>
            <div className="prose dark:prose-invert max-w-none mb-4">
              {content.content}
            </div>
            {content.fileUrl && (
              <div className="mt-4">
                <Button asChild variant="outline">
                  <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      case "File":
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p>{content.description}</p>
            </div>
            {content.fileUrl && (
              <div className="mt-4">
                <Button asChild variant="outline">
                  <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return <p>{content.content}</p>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Content not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = content.createdAt
    ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
    : "Unknown date";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Link href={`/edit/${content._id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant={deleteConfirm ? "destructive" : "outline"} 
            className={!deleteConfirm ? "text-red-500" : ""}
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteConfirm ? "Confirm Delete" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <Badge variant="outline">{content.type}</Badge>
          <span>Created {formattedDate}</span>
          {content.slug && (
            <Link 
              href={`/content-view/${content.type.toLowerCase().replace(/\s+/g, "-")}/${content.slug}`}
              className="text-blue-500 hover:underline flex items-center text-sm"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View by slug
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-0">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-t-lg rounded-b-none border-b">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              {content.fileUrl && <TabsTrigger value="file" className="flex-1">File</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="content" className="p-6">
              {content.coverImage && (
                <div className="mb-6">
                  <img
                    src={content.coverImage}
                    alt={content.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              {renderContentBody()}
            </TabsContent>
            
            <TabsContent value="details" className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
              
              {content.tags && content.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">Content Details</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium">Type:</span> {content.type}</li>
                  <li><span className="font-medium">Created:</span> {new Date(content.createdAt).toLocaleString()}</li>
                  <li><span className="font-medium">Last Updated:</span> {new Date(content.updatedAt).toLocaleString()}</li>
                  {content.slug && <li><span className="font-medium">Slug:</span> {content.slug}</li>}
                </ul>
              </div>
            </TabsContent>
            
            {content.fileUrl && (
              <TabsContent value="file" className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Download className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">File Available</h3>
                  <p className="text-muted-foreground mb-4">
                    This content has an attached file that you can download.
                  </p>
                  <Button asChild>
                    <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </a>
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
