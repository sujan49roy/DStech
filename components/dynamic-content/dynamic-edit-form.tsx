"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"
import { FormFieldRenderer } from "@/components/dynamic-fields/form-field-renderer"
import { getContentTypeConfig, getFieldsBySection } from "@/lib/content-config"
import { generateSlug } from "@/lib/models"
import type { Content, ContentType } from "@/lib/models"

interface DynamicEditFormProps {
  contentType: ContentType
  initialData?: Partial<Content>
  onSubmit: (data: any) => Promise<void>
  isEditMode?: boolean
  isSubmitting?: boolean
}

export function DynamicEditForm({ 
  contentType, 
  initialData, 
  onSubmit, 
  isEditMode = false,
  isSubmitting = false 
}: DynamicEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  
  const config = getContentTypeConfig(contentType)
  
  if (!config) {
    return <div>Content type configuration not found</div>
  }

  // Create dynamic schema based on field configuration
  const createSchema = () => {
    const schemaFields: Record<string, any> = {}
    
    config.fields.forEach(field => {
      let fieldSchema: any
      
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'markdown':
        case 'code':
        case 'url':
          fieldSchema = z.string()
          if (field.validation?.minLength) {
            fieldSchema = fieldSchema.min(field.validation.minLength, 
              `${field.label} must be at least ${field.validation.minLength} characters`)
          }
          if (field.validation?.maxLength) {
            fieldSchema = fieldSchema.max(field.validation.maxLength,
              `${field.label} must be no more than ${field.validation.maxLength} characters`)
          }
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern),
              `${field.label} format is invalid`)
          }
          break
          
        case 'select':
          fieldSchema = z.enum(field.options as [string, ...string[]])
          break
          
        case 'tags':
          fieldSchema = z.array(z.string()).optional()
          break
          
        case 'file':
        case 'image':
          fieldSchema = z.string().url().optional()
          break
          
        default:
          fieldSchema = z.string().optional()
      }
      
      if (!field.required) {
        fieldSchema = fieldSchema.optional()
      }
      
      schemaFields[field.key] = fieldSchema
    })
    
    return z.object(schemaFields)
  }

  const schema = createSchema()
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: contentType,
      ...initialData
    }
  })

  // Watch form values
  const watchedValues = watch()
  const title = watch("title")

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEditMode && !watchedValues.slug) {
      setValue("slug", generateSlug(title))
    }
  }, [title, setValue, isEditMode, watchedValues.slug])

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      reset({
        type: contentType,
        ...initialData
      })
    }
  }, [initialData, reset, contentType])

  const handleFormSubmit = async (data: any) => {
    setError(null)
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  // Get fields by section
  const basicFields = getFieldsBySection(contentType, 'basic')
  const contentFields = getFieldsBySection(contentType, 'content')
  const mediaFields = getFieldsBySection(contentType, 'media')
  const metadataFields = getFieldsBySection(contentType, 'metadata')


  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit' : 'Create'} {config.label}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Update your content information below.' : config.description}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <ErrorMessage message={error} />

          {/* Tabbed form layout */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full rounded-t-lg rounded-b-none border-b">
                  <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                  {contentFields.length > 0 && (
                    <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                  )}
                  {mediaFields.length > 0 && (
                    <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                  )}
                  <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="p-6 space-y-6">
                  {basicFields.map((field) => (
                    <FormFieldRenderer
                      key={field.key}
                      field={field}
                      value={(watchedValues as any)[field.key]}
                      onChange={(value) => setValue(field.key as any, value)}
                      error={(errors as any)[field.key]?.message}
                      disabled={isSubmitting}
                    />
                  ))}
                </TabsContent>

                {/* Content Tab */}
                {contentFields.length > 0 && (
                  <TabsContent value="content" className="p-6 space-y-6">
                    {contentFields.map((field) => (
                      <FormFieldRenderer
                        key={field.key}
                        field={field}
                        value={(watchedValues as any)[field.key]}
                        onChange={(value) => setValue(field.key as any, value)}
                        error={(errors as any)[field.key]?.message}
                        disabled={isSubmitting}
                      />
                    ))}
                  </TabsContent>
                )}

                {/* Media Tab */}
                {mediaFields.length > 0 && (
                  <TabsContent value="media" className="p-6 space-y-6">
                    {mediaFields.map((field) => (
                      <FormFieldRenderer
                        key={field.key}
                        field={field}
                        value={(watchedValues as any)[field.key]}
                        onChange={(value) => setValue(field.key as any, value)}
                        error={(errors as any)[field.key]?.message}
                        disabled={isSubmitting}
                      />
                    ))}
                  </TabsContent>
                )}

                {/* Metadata Tab */}
                <TabsContent value="metadata" className="p-6 space-y-6">
                  {metadataFields.map((field) => (
                    <FormFieldRenderer
                      key={field.key}
                      field={field}
                      value={(watchedValues as any)[field.key]}
                      onChange={(value) => setValue(field.key as any, value)}
                      error={(errors as any)[field.key]?.message}
                      disabled={isSubmitting}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              {isEditMode && watchedValues._id && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/view/${watchedValues._id}`)}
                  disabled={isSubmitting}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'} {config.label}
            </Button>
          </div>
        </form>

        {/* Form validation summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Please fix the following errors:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {config.fields.find(f => f.key === field)?.label || field}: {error?.message}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Simplified version for quick edits
interface QuickEditFormProps {
  content: Content
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function QuickEditForm({ content, onSubmit, onCancel, isSubmitting = false }: QuickEditFormProps) {
  const config = getContentTypeConfig(content.type)
  const [formData, setFormData] = useState(content)
  const [error, setError] = useState<string | null>(null)

  if (!config) {
    return <div>Content type configuration not found</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  // Get only the most important fields for quick edit
  const quickEditFields = config.fields.filter(field => 
    ['title', 'description', 'tags'].includes(field.key)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Edit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={error} />
          
          {quickEditFields.map((field) => (
            <FormFieldRenderer
              key={field.key}
              field={field}
              value={(formData as any)[field.key]}
              onChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
              disabled={isSubmitting}
            />
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}