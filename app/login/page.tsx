"use client"

import { useState, type FormEvent } from "react"
import Head from "next/head" // Import Head
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/error-message"
import Link from "next/link"
import { LogIn } from "lucide-react"; // Import LogIn icon

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to login")
      }

      // Small delay to ensure cookie is set properly
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Force a complete page reload to ensure navbar updates
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - DStech</title>
        <meta name="description" content="Access your DStech account to manage your data science personal vault and storage." />
        <meta name="keywords" content="dstech, login, account, data science, personal vault" />
        <link rel="canonical" href="https://dstech.example.com/login" />
        <meta name="robots" content="noindex, nofollow" />
        {/* Open Graph */}
        <meta property="og:title" content="Login - DStech" />
        <meta property="og:description" content="Access your DStech account." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dstech.example.com/login" />
        <meta property="og:image" content="https://dstech.example.com/placeholder-og-image.jpg" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Login - DStech" />
        <meta name="twitter:description" content="Access your DStech account." />
        <meta name="twitter:image" content="https://dstech.example.com/placeholder-twitter-image.jpg" />
      </Head>
      <div className="flex items-center justify-center min-h-screen  dark:bg-gray-900 px-4 py-8">
        <Card className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-lg">
          <CardHeader className="text-center pt-8 pb-6"> {/* Added padding and centered */}
          <div className="flex justify-center mb-4">
            <LogIn className="h-12 w-12 text-primary" /> {/* Larger icon, primary color */}
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="text-md text-gray-600 dark:text-gray-400">Sign in to access your DStech account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={error} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your_name@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5 dark:before:border-gray-600 dark:after:border-gray-600">
              <p className="mx-4 mb-0 text-center font-semibold dark:text-gray-200">OR</p>
            </div>

            <a href="/api/auth/google" className="block w-full">
              <Button variant="outline" className="w-full" type="button">
                {/* Placeholder for Google Icon - <GIcon className="mr-2 h-4 w-4" /> */}
                Sign in with Google
              </Button>
            </a>

            <a href="/api/auth/github" className="block w-full mt-2"> {/* Added mt-2 for spacing */}
              <Button variant="outline" className="w-full" type="button">
                {/* Placeholder for GitHub Icon - <GitHubIcon className="mr-2 h-4 w-4" /> */}
                Sign in with GitHub
              </Button>
            </a>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6"> {/* Adjusted for better spacing */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Problems logging in? <Link href="/contact" className="hover:underline">Contact support</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
