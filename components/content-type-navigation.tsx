"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Code, Database, Folder, Book, Upload } from "lucide-react"
import { ContentTypes } from "@/lib/models"
import type { ContentType } from "@/lib/models"

interface ContentTypeNavigationProps {
  selectedType: ContentType
  onTypeSelect: (type: ContentType) => void
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

// Helper function to get type description
function getTypeDescription(type: ContentType) {
  switch(type) {
    case "Blog": return "Write and publish articles";
    case "Code Snippet": return "Share code with syntax highlighting";
    case "Dataset": return "Upload and document datasets";
    case "Project": return "Showcase projects with documentation";
    case "Book": return "Share books and reading materials";
    case "File": return "Upload any type of file";
    default: return "";
  }
}

export function ContentTypeNavigation({ selectedType, onTypeSelect }: ContentTypeNavigationProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-center sm:text-left">Select Content Type</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ContentTypes.map((type) => (
          <Card 
            key={type} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedType === type 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:bg-muted/50"
            }`}
            onClick={() => onTypeSelect(type as ContentType)}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-2 rounded-lg ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  {getTypeIcon(type as ContentType)}
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm">{type}</h3>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {getTypeDescription(type as ContentType)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}