"use client"

import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, Upload, Image } from "lucide-react"
import type { FieldConfig } from "@/lib/content-config"
import { uploadFile } from "@/app/upload/upload-utils"

interface FormFieldRendererProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}

export function FormFieldRenderer({ field, value, onChange, error, disabled = false }: FormFieldRendererProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            disabled={disabled}
          />
        )
      
      case 'markdown':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 10}
            disabled={disabled}
            className="font-mono"
          />
        )
      
      case 'code':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 10}
            disabled={disabled}
            className="font-mono"
          />
        )
      
      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'tags':
        return (
          <TagsInput
            value={value || []}
            onChange={onChange}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
      
      case 'file':
        return (
          <FileUpload
            value={value}
            onChange={onChange}
            field={field}
            disabled={disabled}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            uploadError={uploadError}
            setUploadError={setUploadError}
          />
        )
      
      case 'image':
        return (
          <ImageUpload
            value={value}
            onChange={onChange}
            field={field}
            disabled={disabled}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            uploadError={uploadError}
            setUploadError={setUploadError}
          />
        )
      
      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {renderField()}
      {(error || uploadError) && (
        <p className="text-red-500 text-sm">{error || uploadError}</p>
      )}
    </div>
  )
}

// Tags input component
interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
}

function TagsInput({ value, onChange, placeholder, disabled }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
        />
        <Button type="button" onClick={addTag} variant="outline" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// File upload component
interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  field: FieldConfig
  disabled?: boolean
  isUploading: boolean
  setIsUploading: (uploading: boolean) => void
  uploadError: string | null
  setUploadError: (error: string | null) => void
}

function FileUpload({ 
  value, 
  onChange, 
  field, 
  disabled, 
  isUploading, 
  setIsUploading, 
  uploadError, 
  setUploadError 
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0 || disabled) return
      
      const file = acceptedFiles[0]
      setPreview(URL.createObjectURL(file))
      setUploadError(null)
      
      try {
        setIsUploading(true)
        const fileUrl = await uploadFile(file)
        onChange(fileUrl)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to upload file")
        setPreview(null)
      } finally {
        setIsUploading(false)
      }
    },
    accept: field.validation?.fileTypes ? 
      field.validation.fileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
      undefined,
    maxFiles: 1,
    maxSize: field.validation?.maxSize || 10 * 1024 * 1024,
    disabled: disabled || isUploading
  })

  return (
    <div className="space-y-2">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition ${
          disabled || isUploading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? 'Uploading...' : 'Drag & drop a file here, or click to select'}
          </p>
          {field.validation?.fileTypes && (
            <p className="text-xs text-muted-foreground">
              Accepted: {field.validation.fileTypes.join(', ')}
            </p>
          )}
        </div>
      </div>
      
      {(value || preview) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">File uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {value ? 'Ready to save' : 'Uploading...'}
                  </p>
                </div>
              </div>
              {value && (
                <Button variant="outline" size="sm" asChild>
                  <a href={value} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Image upload component
function ImageUpload({ 
  value, 
  onChange, 
  field, 
  disabled, 
  isUploading, 
  setIsUploading, 
  uploadError, 
  setUploadError 
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0 || disabled) return
      
      const file = acceptedFiles[0]
      setPreview(URL.createObjectURL(file))
      setUploadError(null)
      
      try {
        setIsUploading(true)
        const fileUrl = await uploadFile(file)
        onChange(fileUrl)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to upload image")
        setPreview(null)
      } finally {
        setIsUploading(false)
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: field.validation?.maxSize || 5 * 1024 * 1024,
    disabled: disabled || isUploading
  })

  return (
    <div className="space-y-2">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition ${
          disabled || isUploading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Image className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? 'Uploading...' : 'Drag & drop an image here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      </div>
      
      {(value || preview) && (
        <div className="mt-2">
          <p className="text-sm mb-2">Image preview:</p>
          <img
            src={value || preview || ''}
            alt="Preview"
            className="max-h-40 max-w-full object-contain rounded-md"
          />
        </div>
      )}
    </div>
  )
}