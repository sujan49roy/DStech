# DStech - Personal Knowledge Base

A full-stack web application for data scientists and developers to manage their personal knowledge base. DStech supports uploading, viewing, and managing six types of content: Blogs, Code Snippets, Datasets, Projects, Books, and Files.

## Features

- Full CRUD operations for all content types
- Search functionality across title, description, and content
- File upload capability with Vercel Blob
- Responsive design with dark/light mode support
- MongoDB integration for data storage

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB
- **Storage**: Vercel Blob for file uploads
- **Deployment**: Vercel

## Deployment

### Prerequisites

1. A MongoDB database (e.g., MongoDB Atlas)
2. A Vercel account
3. Vercel Blob storage set up

### Environment Variables

The following environment variables are required:

- `MONGODB_URI`: Your MongoDB connection string
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token for file uploads

### Deploy to Vercel

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Add the required environment variables in the Vercel dashboard
4. Deploy!

## Local Development

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env.local` file with the required environment variables
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT
\`\`\`

Let's also update the package.json to ensure all dependencies are correctly specified:
