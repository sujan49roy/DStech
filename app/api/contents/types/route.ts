import { NextResponse } from "next/server"
import { ContentTypes } from "@/lib/models"

export async function GET() {
  return NextResponse.json(ContentTypes)
}
