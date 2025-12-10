"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type User } from "@/lib/storage-service"
import { apiService, type UserResult, type StatisticsResponse } from "@/lib/api-service"
import { formatDateUz } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardHeader from "@/components/dashboard-header"
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Edit2, 
  Save, 
  X,
  BarChart3,
  Target,
  CheckCircle2
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<UserResult[]>([])
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Authentication tekshirish
        const currentUser = storageService.getCurrentUser()
        if (!currentUser || !storageService.isAuthenticated()) {
          router.push("/login")
          return
        }

        // Profil ma'lumotlarini API'dan olish
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

        // Natijalarni va statistikani API'dan olish
        const [userResults, userStats] = await Promise.all([
          apiService.getMyResults(),
          apiService.getStatistics()
        ])
        setResults(userResults)
        setStatistics(userStats)
        
        // Edit form'ni to'ldirish
        setEditForm({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
        })
      } catch (err: any) {
        console.error("Profile load error:", err)
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

    loadProfileData()
  }, [router])

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <Card className="border border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-4"
                variant="outline"
              >
                Bosh sahifaga qaytish
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "text-green-600 bg-green-50 border-green-200" }
    if (percentage >= 80) return { grade: "B", color: "text-blue-600 bg-blue-50 border-blue-200" }
    if (percentage >= 70) return { grade: "C", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
    if (percentage >= 60) return { grade: "D", color: "text-orange-600 bg-orange-50 border-orange-200" }
    return { grade: "F", color: "text-red-600 bg-red-50 border-red-200" }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedUser = await apiService.updateProfile({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      })
      const userData = {
        id: updatedUser.id,
        username: updatedUser.username,
        name:
          updatedUser.first_name && updatedUser.last_name
            ? `${updatedUser.first_name} ${updatedUser.last_name}`
            : updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
      }
      setUser(userData)
      storageService.setCurrentUser(userData)
      setEditForm({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
      })
      setIsEditing(false)
    } catch (err: any) {
      alert(err.message || "Profilni yangilashda xatolik")
    } finally {
      setIsSaving(false)
    }
  }

  const avgScore = statistics?.average_percentage || 0

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8 animate-fade-in">
        {/* Profile Header */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Profil ma'lumotlari</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                    Bekor
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ism</label>
                {isEditing ? (
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    placeholder="Ismingiz"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {user.first_name || "Kiritilmagan"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Familiya</label>
                {isEditing ? (
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    placeholder="Familiyangiz"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {user.last_name || "Kiritilmagan"}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Email</label>
                <p className="text-sm text-muted-foreground py-2">{user.email}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Username</label>
                <p className="text-sm text-muted-foreground py-2">{user.username || user.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Jami testlar</p>
                    <p className="text-2xl font-bold">{statistics.total_tests}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">O'rtacha foiz</p>
                    <p className={`text-2xl font-bold ${getPercentageColor(avgScore)}`}>
                      {avgScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {statistics.best_result && (
              <Card className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Eng yaxshi natija</p>
                      <p className="text-2xl font-bold text-green-600">
                        {parseFloat(statistics.best_result.percentage.toString()).toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Muvaffaqiyatli</p>
                    <p className="text-2xl font-bold text-green-600">
                      {results.filter(r => parseFloat(r.percentage.toString()) >= 60).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test History */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Test tarixi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <p className="text-lg text-muted-foreground">Hali hech qanday test tamomlangan emas</p>
                <Link href="/dashboard">
                  <Button variant="outline" className="mt-4">
                    Testni boshlash
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, idx) => {
                  const percentage = parseFloat(result.percentage.toString())
                  const gradeInfo = getGrade(percentage)
                  const isPassed = percentage >= 60

                  return (
                    <Link 
                      key={result.id} 
                      href={`/results/${result.reading_material.id}`}
                    >
                      <Card
                        className={`border cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 animate-slide-up ${
                          isPassed 
                            ? "border-green-200/50 hover:border-green-300 bg-green-50/30" 
                            : "border-border hover:border-primary/30 bg-background"
                        }`}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold truncate">{result.reading_material.title}</h4>
                                {isPassed && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                <span>{formatDateUz(result.finished_at)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-bold">
                                  {result.correct_answers}/{result.total_questions}
                                </div>
                                <div className={`text-xs font-medium ${getPercentageColor(percentage)}`}>
                                  {percentage.toFixed(1)}%
                                </div>
                              </div>
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border-2 ${gradeInfo.color}`}
                              >
                                {gradeInfo.grade}
                              </div>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isPassed ? "bg-green-500" : "bg-yellow-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back */}
        <div className="flex justify-center">
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
