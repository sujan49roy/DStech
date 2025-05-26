"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { type Content, type ContentType, ContentTypes } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ErrorMessage } from "@/components/error-message"

interface ContentFormProps {
  initialData?: Partial<Content>
  onSubmit: (data: Partial<Content>) => Promise<void>
}

export function ContentForm({ initialData = {}, onSubmit }: ContentFormProps) {
  const [formData, setFormData] = useState<Partial<Content>>({
    title: "",
    description: "",
    content: "",
    type: "Blog" as ContentType,
    tags: [],
    ...initialData,
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as ContentType }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim())
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
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

      // Submit the form with file URL if uploaded
      await onSubmit({
        ...formData,
        fileUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title || ""} onChange={handleChange} required />
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
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content || ""}
          onChange={handleChange}
          required
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags?.join(", ") || ""}
          onChange={handleTagsChange}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          name="coverImage"
          value={formData.coverImage || ""}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <Input id="file" type="file" onChange={handleFileChange} />
        {formData.fileUrl && <p className="text-sm text-gray-500">Current file: {formData.fileUrl}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Content"}
      </Button>
    </form>
  )
}
