import { ContentType } from "@/lib/models";

// Get appropriate file accept types based on content type
export function getFileAcceptTypes(type: ContentType): Record<string, string[]> {
  switch(type) {
    case "Dataset": 
      return {
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls', '.xlsx'],
        'application/json': ['.json']
      };
    case "Project": 
      return {
        'application/zip': ['.zip'],
        'application/x-zip-compressed': ['.zip']
      };
    case "Book": 
      return {
        'application/pdf': ['.pdf']
      };
    case "File":
      return {}; // Accept all file types
    default:
      return {};
  }
}

// Upload file to server
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to upload file");
  }

  return data.url;
}

// Get appropriate icon for content type
export function getContentTypeLabel(type: ContentType): string {
  switch(type) {
    case "Blog": return "Blog Post";
    case "Code Snippet": return "Code Snippet";
    case "Dataset": return "Dataset";
    case "Project": return "Project";
    case "Book": return "Book";
    case "File": return "File";
    default: return type;
  }
}

// Get helper text for content type
export function getContentTypeHelperText(type: ContentType): string {
  switch(type) {
    case "Blog": 
      return "Create a blog post with markdown formatting";
    case "Code Snippet": 
      return "Share code snippets with others";
    case "Dataset": 
      return "Upload and share datasets (CSV, XLS, JSON)";
    case "Project": 
      return "Share complete projects as ZIP files";
    case "Book": 
      return "Upload PDF books or publications";
    case "File": 
      return "Upload any other type of file";
    default: 
      return "";
  }
}

// Get required fields for content type
export function getRequiredFields(type: ContentType): string[] {
  const baseFields = ["title", "description"];
  
  switch(type) {
    case "Blog":
      return [...baseFields, "content"];
    case "Code Snippet":
      return [...baseFields, "content"];
    case "Dataset":
      return [...baseFields, "fileUrl"];
    case "Project":
      return [...baseFields, "content", "fileUrl"];
    case "Book":
      return [...baseFields, "fileUrl"];
    case "File":
      return [...baseFields, "fileUrl"];
    default:
      return baseFields;
  }
}