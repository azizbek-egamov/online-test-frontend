"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService } from "@/lib/storage-service"
import { adminApiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, LockKeyhole, BookOpen } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (storageService.isAdminAuthenticated()) {
      router.replace("/admin")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!username || !password) {
        throw new Error("Foydalanuvchi nomi va parolni kiriting")
      }

      await adminApiService.login({ username, password })
      const profile = await adminApiService.getProfile()

      if (!profile) {
        throw new Error("Profil ma'lumotlarini olishda xatolik")
      }

      const adminUser = {
        id: profile.id,
        username: profile.username,
        name: profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      }

      storageService.setAdminUser(adminUser)
      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Admin tizimga kirishda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border border-border shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Admin tizimiga kirish</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ushbu bo'lim faqat administratorlar uchun mo'ljallangan.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin foydalanuvchi nomi</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parol</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2">
              <LockKeyhole className="w-4 h-4" />
              {isLoading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-muted-foreground">
              Oddiy foydalanuvchimisiz?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Foydalanuvchi login
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Bosh sahifaga qaytish
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}


