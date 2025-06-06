"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Content } from "@/lib/models"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ContentLayout } from "@/components/dynamic-content/content-layout"

export default function ViewContentById({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
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
        console.log("Fetching content by ID:", contentId);
        const response = await fetch(`/api/contents/${contentId}`)

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
  }, [contentId])

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

  return (
    <ContentLayout
      content={content}
      onDelete={handleDelete}
      onBack={() => router.back()}
      showActions={true}
    />
  )
}
