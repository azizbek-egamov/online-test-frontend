"use client"

import { useEffect, useState } from "react"
import { adminApiService, type UserResult, type ReadingMaterial } from "@/lib/api-service"
import { formatDateUz } from "@/lib/date-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BarChart3, User, BookOpen, TrendingUp } from "lucide-react"

export default function AdminResultsPage() {
  const [results, setResults] = useState<UserResult[]>([])
  const [materials, setMaterials] = useState<ReadingMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMaterial, setFilterMaterial] = useState<number | "">("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const pageSize = 20

  useEffect(() => {
    loadMaterials()
  }, [])

  useEffect(() => {
    loadResults()
  }, [filterMaterial, searchQuery, currentPage])

  const loadMaterials = async () => {
    try {
      const response = await adminApiService.adminGetReadingMaterials({ page_size: 200 })
      setMaterials(response.results)
    } catch (err) {
      console.error("Materials load error:", err)
    }
  }

  const loadResults = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterMaterial) params.reading_material = filterMaterial
      if (searchQuery) params.search = searchQuery
      params.page = currentPage

      const data = await adminApiService.adminGetResults(params)
      setResults(data.results)
      setTotalCount(data.count)
      setHasNextPage(Boolean(data.next))
      setHasPreviousPage(Boolean(data.previous))
      setError(null)
    } catch (err: any) {
      console.error("Results load error:", err)
      setError(err.message || "Natijalarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  const getMaterialTitle = (
    material: number | ReadingMaterial | UserResult["reading_material"] | null | undefined
  ) => {
    if (!material) {
      return "Material ma'lum emas"
    }

    if (typeof material === "number") {
      const found = materials.find((m) => m.id === material)
      return found?.title || `Material #${material}`
    }

    const title = material.title
    if (title) {
      return title
    }

    if ("id" in material && material.id) {
      const found = materials.find((m) => m.id === material.id)
      return found?.title || `Material #${material.id}`
    }

    return "Material ma'lum emas"
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  if (isLoading && results.length === 0) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test natijalari</h1>
        <p className="text-muted-foreground">Barcha foydalanuvchilar test natijalari</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Foydalanuvchi yoki material bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(1)
              }
            }}
            className="pl-10"
          />
        </div>
        <select
          value={filterMaterial}
          onChange={(e) => {
            setFilterMaterial(e.target.value ? parseInt(e.target.value) : "")
            setCurrentPage(1)
          }}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Barcha materiallar</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {result.user?.username || "Noma'lum"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {getMaterialTitle(result.reading_material)}
                      </span>
                    </div>
                  </div>
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      To'g'ri javoblar
                    </span>
                    <span className="text-lg font-semibold">
                      {result.correct_answers} / {result.total_questions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Foiz</span>
                    <span
                      className={`text-2xl font-bold ${getPercentageColor(
                        parseFloat(result.percentage.toString())
                      )}`}
                    >
                      {parseFloat(result.percentage.toString()).toFixed(1)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {formatDateUz(result.finished_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {results.length === 0 && !isLoading && (
        <Card>
      {totalCount > pageSize && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <p className="text-sm text-muted-foreground">
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
            {Math.min(currentPage * pageSize, totalCount)} / {totalCount} ta natija
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
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
              type="button"
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
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || filterMaterial
                ? "Hech qanday natija topilmadi"
                : "Hozircha natijalar yo'q"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

