"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function CreateContentPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the upload page
    router.push("/upload")
  }, [router])
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">Redirecting to upload page...</p>
    </div>
  )
}

