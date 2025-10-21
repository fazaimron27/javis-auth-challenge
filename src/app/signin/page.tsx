import { LoginForm } from "@/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Javis Auth Challenge",
  description: "Sign in to your account",
}

export default function SigninPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}