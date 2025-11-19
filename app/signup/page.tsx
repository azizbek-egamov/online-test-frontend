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
import { UserPlus, BookOpen } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, /dashboard ga yo'naltiramiz
  useEffect(() => {
    if (storageService.isAuthenticated()) {
      router.replace("/dashboard")
    }
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!username || !email || !password || !confirmPassword) {
        throw new Error(uz.errorEmptyFields || "Barcha maydonlarni to'ldiring")
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(uz.errorInvalidEmail || "Noto'g'ri email formati")
      }

      if (password !== confirmPassword) {
        throw new Error(uz.errorPasswordMismatch || "Parollar mos kelmaydi")
      }

      if (password.length < 8) {
        throw new Error("Parol kamida 8 belgidan iborat bo'lishi kerak")
      }

      // API orqali ro'yxatdan o'tish
      const response = await apiService.register({
        username,
        email,
        password,
        password_confirm: confirmPassword,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      })

      // Avtomatik login qilish
      const tokens = await apiService.login({ username, password })
      storageService.setTokens(tokens.access, tokens.refresh)

      // User ma'lumotlarini formatlash
      const user = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.first_name && response.user.last_name
          ? `${response.user.first_name} ${response.user.last_name}`
          : response.user.username,
        email: response.user.email,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
      }

      storageService.setCurrentUser(user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tish xatosi")
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
            <CardTitle className="text-2xl">{uz.signup}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Foydalanuvchi nomi *</label>
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
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ism</label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ism"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Familiya</label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Familiya"
                  className="h-10 text-sm"
                />
              </div>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">{uz.confirmPassword}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <UserPlus className="w-4 h-4" />
              {isLoading ? "Kutilmoqda..." : uz.signupBtn}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-muted-foreground">
              Allaqachon roʻyxatdan oʻtgansiz?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline active:text-primary/80 transition-colors duration-200">
                {uz.login}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
