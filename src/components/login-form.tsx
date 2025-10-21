"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

/**
 * Interface for form validation errors
 * Tracks error messages for each form field
 */
interface FormErrors {
  email?: string
  password?: string
  general?: string
}

/**
 * Login form component
 * Provides a user interface for authentication with email and password
 * Includes form validation, error handling, and success feedback
 */
export function LoginForm() {
  // Navigation hook
  const router = useRouter()

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Validates the form input fields
   * Checks email format and password requirements
   * 
   * @returns boolean indicating if the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Update error state
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setShowSuccess(false)
    setErrors({})

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Ensure cookies are sent with the request
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrors({
            general: "Too many login attempts. Please try again later.",
          });
        } else {
          setErrors({
            general: data.error || "Invalid email or password",
          });
        }
        return;
      }

      setShowSuccess(true);

      // The server will set httpOnly cookie automatically
      // We can check if the server indicated authentication was successful

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        try {
          // Refresh router data before redirecting
          router.refresh();

          // Verify authentication before redirecting
          fetch('/api/auth/check', {
            credentials: 'same-origin',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Authorization': `Bearer ${data.token || ''}` // Use token from login response
            }
          })
            .then(res => {
              if (res.ok) {
                // Use router.replace to completely replace the history entry
                router.replace("/dashboard");
              } else {
                // Force a hard navigation if the API check fails
                window.location.href = "/dashboard";
              }
            })
            .catch(err => {
              console.error('Auth verification error:', err);
              window.location.href = "/dashboard";
            });
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
          // Force a hard navigation if client-side navigation fails
          window.location.href = "/dashboard";
        }
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="border border-border shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">{errors.general}</AlertDescription>
              </Alert>
            )}

            {showSuccess && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Login successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined })
                  }
                }}
                className={`bg-input text-foreground placeholder:text-muted-foreground border ${errors.email ? "border-destructive" : "border-border"
                  }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined })
                    }
                  }}
                  className={`bg-input text-foreground placeholder:text-muted-foreground border pr-10 ${errors.password ? "border-destructive" : "border-border"
                    }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Need an account?</p>
              <p className="text-xs text-muted-foreground">
                <Link href="/signup" className="text-primary hover:underline">Create a new account</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">© 2025. All rights reserved.</p>
    </div>
  )
}
