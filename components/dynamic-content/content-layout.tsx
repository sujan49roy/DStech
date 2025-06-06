"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FieldRenderer } from "@/components/dynamic-fields/field-renderer"
import { getContentTypeConfig, getViewFields } from "@/lib/content-config"
import type { Content } from "@/lib/models"

interface ContentLayoutProps {
  content: Content
  onDelete?: () => void
  onBack?: () => void
  showActions?: boolean
}

export function ContentLayout({ content, onDelete, onBack, showActions = true }: ContentLayoutProps) {
  const config = getContentTypeConfig(content.type)
  
  if (!config) {
    return <div>Content type configuration not found</div>
  }

  const headerFields = getViewFields(content.type, 'header')
  const mainFields = getViewFields(content.type, 'main')
  const sidebarFields = getViewFields(content.type, 'sidebar')
  const footerFields = getViewFields(content.type, 'footer')

  const formattedDate = content.createdAt
    ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
    : "Unknown date"

  return (
    <div className="container mx-auto py-8">
      {/* Header with actions */}
      {showActions && (
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
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
            {onDelete && (
              <Button variant="outline" className="text-red-500" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{content.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  <Badge variant="outline">{content.type}</Badge>
                  <span>Created {formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Render header fields */}
            {headerFields.map((field) => {
              const value = (content as any)[field.key]
              if (!value && field.type !== 'date') return null
              
              return (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={value}
                  content={content}
                  mode="view"
                />
              )
            })}
          </div>

          {/* Main content with tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full rounded-t-lg rounded-b-none border-b">
                  <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  {content.fileUrl && <TabsTrigger value="file" className="flex-1">File</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="content" className="p-6 space-y-6">
                  {/* Render main content fields */}
                  {mainFields.map((field) => {
                    const value = (content as any)[field.key]
                    if (!value && field.type !== 'date') return null
                    
                    return (
                      <FieldRenderer
                        key={field.key}
                        field={field}
                        value={value}
                        content={content}
                        mode="view"
                      />
                    )
                  })}
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
                      <li><span className="font-medium">Type:</span> {content.type}</li>                      <li><span className="font-medium">Created:</span> {content.createdAt ? new Date(content.createdAt).toLocaleString() : 'Unknown'}</li>
                      <li><span className="font-medium">Last Updated:</span> {content.updatedAt ? new Date(content.updatedAt).toLocaleString() : 'Unknown'}</li>
                    </ul>
                  </div>

                  {/* Render additional detail fields */}
                  {config.fields
                    .filter(field => !headerFields.includes(field) && !mainFields.includes(field) && field.key !== 'tags')
                    .map((field) => {
                      const value = (content as any)[field.key]
                      if (!value && field.type !== 'date') return null
                      
                      return (
                        <FieldRenderer
                          key={field.key}
                          field={field}
                          value={value}
                          content={content}
                          mode="view"
                        />
                      )
                    })}
                </TabsContent>
                
                {content.fileUrl && (
                  <TabsContent value="file" className="p-6">
                    <FieldRenderer
                      field={{ key: 'fileUrl', label: 'File', type: 'file' }}
                      value={content.fileUrl}
                      content={content}
                      mode="view"
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer fields */}
          {footerFields.length > 0 && (
            <div className="space-y-4">
              {footerFields.map((field) => {
                const value = (content as any)[field.key]
                if (!value && field.type !== 'date') return null
                
                return (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    value={value}
                    content={content}
                    mode="view"
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Render sidebar fields */}
              {sidebarFields.map((field) => {
                const value = (content as any)[field.key]
                
                return (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    value={value}
                    content={content}
                    mode="view"
                    className="text-sm"
                  />
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Enhanced content card for list views
interface ContentCardProps {
  content: Content
  onDelete?: (id: string) => void
}

export function DynamicContentCard({ content, onDelete }: ContentCardProps) {
  const config = getContentTypeConfig(content.type)
  
  if (!config) {
    return <div>Content type configuration not found</div>
  }

  const cardFields = config.fields.filter(field => field.showInCard)

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and type */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <Link href={`/view/${content._id}`}>
                <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2">
                  {content.title}
                </h3>
              </Link>
              <Badge variant="outline" className="ml-2 shrink-0">
                {content.type}
              </Badge>
            </div>
          </div>

          {/* Render card fields */}
          <div className="space-y-3">
            {cardFields.map((field) => {
              const value = (content as any)[field.key]
              if (!value && field.type !== 'date') return null
              
              return (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={value}
                  content={content}
                  mode="card"
                />
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
            </div>
            <div className="flex gap-2">
              <Link href={`/edit/${content._id}`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(content._id?.toString() || '')}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}