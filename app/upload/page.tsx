"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/error-message"
import { X, Plus } from "lucide-react"
import { ContentTypes } from "@/lib/models"
import type { Content, ContentType } from "@/lib/models"

export default function UploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Content>>({
    title: "",
    description: "",
    content: "",
    type: "Blog" as ContentType,
    tags: [],
  })
  const [file, setFile] = useState<File | null>(null)
  const [tag, setTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as ContentType }))
  }

  const handleAddTag = () => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()],
      }))
      setTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let fileUrl = formData.fileUrl

      // Upload file if selected
      if (file) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to upload file")
        }

        fileUrl = data.url
      }

      // Submit the content
      const contentResponse = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fileUrl,
        }),
      })

      const contentData = await contentResponse.json()
      if (!contentResponse.ok) {
        throw new Error(contentData.error || "Failed to create content")
      }

      // Redirect to the content page
      router.push(`/view/${contentData._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Content to DStech</CardTitle>
          <CardDescription>Share your knowledge with the data science community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ErrorMessage message={error} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                placeholder="Enter a descriptive title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Content Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {ContentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                required
                placeholder="Provide a brief description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">{formData.type === "Blog" ? "Blog Content (Markdown format)" : "Content"}</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                required
                placeholder={
                  formData.type === "Blog"
                    ? "Write your blog post in Markdown format"
                    : formData.type === "Code Snippet"
                      ? "Paste your code here"
                      : "Enter content details"
                }
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File (optional)</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
              {formData.fileUrl && <p className="text-sm text-gray-500">Current file: {formData.fileUrl}</p>}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
