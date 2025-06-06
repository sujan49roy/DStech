"use client"

import { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import DynamicUploadForm from "./dynamic-upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Upload Content</h1>
          <p className="text-muted-foreground text-lg">
            Share your knowledge with the community. Select a content type below and fill out the form.
          </p>
        </div>

        <DynamicUploadForm />
      </div>
    </div>
  )
}
