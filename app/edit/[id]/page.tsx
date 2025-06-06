"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Content } from "@/lib/models"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DynamicEditForm } from "@/components/dynamic-content/dynamic-edit-form"

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contentId, setContentId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params
      setContentId(id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!contentId) return

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/contents/${contentId}`)

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
  }, [contentId])

  const handleSubmit = async (data: Partial<Content>) => {
    if (!contentId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/contents/${contentId}`, {
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
      router.push(`/view/${contentId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false)
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
    <DynamicEditForm
      contentType={content.type}
      initialData={content}
      onSubmit={handleSubmit}
      isEditMode={true}
      isSubmitting={isSubmitting}
    />
  )
}
