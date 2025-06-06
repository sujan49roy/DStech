import type { ContentType } from "./models"

// Field types that can be rendered
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'markdown' 
  | 'code' 
  | 'file' 
  | 'image' 
  | 'tags' 
  | 'select'
  | 'date'
  | 'url'

// Field configuration interface
export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  description?: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    fileTypes?: string[]
    maxSize?: number
  }
  options?: string[] // For select fields
  rows?: number // For textarea fields
  showInCard?: boolean // Show in content card preview
  showInList?: boolean // Show in content list
  order?: number // Display order
}

// Layout configuration for different views
export interface LayoutConfig {
  view: {
    sections: {
      header: string[]
      main: string[]
      sidebar: string[]
      footer: string[]
    }
    cardFields: string[] // Fields to show in card view
    listFields: string[] // Fields to show in list view
  }
  edit: {
    sections: {
      basic: string[]
      content: string[]
      media: string[]
      metadata: string[]
    }
    tabs?: {
      [key: string]: string[]
    }
  }
}

// Content type configuration
export interface ContentTypeConfig {
  type: ContentType
  label: string
  description: string
  icon: string
  fields: FieldConfig[]
  layout: LayoutConfig
}

// Content type configurations
export const contentTypeConfigs: Record<ContentType, ContentTypeConfig> = {
  "Blog": {
    type: "Blog",
    label: "Blog Post",
    description: "Write and publish blog articles with rich content",
    icon: "FileText",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
        placeholder: "Enter blog post title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Brief description of your blog post",
        validation: { minLength: 10, maxLength: 500 },
        rows: 3,
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "content",
        label: "Content",
        type: "markdown",
        required: true,
        placeholder: "Write your blog post in Markdown format",
        description: "Use Markdown syntax for formatting",
        validation: { minLength: 50 },
        order: 3
      },
      {
        key: "coverImage",
        label: "Cover Image",
        type: "image",
        placeholder: "Upload a cover image",
        validation: { fileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp'], maxSize: 5 * 1024 * 1024 },
        showInCard: true,
        order: 4
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tags to categorize your post",
        showInCard: true,
        showInList: true,
        order: 5
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "description", "tags"],
          main: ["coverImage", "content"],
          sidebar: ["createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "description", "coverImage", "tags"],
        listFields: ["title", "description", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "description"],
          content: ["content"],
          media: ["coverImage"],
          metadata: ["tags"]
        }
      }
    }
  },

  "Code Snippet": {
    type: "Code Snippet",
    label: "Code Snippet",
    description: "Share and organize code snippets with syntax highlighting",
    icon: "Code",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
        placeholder: "Enter code snippet title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Describe what this code does",
        validation: { minLength: 10, maxLength: 500 },
        rows: 3,
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "content",
        label: "Code",
        type: "code",
        required: true,
        placeholder: "Paste your code here",
        description: "The actual code content",
        validation: { minLength: 10 },
        order: 3
      },
      {
        key: "language",
        label: "Programming Language",
        type: "select",
        options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Other"],
        placeholder: "Select programming language",
        showInCard: true,
        showInList: true,
        order: 4
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tags like 'algorithm', 'utility', etc.",
        showInCard: true,
        showInList: true,
        order: 5
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "description", "language", "tags"],
          main: ["content"],
          sidebar: ["createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "description", "language", "tags"],
        listFields: ["title", "description", "language", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "description", "language"],
          content: ["content"],
          media: [],
          metadata: ["tags"]
        }
      }
    }
  },

  "Dataset": {
    type: "Dataset",
    label: "Dataset",
    description: "Upload and share datasets with documentation",
    icon: "Database",
    fields: [
      {
        key: "title",
        label: "Dataset Title",
        type: "text",
        required: true,
        placeholder: "Enter dataset title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Describe the dataset, its source, and potential uses",
        validation: { minLength: 20, maxLength: 1000 },
        rows: 4,
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "fileUrl",
        label: "Dataset File",
        type: "file",
        required: true,
        placeholder: "Upload dataset file",
        validation: { fileTypes: ['.csv', '.xlsx', '.json', '.zip'], maxSize: 50 * 1024 * 1024 },
        order: 3
      },
      {
        key: "coverImage",
        label: "Preview Image",
        type: "image",
        placeholder: "Upload a preview or chart image",
        validation: { fileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp'], maxSize: 5 * 1024 * 1024 },
        showInCard: true,
        order: 4
      },
      {
        key: "dataFormat",
        label: "Data Format",
        type: "select",
        options: ["CSV", "Excel", "JSON", "XML", "Parquet", "Other"],
        placeholder: "Select data format",
        showInCard: true,
        showInList: true,
        order: 5
      },
      {
        key: "size",
        label: "Dataset Size",
        type: "text",
        placeholder: "e.g., 10MB, 1000 rows",
        description: "Approximate size or number of records",
        showInCard: true,
        order: 6
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tags like 'machine-learning', 'finance', etc.",
        showInCard: true,
        showInList: true,
        order: 7
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "description", "dataFormat", "size", "tags"],
          main: ["coverImage", "fileUrl"],
          sidebar: ["createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "description", "coverImage", "dataFormat", "size", "tags"],
        listFields: ["title", "description", "dataFormat", "size", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "description"],
          content: ["fileUrl", "dataFormat", "size"],
          media: ["coverImage"],
          metadata: ["tags"]
        }
      }
    }
  },

  "Project": {
    type: "Project",
    label: "Project",
    description: "Showcase projects with documentation and files",
    icon: "Folder",
    fields: [
      {
        key: "title",
        label: "Project Title",
        type: "text",
        required: true,
        placeholder: "Enter project title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Brief description of your project",
        validation: { minLength: 20, maxLength: 500 },
        rows: 3,
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "content",
        label: "Project Documentation",
        type: "markdown",
        required: true,
        placeholder: "Detailed project documentation in Markdown",
        description: "Include setup instructions, features, usage examples",
        validation: { minLength: 50 },
        order: 3
      },
      {
        key: "fileUrl",
        label: "Project Files",
        type: "file",
        placeholder: "Upload project files (ZIP)",
        validation: { fileTypes: ['.zip', '.tar.gz'], maxSize: 100 * 1024 * 1024 },
        order: 4
      },
      {
        key: "demoUrl",
        label: "Demo URL",
        type: "url",
        placeholder: "https://your-demo-site.com",
        description: "Link to live demo or deployed version",
        showInCard: true,
        order: 5
      },
      {
        key: "githubUrl",
        label: "GitHub URL",
        type: "url",
        placeholder: "https://github.com/username/repo",
        description: "Link to GitHub repository",
        showInCard: true,
        order: 6
      },
      {
        key: "technologies",
        label: "Technologies",
        type: "tags",
        placeholder: "Add technologies used (React, Node.js, etc.)",
        showInCard: true,
        showInList: true,
        order: 7
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add project tags",
        showInCard: true,
        showInList: true,
        order: 8
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "description", "technologies", "tags"],
          main: ["content", "demoUrl", "githubUrl", "fileUrl"],
          sidebar: ["createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "description", "technologies", "demoUrl", "githubUrl"],
        listFields: ["title", "description", "technologies", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "description"],
          content: ["content", "fileUrl"],
          media: [],
          metadata: ["demoUrl", "githubUrl", "technologies", "tags"]
        }
      }
    }
  },

  "Book": {
    type: "Book",
    label: "Book",
    description: "Share books and reading materials",
    icon: "Book",
    fields: [
      {
        key: "title",
        label: "Book Title",
        type: "text",
        required: true,
        placeholder: "Enter book title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "author",
        label: "Author",
        type: "text",
        required: true,
        placeholder: "Enter author name",
        validation: { minLength: 2, maxLength: 100 },
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Book summary or description",
        validation: { minLength: 20, maxLength: 1000 },
        rows: 4,
        showInCard: true,
        showInList: true,
        order: 3
      },
      {
        key: "content",
        label: "Review/Notes",
        type: "markdown",
        placeholder: "Your review, notes, or key takeaways",
        description: "Optional review or personal notes about the book",
        order: 4
      },
      {
        key: "fileUrl",
        label: "PDF File",
        type: "file",
        placeholder: "Upload PDF file",
        validation: { fileTypes: ['.pdf'], maxSize: 50 * 1024 * 1024 },
        order: 5
      },
      {
        key: "coverImage",
        label: "Book Cover",
        type: "image",
        placeholder: "Upload book cover image",
        validation: { fileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp'], maxSize: 5 * 1024 * 1024 },
        showInCard: true,
        order: 6
      },
      {
        key: "isbn",
        label: "ISBN",
        type: "text",
        placeholder: "Enter ISBN number",
        description: "International Standard Book Number",
        order: 7
      },
      {
        key: "publishYear",
        label: "Publication Year",
        type: "text",
        placeholder: "2024",
        validation: { pattern: "^[0-9]{4}$" },
        showInCard: true,
        order: 8
      },
      {
        key: "genre",
        label: "Genre",
        type: "select",
        options: ["Fiction", "Non-Fiction", "Science", "Technology", "Business", "Biography", "History", "Philosophy", "Other"],
        placeholder: "Select genre",
        showInCard: true,
        showInList: true,
        order: 9
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tags",
        showInCard: true,
        showInList: true,
        order: 10
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "author", "description", "genre", "publishYear", "tags"],
          main: ["coverImage", "content", "fileUrl"],
          sidebar: ["isbn", "createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "author", "description", "coverImage", "genre", "publishYear"],
        listFields: ["title", "author", "description", "genre", "publishYear", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "author", "description"],
          content: ["content", "fileUrl"],
          media: ["coverImage"],
          metadata: ["isbn", "publishYear", "genre", "tags"]
        }
      }
    }
  },

  "File": {
    type: "File",
    label: "File",
    description: "Upload and share any type of file",
    icon: "Upload",
    fields: [
      {
        key: "title",
        label: "File Title",
        type: "text",
        required: true,
        placeholder: "Enter file title",
        validation: { minLength: 3, maxLength: 200 },
        showInCard: true,
        showInList: true,
        order: 1
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Describe the file and its purpose",
        validation: { minLength: 10, maxLength: 500 },
        rows: 3,
        showInCard: true,
        showInList: true,
        order: 2
      },
      {
        key: "fileUrl",
        label: "File",
        type: "file",
        required: true,
        placeholder: "Upload any file",
        validation: { maxSize: 100 * 1024 * 1024 },
        order: 3
      },
      {
        key: "fileType",
        label: "File Type",
        type: "select",
        options: ["Document", "Spreadsheet", "Presentation", "Image", "Video", "Audio", "Archive", "Other"],
        placeholder: "Select file type",
        showInCard: true,
        showInList: true,
        order: 4
      },
      {
        key: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tags to categorize the file",
        showInCard: true,
        showInList: true,
        order: 5
      },
    ],
    layout: {
      view: {
        sections: {
          header: ["title", "description", "fileType", "tags"],
          main: ["fileUrl"],
          sidebar: ["createdAt", "updatedAt"],
          footer: []
        },
        cardFields: ["title", "description", "fileType", "tags"],
        listFields: ["title", "description", "fileType", "tags", "createdAt"]
      },
      edit: {
        sections: {
          basic: ["title", "description"],
          content: ["fileUrl", "fileType"],
          media: [],
          metadata: ["tags"]
        }
      }
    }
  }
}

// Helper functions
export function getContentTypeConfig(type: ContentType): ContentTypeConfig {
  return contentTypeConfigs[type]
}

export function getFieldConfig(type: ContentType, fieldKey: string): FieldConfig | undefined {
  return contentTypeConfigs[type]?.fields.find(field => field.key === fieldKey)
}

export function getRequiredFields(type: ContentType): string[] {
  return contentTypeConfigs[type]?.fields
    .filter(field => field.required)
    .map(field => field.key) || []
}

export function getFieldsBySection(type: ContentType, section: keyof ContentTypeConfig['layout']['edit']['sections']): FieldConfig[] {
  const config = contentTypeConfigs[type]
  const fieldKeys = config?.layout.edit.sections[section] || []
  return fieldKeys.map(key => config.fields.find(field => field.key === key)).filter(Boolean) as FieldConfig[]
}

export function getViewFields(type: ContentType, section: keyof ContentTypeConfig['layout']['view']['sections']): FieldConfig[] {
  const config = contentTypeConfigs[type]
  const fieldKeys = config?.layout.view.sections[section] || []
  return fieldKeys.map(key => config.fields.find(field => field.key === key)).filter(Boolean) as FieldConfig[]
}