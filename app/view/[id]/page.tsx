"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Content } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ViewContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/contents/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch content")
        }

        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return
    }

    try {
      const response = await fetch(`/api/contents/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete content")
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
      </div>
    )
  }

  if (!content) {
    return <div className="container mx-auto py-8">Content not found</div>
  }

  const formattedDate = content.createdAt
    ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
    : "Unknown date"

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Link href={`/edit/${params.id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-500" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Badge>{content.type}</Badge>
          <span>Created {formattedDate}</span>
        </div>
      </div>

      {content.coverImage && (
        <div className="mb-6">
          <img
            src={content.coverImage || "/placeholder.svg"}
            alt={content.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground">{content.description}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Content</h2>
        <div className="prose max-w-none">
          {content.type === "Code Snippet" ? (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{content.content}</code>
            </pre>
          ) : (
            <p>{content.content}</p>
          )}
        </div>
      </div>

      {content.fileUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Attached File</h2>
          <a
            href={content.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            Download File
          </a>
        </div>
      )}

      {content.tags && content.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
