"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { User, Trash2, FileText, Bell, Palette, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setName(userData.name)
          setEmail(userData.email)
        } else {
          setError("Failed to load user data")
        }
      } catch (err) {
        setError("Error fetching user data")
      }
    }
    fetchUser()
  }, [])

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })
      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
      } else {
        setError("Failed to update profile")
      }
    } catch (err) {
      setError("Error updating profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/delete", {
        method: "DELETE",
      })
      if (response.ok) {
        router.push("/login")
        router.refresh()
      } else {
        setError("Failed to delete account")
      }
    } catch (err) {
      setError("Error deleting account")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle theme change
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value)
    // Apply theme to document (sync with ThemeProvider)
    document.documentElement.classList.remove("light", "dark")
    if (value === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.classList.add(systemTheme)
    } else {
      document.documentElement.classList.add(value)
    }
    localStorage.setItem("theme", value)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="h-8 w-8" />
        Settings
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Enable email notifications</Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(["light", "dark", "system"] as const).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={option}
                  name="theme"
                  value={option}
                  checked={theme === option}
                  onChange={() => handleThemeChange(option)}
                  className="h-4 w-4"
                />
                <Label htmlFor={option} className="capitalize">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* License Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            License
          </CardTitle>
          <CardDescription>View licensing information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            DStech is licensed under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions outlined in the license.
          </p>
          <Button variant="link" className="mt-2 p-0" onClick={() => window.open("https://opensource.org/licenses/MIT", "_blank")}>
            View Full License
          </Button>
        </CardContent>
      </Card>

      {/* Terms of Agreement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms of Agreement
          </CardTitle>
          <CardDescription>Read our terms of service</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By using DStech, you agree to our Terms of Service, which govern your access to and use of the platform. These terms include policies on data privacy, content ownership, and user conduct.
          </p>
          <Button variant="link" className="mt-2 p-0" onClick={() => window.open("/terms", "_blank")}>
            Read Full Terms
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account and data</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Deleting your account will permanently remove all your data, including profile information, content, and settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isLoading}>
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}