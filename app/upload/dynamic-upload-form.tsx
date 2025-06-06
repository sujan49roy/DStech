"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/error-message"
import { X, Plus, Upload, Image, FileText, Book, Code, Database, Folder } from "lucide-react"
import { ContentTypes, generateSlug } from "@/lib/models"
import type { ContentType } from "@/lib/models"
import { ContentTypeNavigation } from "@/components/content-type-navigation"
import {
  getFileAcceptTypes,
  uploadFile,
  getContentTypeLabel,
  getContentTypeHelperText,
  getRequiredFields
} from "./upload-utils"

// Create schema for form validation
const baseSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  content: z.string().optional(),
  type: z.enum(ContentTypes as unknown as [string, ...string[]]),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  slug: z.string().optional(),
  author: z.string().optional(),
});

interface FormData {
  title: string;
  description: string;
  content?: string;
  type: ContentType;
  tags?: string[];
  coverImage?: string;
  fileUrl?: string;
  slug?: string;
  author?: string; // For Book type
}

// Helper function to get type icon
function getTypeIcon(type: ContentType) {
  switch(type) {
    case "Blog": return <FileText className="h-5 w-5" />;
    case "Code Snippet": return <Code className="h-5 w-5" />;
    case "Dataset": return <Database className="h-5 w-5" />;
    case "Project": return <Folder className="h-5 w-5" />;
    case "Book": return <Book className="h-5 w-5" />;
    case "File": return <Upload className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
}

export default function DynamicUploadForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tag, setTag] = useState("")
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [slugGenerated, setSlugGenerated] = useState(false)

  // Use react-hook-form for form management
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      type: "Blog" as ContentType,
      tags: [],
    }
  });

  // Watch form values for real-time updates
  const title = watch("title")
  const type = watch("type") as ContentType
  const tags = watch("tags") || []

  // Update the form fields when content type changes
  useEffect(() => {
    // Reset file-related fields when changing types
    setFilePreview(null);
    setCoverImagePreview(null);
    setValue("fileUrl", undefined);
    setValue("coverImage", undefined);
    
    // Reset content if switching to Dataset or File
    if (type === "Dataset" || type === "File") {
      setValue("content", "");
    }
    
    // Reset author if switching from Book
    if (type !== "Book") {
      setValue("author", undefined);
    }
  }, [type, setValue]);

  // Generate slug when title changes
  useEffect(() => {
    if (title && !slugGenerated) {
      const generatedSlug = generateSlug(title);
      setValue("slug", generatedSlug);
    }
  }, [title, setValue, slugGenerated]);

  // Setup dropzone for file uploads
  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, fileRejections: fileRejections } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      // Create object URL for preview
      setFilePreview(URL.createObjectURL(file));
      setError(null); // Clear any previous errors
      
      try {
        // Show loading state
        setIsSubmitting(true);
        
        // Upload file to server
        const fileUrl = await uploadFile(file);
        setValue("fileUrl", fileUrl);
        setIsSubmitting(false);
      } catch (err) {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : "Failed to upload file");
        // Clear the preview if upload failed
        setFilePreview(null);
      }
    },
    onDropRejected: (rejections) => {
      const errorMessage = rejections[0]?.errors[0]?.message || "Invalid file type";
      setError(`File upload rejected: ${errorMessage}`);
    },
    accept: getFileAcceptTypes(type),
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Setup dropzone for cover image uploads
  const { getRootProps: getCoverImageRootProps, getInputProps: getCoverImageInputProps, fileRejections: imageRejections } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      // Create object URL for preview
      setCoverImagePreview(URL.createObjectURL(file));
      setError(null); // Clear any previous errors
      
      try {
        // Show loading state
        setIsSubmitting(true);
        
        // Upload file to server
        const fileUrl = await uploadFile(file);
        setValue("coverImage", fileUrl);
        setIsSubmitting(false);
      } catch (err) {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : "Failed to upload image");
        // Clear the preview if upload failed
        setCoverImagePreview(null);
      }
    },
    onDropRejected: (rejections) => {
      const errorMessage = rejections[0]?.errors[0]?.message || "Invalid image type";
      setError(`Image upload rejected: ${errorMessage}`);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB for images
  });

  // Handle adding tags
  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setValue("tags", [...tags, tag.trim()]);
      setTag("");
    }
  }

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setValue("tags", tags.filter((t) => t !== tagToRemove));
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit the content
      const contentResponse = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentData = await contentResponse.json();
      if (!contentResponse.ok) {
        throw new Error(contentData.error || "Failed to create content");
      }

      // Redirect to the content page
      router.push(`/view/${contentData._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a field is required
  const isFieldRequired = (fieldName: string) => {
    return getRequiredFields(type).includes(fieldName);
  };

  return (
    <div className="space-y-6">
      {/* Content Type Navigation */}
      <ContentTypeNavigation
        selectedType={type}
        onTypeSelect={(selectedType) => setValue("type", selectedType)}
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ErrorMessage message={error} />

            {/* Selected Content Type Display */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                {getTypeIcon(type)}
                <div>
                  <h3 className="font-medium">{getContentTypeLabel(type)}</h3>
                  <p className="text-sm text-muted-foreground">{getContentTypeHelperText(type)}</p>
                </div>
              </div>
            </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Title {isFieldRequired("title") && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter a descriptive title"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Author field (for Book type) */}
          {type === "Book" && (
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-1">
                Author {isFieldRequired("author") && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="author"
                {...register("author")}
                placeholder="Enter the author's name"
              />
              {errors.author && <p className="text-red-500 text-sm">{errors.author.message}</p>}
            </div>
          )}


          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              Description {isFieldRequired("description") && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Provide a brief description"
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          {/* Content - Not shown for Dataset and File types */}
          {type !== "Dataset" && type !== "File" && (
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-1">
                {type === "Blog" ? "Blog Content (Markdown format)" : 
                 type === "Code Snippet" ? "Code" : "Content"}
                {isFieldRequired("content") && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder={
                  type === "Blog" ? "Write your blog post in Markdown format" :
                  type === "Code Snippet" ? "Paste your code here" :
                  "Enter content details"
                }
                rows={10}
                className={type === "Code Snippet" ? "font-mono" : ""}
              />
              {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
            </div>
          )}

          {/* File Upload - Shown for Dataset, Project, Book, and File types */}
          {(type === "Dataset" || type === "Project" || 
            type === "Book" || type === "File") && (
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="flex items-center gap-1">
                {type === "Dataset" ? "Upload Dataset" :
                 type === "Project" ? "Upload Project Files (ZIP)" :
                 type === "Book" ? "Upload PDF" : "Upload File"}
                {isFieldRequired("fileUrl") && <span className="text-red-500">*</span>}
              </Label>
              <div 
                {...getFileRootProps()} 
                className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <input {...getFileInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type === "Dataset" ? "CSV, XLS, or JSON files accepted" :
                     type === "Project" ? "ZIP files accepted" :
                     type === "Book" ? "PDF files accepted" : "All file types accepted"}
                  </p>
                </div>
              </div>
              {filePreview && (
                <div className="mt-2 p-2 border rounded-md">
                  <p className="text-sm">File selected</p>
                  {filePreview.startsWith('data:image') && (
                    <img src={filePreview} alt="Preview" className="mt-2 max-h-40 max-w-full object-contain" />
                  )}
                </div>
              )}
              {errors.fileUrl && <p className="text-red-500 text-sm">{errors.fileUrl.message}</p>}
            </div>
          )}

          {/* Cover Image - Shown for Blog, Dataset, and Book types */}
          {(type === "Blog" || type === "Dataset" || type === "Book") && (
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="flex items-center gap-1">
                Cover Image {isFieldRequired("coverImage") && <span className="text-red-500">*</span>}
              </Label>
              <div 
                {...getCoverImageRootProps()} 
                className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <input {...getCoverImageInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Image className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              {coverImagePreview && (
                <div className="mt-2">
                  <p className="text-sm">Image preview:</p>
                  <img src={coverImagePreview} alt="Preview" className="mt-2 max-h-40 max-w-full object-contain rounded-md" />
                </div>
              )}
              {errors.coverImage && <p className="text-red-500 text-sm">{errors.coverImage.message}</p>}
            </div>
          )}

          {/* Tags */}
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
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
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

          {/* Submit Button */}
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
