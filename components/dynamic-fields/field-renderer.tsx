"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ExternalLink, Calendar, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { FieldConfig, FieldType } from "@/lib/content-config"
import type { Content } from "@/lib/models"

interface FieldRendererProps {
  field: FieldConfig
  value: any
  content: Content
  mode: 'view' | 'card' | 'list'
  className?: string
}

export function FieldRenderer({ field, value, content, mode, className = "" }: FieldRendererProps) {
  if (!value && field.type !== 'date') return null

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return <TextRenderer value={value} field={field} mode={mode} />
      
      case 'textarea':
        return <TextareaRenderer value={value} field={field} mode={mode} />
      
      case 'markdown':
        return <MarkdownRenderer value={value} field={field} mode={mode} />
      
      case 'code':
        return <CodeRenderer value={value} field={field} mode={mode} />
      
      case 'file':
        return <FileRenderer value={value} field={field} mode={mode} />
      
      case 'image':
        return <ImageRenderer value={value} field={field} mode={mode} />
      
      case 'tags':
        return <TagsRenderer value={value} field={field} mode={mode} />
      
      case 'select':
        return <SelectRenderer value={value} field={field} mode={mode} />
      
      case 'date':
        return <DateRenderer value={value} field={field} mode={mode} content={content} />
      
      case 'url':
        return <UrlRenderer value={value} field={field} mode={mode} />
      
      default:
        return <TextRenderer value={value} field={field} mode={mode} />
    }
  }

  if (mode === 'card' || mode === 'list') {
    return (
      <div className={className}>
        {renderField()}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-lg font-medium">{field.label}</h3>
      {renderField()}
    </div>
  )
}

// Individual field renderers
function TextRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (mode === 'card' || mode === 'list') {
    return (
      <div className="text-sm">
        <span className="font-medium">{field.label}:</span> {value}
      </div>
    )
  }
  
  return <p className="text-muted-foreground">{value}</p>
}

function TextareaRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (mode === 'card') {
    return (
      <p className="text-sm text-muted-foreground line-clamp-2">{value}</p>
    )
  }
  
  if (mode === 'list') {
    return (
      <p className="text-sm text-muted-foreground line-clamp-1">{value}</p>
    )
  }
  
  return <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
}

function MarkdownRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (mode === 'card' || mode === 'list') {
    // Strip markdown and show plain text preview
    const plainText = value.replace(/[#*`_~\[\]()]/g, '').trim()
    return (
      <p className={`text-sm text-muted-foreground ${mode === 'card' ? 'line-clamp-3' : 'line-clamp-1'}`}>
        {plainText}
      </p>
    )
  }
  
  return (
    <div className="prose dark:prose-invert max-w-none">
      {/* In a real app, you'd use a markdown parser like react-markdown */}
      <div className="whitespace-pre-wrap">{value}</div>
    </div>
  )
}

function CodeRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (mode === 'card' || mode === 'list') {
    return (
      <div className="text-xs font-mono bg-muted p-2 rounded line-clamp-2">
        {value}
      </div>
    )
  }
  
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
      <code>{value}</code>
    </pre>
  )
}

function FileRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (!value) return null
  
  const fileName = value.split('/').pop() || 'Download File'
  
  if (mode === 'card' || mode === 'list') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Download className="h-4 w-4" />
        <span className="truncate">{fileName}</span>
      </div>
    )
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">Click to download</p>
            </div>
          </div>
          <Button asChild>
            <a href={value} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ImageRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (!value) return null
  
  if (mode === 'card') {
    return (
      <div className="aspect-video relative overflow-hidden rounded-lg">
        <img
          src={value}
          alt={field.label}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  if (mode === 'list') {
    return (
      <div className="w-12 h-12 relative overflow-hidden rounded">
        <img
          src={value}
          alt={field.label}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <img
        src={value}
        alt={field.label}
        className="w-full max-w-2xl h-auto rounded-lg"
      />
    </div>
  )
}

function TagsRenderer({ value, field, mode }: { value: string[], field: FieldConfig, mode: string }) {
  if (!value || value.length === 0) return null
  
  const displayTags = mode === 'list' ? value.slice(0, 2) : value
  
  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {mode === 'list' && value.length > 2 && (
        <Badge variant="outline" className="text-xs">
          +{value.length - 2}
        </Badge>
      )}
    </div>
  )
}

function SelectRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (mode === 'card' || mode === 'list') {
    return (
      <Badge variant="outline" className="text-xs">
        {value}
      </Badge>
    )
  }
  
  return (
    <Badge variant="secondary">
      {value}
    </Badge>
  )
}

function DateRenderer({ value, field, mode, content }: { value: string, field: FieldConfig, mode: string, content: Content }) {
  // Handle special date fields
  let dateValue: Date
  if (field.key === 'createdAt') {
    dateValue = new Date(content.createdAt)
  } else if (field.key === 'updatedAt') {
    dateValue = new Date(content.updatedAt)
  } else {
    dateValue = value ? new Date(value) : new Date()
  }
  
  if (mode === 'card' || mode === 'list') {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{formatDistanceToNow(dateValue, { addSuffix: true })}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{dateValue.toLocaleString()}</span>
    </div>
  )
}

function UrlRenderer({ value, field, mode }: { value: string, field: FieldConfig, mode: string }) {
  if (!value) return null
  
  if (mode === 'card' || mode === 'list') {
    return (
      <div className="flex items-center gap-1 text-sm">
        <ExternalLink className="h-3 w-3" />
        <span className="truncate">{value}</span>
      </div>
    )
  }
  
  return (
    <Button asChild variant="outline">
      <a href={value} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="mr-2 h-4 w-4" />
        {field.label}
      </a>
    </Button>
  )
}