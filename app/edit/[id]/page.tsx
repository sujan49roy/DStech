"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ContentForm } from "@/components/content-form"
import type { Content } from "@/lib/models"
import { ErrorMessage } from "@/components/error-message"

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

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!content) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message="Content not found" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Content</h1>
      <ErrorMessage message={error} />
      <ContentForm initialData={content} onSubmit={handleSubmit} />
    </div>
  )
}
