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
 * Interface for signup form validation errors
 * Tracks error messages for each form field
 */
interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

/**
 * Signup form component
 * Provides user interface for new account registration
 * Features client-side validation, password strength requirements,
 * and confirmation password matching
 */
export function SignupForm() {
  // Navigation hook
  const router = useRouter()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /**
   * Validates the signup form fields
   * Checks name format (if provided), email format, password requirements,
   * and ensures passwords match
   * 
   * @returns boolean indicating if the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation is optional, but we'll check if provided
    if (name.trim() !== "" && name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation with regex pattern
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Ensure cookies are sent with the request
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({
            email: "A user with this email already exists",
          });
        } else {
          setErrors({
            general: data.error || "Failed to create account",
          });
        }
        return;
      }

      setShowSuccess(true);

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
              'Pragma': 'no-cache'
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
      console.error('Signup error:', error);
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
          <CardTitle className="text-2xl font-bold text-foreground">Create an Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
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
                  Account created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name (Optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined })
                  }
                }}
                className={`bg-input text-foreground placeholder:text-muted-foreground border ${errors.name ? "border-destructive" : "border-border"
                  }`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined })
                    }
                  }}
                  className={`bg-input text-foreground placeholder:text-muted-foreground border pr-10 ${errors.confirmPassword ? "border-destructive" : "border-border"
                    }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Already have an account?</p>
              <p className="text-xs text-muted-foreground">
                <Link href="/signin" className="text-primary hover:underline">Sign in to your account</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">© 2025. All rights reserved.</p>
    </div>
  )
}