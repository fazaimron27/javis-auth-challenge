"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut } from "lucide-react"
// Adding cookie helper for client-side auth check
import Cookies from 'js-cookie'

/**
 * User data interface
 * Represents the structure of user data returned from the API
 */
interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

/**
 * Dashboard page component
 * Protected page that requires authentication
 * Displays user profile information and provides logout functionality
 */
export default function Dashboard() {
  const router = useRouter()

  // State management
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)

  /**
   * Authentication verification effect
   * Redirects to home page if user is not authenticated
   */
  useEffect(() => {
    // Skip if we've already checked
    if (authChecked) return;

    // Verify authentication via API call
    fetch('/api/auth/check', {
      credentials: 'include', // Include cookies in the request
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => {
        if (!res.ok) {
          router.replace('/')
        } else {
          // Mark authentication check as complete
          setAuthChecked(true)
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error)
        router.replace('/')
      })
  }, [router, authChecked])

  // Only fetch user data after auth check is complete
  useEffect(() => {
    // Skip fetching if auth hasn't been checked yet
    if (!authChecked) return;

    async function fetchUserData() {
      try {
        // Make the API request with credentials to include the httpOnly cookie
        const response = await fetch('/api/auth/me', {
          // Include credentials to ensure cookies are sent
          credentials: 'include',
          // Add cache control to prevent caching of this request
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        })

        if (!response.ok) {
          if (response.status === 401) {

            // If we've already tried a few times, redirect to login
            if (retryCount >= 2) {
              setTimeout(() => {
                router.push('/')
              }, 100)
              return
            }

            // Otherwise retry after a short delay
            setTimeout(() => {
              setRetryCount(prev => prev + 1)
            }, 1000)
            return
          }
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const data = await response.json()
        setUser(data.user)

        // We have user data, so set loading to false
        setIsLoading(false)
      } catch (err) {
        setError('Error loading user data')
        console.error('Error in fetchUserData:', err)

        // Set loading to false on error if we've tried enough times
        if (retryCount >= 2) {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()
  }, [router, retryCount, authChecked])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Clear the client-side auth state cookie if it exists
        Cookies.remove('auth_state', { path: '/' })

        // Clear user state before redirecting
        setUser(null)

        // Use a hard navigation for more reliable logout
        window.location.href = '/'
      } else {
        console.error('Logout failed with status:', response.status)
      }
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
          <Button onClick={() => router.push('/')}>
            Back to Login
          </Button>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Session expired or not authenticated.</p>
          <Button onClick={() => router.push('/')}>
            Back to Login
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Profile</h2>
            <p className="text-sm text-muted-foreground mb-4">Your account information</p>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Name:</span> {user.name || 'Not provided'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Activity</h2>
            <p className="text-sm text-muted-foreground mb-4">Your recent activity</p>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage your preferences</p>
            <Button variant="outline" size="sm">
              Edit Settings
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
