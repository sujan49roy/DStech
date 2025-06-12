"use client"

import type React from "react"
import { AlertTriangle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorDisplayProps {
  message: string | null
  onRetry?: () => void
  tips?: string | string[]
  title?: string // Optional title for the error card
}

export function ErrorDisplay({
  message,
  onRetry,
  tips,
  title = "An Error Occurred", // Default title
}: ErrorDisplayProps) {
  if (!message) {
    return null
  }

  const tipsArray = Array.isArray(tips) ? tips : tips ? [tips] : []

  return (
    <Card className="w-full max-w-lg mx-auto border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">{title}</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{message}</p>

          {tipsArray.length > 0 && (
            <div className="text-xs text-left text-red-500 dark:text-red-500/80 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4 w-full">
              <h4 className="font-semibold mb-1">Helpful Tips:</h4>
              <ul className="list-disc list-inside space-y-1">
                {tipsArray.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {onRetry && (
            <Button onClick={onRetry} variant="destructive" className="mt-2">
              <RotateCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
