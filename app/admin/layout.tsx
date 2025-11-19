"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type User } from "@/lib/storage-service"
import { apiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileQuestion, 
  BarChart3, 
  LogOut, 
  Home,
  Settings
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = storageService.getCurrentUser()
        if (!currentUser || !storageService.isAuthenticated()) {
          router.push("/login")
          return
        }

        const userProfile = await apiService.getProfile()
        const userData = {
          id: userProfile.id,
          username: userProfile.username,
          name: userProfile.first_name && userProfile.last_name
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : userProfile.username,
          email: userProfile.email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
        }
        setUser(userData)

        // Admin access tekshirish
        const adminCheck = await apiService.checkAdminAccess()
        if (!adminCheck.is_admin) {
          setAccessError("Sizda admin paneliga kirish ruxsati mavjud emas.")
          return
        }
        setIsAdmin(true)
      } catch (err: any) {
        console.error("Admin access error:", err)
        if (err?.message?.includes("401")) {
          setAccessError("Sessiya tugadi. Iltimos, qaytadan tizimga kiring.")
          storageService.logout()
        } else {
          setAccessError(err?.message || "Admin panelga kirishda xatolik yuz berdi.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-border rounded-xl bg-card p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">{accessError}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/login")} className="gap-2">
              Admin tizimga kirish
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/materials">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <BookOpen className="w-4 h-4" />
                O'quv materiallari
              </Button>
            </Link>
            <Link href="/admin/questions">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <FileQuestion className="w-4 h-4" />
                Savollar
              </Button>
            </Link>
            <Link href="/admin/results">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Natijalar
              </Button>
            </Link>
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {user.name}
            </div>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Home className="w-4 h-4" />
                Bosh sahifa
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

