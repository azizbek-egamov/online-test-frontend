"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { adminApiService, type UserResponse, type UserResult } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDateUz } from "@/lib/date-utils"
import { ArrowLeft, Mail, UserCircle2, BookOpen, BarChart3, Percent } from "lucide-react"

export default function AdminUserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userIdParam = params?.id
  const userId = parseInt(Array.isArray(userIdParam) ? userIdParam[0] : userIdParam ?? "", 10)

  const [user, setUser] = useState<UserResponse | null>(null)
  const [results, setResults] = useState<UserResult[]>([])
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [isResultsLoading, setIsResultsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const pageSize = 20

  useEffect(() => {
    if (!userId) {
      setError("Foydalanuvchi topilmadi.")
      setIsUserLoading(false)
      setIsResultsLoading(false)
      return
    }

    const loadUser = async () => {
      try {
        const data = await adminApiService.adminGetUser(userId)
        setUser(data)
        setError(null)
      } catch (err: any) {
        console.error("Admin user load error:", err)
        setError(err.message || "Foydalanuvchini yuklashda xatolik")
      } finally {
        setIsUserLoading(false)
      }
    }

    loadUser()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const loadResults = async () => {
      try {
        setIsResultsLoading(true)
        const data = await adminApiService.adminGetUserResults(userId, { page: currentPage })
        setResults(data.results || [])
        setTotalCount(data.count || 0)
        setHasNextPage(Boolean(data.next))
        setHasPreviousPage(Boolean(data.previous))
        setResultsError(null)
      } catch (err: any) {
        console.error("Admin user results load error:", err)
        setResultsError(err.message || "Foydalanuvchi natijalarini yuklashda xatolik")
      } finally {
        setIsResultsLoading(false)
      }
    }

    loadResults()
  }, [userId, currentPage])

  if (!userId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            Foydalanuvchi identifikatori noto'g'ri.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isUserLoading) {
    return (
      <div className="p-8 text-muted-foreground">
        Yuklanmoqda...
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <Card className="border border-red-200">
          <CardContent className="p-6 space-y-4 text-center">
            <p className="text-red-600">{error || "Foydalanuvchi topilmadi."}</p>
            <Button variant="outline" onClick={() => router.push("/admin/users")}>
              Foydalanuvchilar ro'yxatiga qaytish
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = (user.first_name || user.last_name)
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : "Ism kiritilmagan"

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
          <p className="text-muted-foreground">Foydalanuvchi profili va test natijalari</p>
        </div>
        <Link href="/admin/users">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-primary" />
            Foydalanuvchi ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Foydalanuvchi nomi</p>
            <p className="font-semibold">{user.username}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">To'liq ism</p>
            <p className="font-semibold">{fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="flex items-center gap-2 font-semibold">
              <Mail className="w-4 h-4 text-primary" />
              {user.email || "Email kiritilmagan"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Test natijalari</CardTitle>
            <p className="text-sm text-muted-foreground">
              Foydalanuvchi ishlagan barcha testlar ({totalCount})
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resultsError && (
            <div className="text-red-600 text-sm">{resultsError}</div>
          )}

          {isResultsLoading && results.length === 0 ? (
            <div className="text-muted-foreground">Natijalar yuklanmoqda...</div>
          ) : results.length === 0 ? (
            <div className="text-muted-foreground">Bu foydalanuvchi hali test ishlamagan.</div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="border border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {result.reading_material?.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateUz(result.finished_at)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span>{result.correct_answers} / {result.total_questions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-primary" />
                        <span>{parseFloat(result.percentage.toString()).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalCount > pageSize && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
                {Math.min(currentPage * pageSize, totalCount)} / {totalCount} ta natija
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!hasPreviousPage}
                >
                  Oldingi
                </Button>
                <span className="text-sm">
                  {currentPage} / {Math.max(1, Math.ceil(totalCount / pageSize))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasNextPage}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


