"use client"

import Link from "next/link"
import type { Content } from "@/lib/models"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface ContentCardProps {
  content: Content
  onDelete?: (id: string) => void
}

export function ContentCard({ content, onDelete }: ContentCardProps) {
  const formattedDate = content.createdAt
    ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
    : "Unknown date"

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{content.title}</CardTitle>
          <Badge variant="outline">{content.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{content.description}</p>
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">Created {formattedDate}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/view/${content._id}`}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/edit/${content._id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(content._id?.toString() || "")}
            >
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
