"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContentForm } from "@/components/content-form"
import type { Content } from "@/lib/models"
import { ErrorMessage } from "@/components/error-message"

export default function CreateContentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: Partial<Content>) => {
    try {
      const response = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create content")
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Content</h1>
      <ErrorMessage message={error} />
      <ContentForm onSubmit={handleSubmit} />
    </div>
  )
}
