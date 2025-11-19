"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type User } from "@/lib/storage-service"
import { apiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { LogOut, UserIcon, BookOpen } from "lucide-react"

export default function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      storageService.logout()
      router.push("/")
    }
  }

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between animate-fade-in">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold hidden sm:inline">ReadMaster</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm hidden sm:flex">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium truncate">{user.name}</span>
          </div>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-[0.98] transition-all duration-200"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profil</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 active:scale-[0.98] transition-all duration-200">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
