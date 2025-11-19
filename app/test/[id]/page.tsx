"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { storageService, type User } from "@/lib/storage-service"
import { apiService, type ReadingMaterial, type Question } from "@/lib/api-service"
import DashboardHeader from "@/components/dashboard-header"
import TestReaderComponent from "@/components/test-reader"
import TestQuestionsComponent from "@/components/test-questions"

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const materialId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [material, setMaterial] = useState<ReadingMaterial | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stage, setStage] = useState<"reading" | "questions">("reading")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTest = async () => {
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

        // Material va savollarni yuklash
        const materialIdNum = parseInt(materialId)
        if (isNaN(materialIdNum)) {
      router.push("/dashboard")
      return
    }

        // Material detail ma'lumotlarini olish (savollar bilan)
        const materialData = await apiService.getReadingMaterialById(materialIdNum)
        
        // Questions maydoni mavjud bo'lsa
        if (materialData.questions && Array.isArray(materialData.questions)) {
          setQuestions(materialData.questions)
        } else {
          // Agar questions yo'q bo'lsa, alohida yuklash
          setQuestions([])
        }

        setMaterial(materialData)
        setIsLoading(false)
      } catch (err: any) {
        console.error("Test load error:", err)
        setError(err.message || "Testni yuklashda xatolik")
        if (err.message?.includes('401') || err.message?.includes('token')) {
          storageService.logout()
          router.push("/login")
        } else {
    setIsLoading(false)
        }
      }
    }

    loadTest()
  }, [router, materialId])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </main>
    )
  }

  if (error || !user || !material) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={user || { id: 0, name: "User", email: "" }} />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Test topilmadi"}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-primary hover:underline"
            >
              Dashboard'ga qaytish
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      {stage === "reading" ? (
        <TestReaderComponent 
          material={material} 
          onContinue={() => setStage("questions")} 
        />
      ) : (
        <TestQuestionsComponent 
          material={material}
          questions={questions}
          user={user} 
          answers={answers} 
          setAnswers={setAnswers}
          onComplete={() => router.push(`/results/${material.id}`)}
        />
      )}
    </main>
  )
}
