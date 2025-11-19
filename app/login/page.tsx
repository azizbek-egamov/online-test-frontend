"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { uz } from "@/lib/i18n"
import { storageService } from "@/lib/storage-service"
import { apiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, BookOpen } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, /dashboard ga yo'naltiramiz
  useEffect(() => {
    if (storageService.isAuthenticated()) {
      router.replace("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!username || !password) {
        throw new Error(uz.errorEmptyFields || "Barcha maydonlarni to'ldiring")
      }

      // API orqali login qilish
      const tokens = await apiService.login({ username, password })
      
      // Tokenlarni saqlash
      storageService.setTokens(tokens.access, tokens.refresh)
      
      // Profil ma'lumotlarini olish
      const userProfile = await apiService.getProfile()
      
      // User ma'lumotlarini formatlash
      const user = {
        id: userProfile.id,
        username: userProfile.username,
        name: userProfile.first_name && userProfile.last_name 
          ? `${userProfile.first_name} ${userProfile.last_name}` 
          : userProfile.username,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
      }
      
      storageService.setCurrentUser(user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login xatosi. Foydalanuvchi nomi yoki parol noto'g'ri.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="space-y-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{uz.login}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Foydalanuvchi nomi</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{uz.password}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium animate-slide-up">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-10 gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <LogIn className="w-4 h-4" />
              {isLoading ? "Kutilmoqda..." : uz.loginBtn}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-muted-foreground">
              Hisobingiz yo'qmi?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline active:text-primary/80 transition-colors duration-200">
                {uz.signup}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
