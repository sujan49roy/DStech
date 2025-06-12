"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/error-message"
import Link from "next/link"
import { UserPlus } from "lucide-react"; // Import UserPlus icon

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.join(", "))
        }
        throw new Error(data.error || "Failed to register")
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
    <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 px-4 py-8">
      <Card className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-lg">
        <CardHeader className="text-center pt-8 pb-6"> {/* Added padding and centered */}
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" /> {/* Larger icon, primary color */}
          </div>
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription className="text-md text-gray-600 dark:text-gray-400">Join DStech to start organizing your knowledge.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage message={error} />
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
            </div>
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
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5 dark:before:border-gray-600 dark:after:border-gray-600">
              <p className="mx-4 mb-0 text-center font-semibold dark:text-gray-200">OR</p>
            </div>

            <a href="/api/auth/google" className="block w-full">
              <Button variant="outline" className="w-full">
                {/* Placeholder for Google Icon - <GIcon className="mr-2 h-4 w-4" /> */}
                Sign up with Google
              </Button>
            </a>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6"> {/* Adjusted for better spacing */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
             By registering, you agree to our <Link href="/terms" className="hover:underline">Terms of Service</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
