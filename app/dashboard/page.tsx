"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type User } from "@/lib/storage-service"
import { apiService, type ReadingMaterial, type Category } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { BookOpen, Clock, FileText, Folder } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [materials, setMaterials] = useState<ReadingMaterial[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadDashboardData = async () => {
      try {
        // Authentication tekshirish
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

        // Kategoriyalarni yuklash
        const categoriesData = await apiService.getCategories()
        setCategories(categoriesData)

        // O'quv materiallarini API'dan olish
        const readingMaterials = await apiService.getReadingMaterials()
        // Array ekanligini tekshirish
        if (Array.isArray(readingMaterials)) {
          setMaterials(readingMaterials)
        } else {
          setMaterials([])
        }
      } catch (err: any) {
        console.error("Dashboard load error:", err)
        setError(err.message || "Ma'lumotlarni yuklashda xatolik")
        // Agar token eskirgan bo'lsa, login sahifasiga yo'naltirish
        if (err.message?.includes('401') || err.message?.includes('token')) {
          storageService.logout()
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router, mounted])

  if (!mounted || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={user || { id: 0, name: "User", email: "" }} />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <Card className="border border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Qayta urinib ko'rish
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Salom, {user.name}!</h1>
          <p className="text-muted-foreground">Bugungi testni tanlang va darhol boshlang.</p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Barchasi
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Folder className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Grouped by Categories */}
        {categories.length > 0 && selectedCategory === null ? (
          categories.map((category) => {
            const categoryMaterials = materials.filter(
              (m) => m.category?.id === category.id
            )
            if (categoryMaterials.length === 0) return null

            return (
              <div key={category.id} className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Folder className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({categoryMaterials.length} ta)
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryMaterials.map((material, idx) => (
                    <Link key={material.id} href={`/test/${material.id}`}>
                      <Card
                        className="border border-border hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] active:shadow-md transition-all duration-300 h-full cursor-pointer group animate-scale-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <CardContent className="p-6 space-y-4 h-full flex flex-col">
                          {/* Header */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                                  {material.title}
                                </h3>
                                {material.short_description && (
                                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                    {material.short_description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{material.questions_count} savol</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>~{Math.ceil(material.questions_count * 1.5)} min</span>
                            </div>
                          </div>

                          {/* Button */}
                          <Button
                            size="sm"
                            className="w-full h-9 text-sm mt-auto group-hover:shadow-md active:scale-[0.98] transition-all duration-200"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push(`/test/${material.id}`)
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Testni boshlash
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <>
            {/* Filtered Materials or All Materials */}
            {(() => {
              const filteredMaterials = selectedCategory
                ? materials.filter((m) => m.category?.id === selectedCategory)
                : materials

              return filteredMaterials.length === 0 ? (
                <Card className="border border-border">
                  <CardContent className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {selectedCategory
                        ? "Bu kategoriyada hali hech qanday test mavjud emas"
                        : "Hali hech qanday test mavjud emas"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map((material, idx) => (
              <Link key={material.id} href={`/test/${material.id}`}>
                <Card
                  className="border border-border hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] active:shadow-md transition-all duration-300 h-full cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardContent className="p-6 space-y-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {material.title}
                          </h3>
                          {material.short_description && (
                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                              {material.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{material.questions_count} savol</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{Math.ceil(material.questions_count * 1.5)} min</span>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      size="sm"
                      className="w-full h-9 text-sm mt-auto group-hover:shadow-md active:scale-[0.98] transition-all duration-200"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/test/${material.id}`)
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Testni boshlash
                    </Button>
                  </CardContent>
                </Card>
                    </Link>
                  ))}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </main>
  )
}
