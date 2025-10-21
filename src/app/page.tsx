import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Javis Auth Challenge</CardTitle>
          <CardDescription className="text-center">Welcome to the authentication challenge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/signin">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full" variant="outline">Register</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
