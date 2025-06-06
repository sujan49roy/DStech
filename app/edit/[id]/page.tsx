"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Content } from "@/lib/models"
import { ErrorMessage } from "@/components/error-message"
import DynamicUploadForm from "../../upload/dynamic-upload-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EditContentPage({ params }: { params: { id: string } }) {
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

  const handleSubmit = async (data: Partial<Content>) => {
    try {
      const response = await fetch(`/api/contents/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update content")
      }

      // Redirect to the view page for this content
      router.push(`/view/${params.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || "Content not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Edit Content</h1>
        <p className="text-muted-foreground mb-6">
          Update your content information below.
        </p>

        <DynamicUploadForm
          initialData={content}
          onSubmit={handleSubmit}
          isEditMode={true}
        />
      </div>
    </div>
  )
}
