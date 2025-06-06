"use client"

import { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import DynamicUploadForm from "./dynamic-upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Upload Content</h1>
        <p className="text-muted-foreground mb-6">
          Share your knowledge with the community. Select a content type below and fill out the form.
        </p>

        <DynamicUploadForm />
      </div>
    </div>
  )
}
