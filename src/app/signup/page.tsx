import { SignupForm } from "@/components/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register - Javis Auth Challenge",
  description: "Create a new account",
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignupForm />
    </main>
  )
}