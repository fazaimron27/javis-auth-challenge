import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard - Javis Auth Challenge",
    description: "Your account dashboard",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}