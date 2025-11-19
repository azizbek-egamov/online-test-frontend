"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { storageService, type User } from "@/lib/storage-service"
import { apiService, type ReadingMaterial, type UserResult } from "@/lib/api-service"
import { formatDateUz } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { RotateCcw, Home, Check, X } from "lucide-react"

function ResultsContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const materialId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [material, setMaterial] = useState<ReadingMaterial | null>(null)
  const [result, setResult] = useState<UserResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResult = async () => {
      try {
    const currentUser = storageService.getCurrentUser()
        if (!currentUser || !storageService.isAuthenticated()) {
      router.push("/login")
      return
    }

        // Profil ma'lumotlarini olish
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

        const materialIdNum = parseInt(materialId)
        if (isNaN(materialIdNum)) {
      router.push("/dashboard")
      return
    }

        // Material va natijani yuklash
        const materialData = await apiService.getReadingMaterialById(materialIdNum)
        setMaterial(materialData)
        
        // Natijani olish
        try {
          const resultData = await apiService.getTestResult(materialIdNum)
          setResult(resultData)
        } catch (err: any) {
          // Agar natija topilmasa (test hali ishlanmagan)
          setResult(null)
        }
        setIsLoading(false)
      } catch (err: any) {
        console.error("Result load error:", err)
        setError(err.message || "Natijani yuklashda xatolik")
        if (err.message?.includes('401') || err.message?.includes('token')) {
          storageService.logout()
          router.push("/login")
        } else {
          setIsLoading(false)
        }
      }
    }

    loadResult()
  }, [router, materialId])

  if (isLoading || !user || !material) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </main>
    )
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <Card className="border border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">
                {error || "Bu test hali ishlanmagan yoki natija topilmadi."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.push(`/test/${materialId}`)} variant="outline">
                  Testni boshlash
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  Dashboard'ga qaytish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const percentage = parseFloat(result.percentage.toString())
  const isPassed = percentage >= 60
  const score = result.correct_answers
  const total = result.total_questions

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
        {/* Score Card */}
        <Card
          className={`border-2 ${isPassed ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}`}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold">{percentage}%</div>
              <h2 className="text-2xl font-bold">
                {isPassed ? "Testni muvaffaqiyatli yakunladingiz!" : "Keyingi safar yanada yaxshi natija kutmoqda!"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {total} ta savoldan {score} tasiga to'g'ri javob berdingiz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-xs text-muted-foreground mt-1">To'g'ri</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{total - score}</div>
              <div className="text-xs text-muted-foreground mt-1">Noto'g'ri</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{percentage}%</div>
              <div className="text-xs text-muted-foreground mt-1">Foiz</div>
            </CardContent>
          </Card>
        </div>

        {/* Test Info */}
        <Card className="border border-border">
                  <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Test:</strong> {material.title}</p>
              <p><strong>Yakunlangan vaqti:</strong> {formatDateUz(result.finished_at)}</p>
                    </div>
                  </CardContent>
                </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-center pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 hover:bg-accent active:bg-accent/80 active:scale-[0.98] transition-all duration-200">
              <Home className="w-4 h-4" />
              Bosh sahifa
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
