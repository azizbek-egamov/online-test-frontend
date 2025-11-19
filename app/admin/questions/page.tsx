"use client"

import { useEffect, useState } from "react"
import { apiService, type Question, type ReadingMaterial } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileQuestion,
  BookOpen,
} from "lucide-react"

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [materials, setMaterials] = useState<ReadingMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMaterial, setFilterMaterial] = useState<number | "">("")
  const [filterType, setFilterType] = useState<string>("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    reading_material: "",
    question_type: "multiple_choice" as "multiple_choice" | "written",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
    correct_answer: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const pageSize = 20

  useEffect(() => {
    loadMaterials()
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [filterMaterial, filterType, searchQuery, currentPage])

  const loadMaterials = async () => {
    try {
      const response = await apiService.adminGetReadingMaterials({ page_size: 200 })
      setMaterials(response.results)
    } catch (err) {
      console.error("Materials load error:", err)
    }
  }

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterMaterial) params.reading_material = filterMaterial
      if (filterType) params.question_type = filterType
      if (searchQuery) params.search = searchQuery
      params.page = currentPage

      const data = await apiService.adminGetQuestions(params)
      setQuestions(data.results)
      setTotalCount(data.count)
      setHasNextPage(Boolean(data.next))
      setHasPreviousPage(Boolean(data.previous))
      setError(null)
    } catch (err: any) {
      console.error("Questions load error:", err)
      setError(err.message || "Savollarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setActionError(null)
    setFormData({
      reading_material: "",
      question_type: "multiple_choice",
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      correct_answer: "",
    })
    setEditingQuestion(null)
    setShowCreateForm(true)
  }

  const handleEdit = (question: Question) => {
    setActionError(null)
    setFormData({
      reading_material: question.reading_material.toString(),
      question_type: question.question_type,
      question_text: question.question_text,
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_option: question.correct_option || "",
      correct_answer: question.correct_answer || "",
    })
    setEditingQuestion(question)
    setShowCreateForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu savolni o'chirishni xohlaysizmi?")) {
      return
    }

    try {
      setDeletingId(id)
      await apiService.adminDeleteQuestion(id)
      await loadQuestions()
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setIsSubmitting(true)
    try {
      const submitData: any = {
        reading_material: parseInt(formData.reading_material),
        question_type: formData.question_type,
        question_text: formData.question_text,
      }

      if (formData.question_type === "multiple_choice") {
        submitData.option_a = formData.option_a
        submitData.option_b = formData.option_b
        submitData.option_c = formData.option_c
        submitData.option_d = formData.option_d
        submitData.correct_option = formData.correct_option
      } else {
        submitData.correct_answer = formData.correct_answer
      }

      if (editingQuestion) {
        await apiService.adminUpdateQuestion(editingQuestion.id, submitData)
      } else {
        await apiService.adminCreateQuestion(submitData)
      }
      setShowCreateForm(false)
      setEditingQuestion(null)
      await loadQuestions()
    } catch (err: any) {
      setActionError(err.message || "Saqlashda xatolik")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMaterialTitle = (materialId: number) => {
    const material = materials.find((m) => m.id === materialId)
    return material?.title || `Material #${materialId}`
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Savollar</h1>
          <p className="text-muted-foreground">Savollarni boshqarish</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi savol
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
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
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setCurrentPage(1)
          }}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Barcha turlar</option>
          <option value="multiple_choice">Ko'p tanlovli</option>
          <option value="written">Yozma</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {actionError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {actionError}
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  O'quv materiali
                </label>
                <select
                  value={formData.reading_material}
                  onChange={(e) =>
                    setFormData({ ...formData, reading_material: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Tanlang...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Savol turi</label>
                <select
                  value={formData.question_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      question_type: e.target.value as "multiple_choice" | "written",
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="multiple_choice">Ko'p tanlovli</option>
                  <option value="written">Yozma</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Savol matni</label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
              </div>

              {formData.question_type === "multiple_choice" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">A variant</label>
                      <Input
                        value={formData.option_a}
                        onChange={(e) =>
                          setFormData({ ...formData, option_a: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">B variant</label>
                      <Input
                        value={formData.option_b}
                        onChange={(e) =>
                          setFormData({ ...formData, option_b: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">C variant</label>
                      <Input
                        value={formData.option_c}
                        onChange={(e) =>
                          setFormData({ ...formData, option_c: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">D variant</label>
                      <Input
                        value={formData.option_d}
                        onChange={(e) =>
                          setFormData({ ...formData, option_d: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      To'g'ri javob (A, B, C yoki D)
                    </label>
                    <select
                      value={formData.correct_option}
                      onChange={(e) =>
                        setFormData({ ...formData, correct_option: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Tanlang...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    To'g'ri javob
                  </label>
                  <Input
                    value={formData.correct_answer}
                    onChange={(e) =>
                      setFormData({ ...formData, correct_answer: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saqlanmoqda..."
                    : editingQuestion
                      ? "Yangilash"
                      : "Yaratish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingQuestion(null)
                    setActionError(null)
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {question.question_text}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{getMaterialTitle(question.reading_material)}</span>
                    </div>
                    <span className="px-2 py-1 bg-muted rounded">
                      {question.question_type === "multiple_choice"
                        ? "Ko'p tanlovli"
                        : "Yozma"}
                    </span>
                  </div>
                </div>
                <FileQuestion className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {question.question_type === "multiple_choice" ? (
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">A:</span> {question.option_a}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">B:</span> {question.option_b}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">C:</span> {question.option_c}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">D:</span> {question.option_d}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    To'g'ri javob: {question.correct_option}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-sm font-medium text-green-600">
                    To'g'ri javob: {question.correct_answer}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(question)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Tahrirlash
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                  disabled={deletingId === question.id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalCount > pageSize && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <p className="text-sm text-muted-foreground">
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
            {Math.min(currentPage * pageSize, totalCount)} / {totalCount} ta savol
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

      {questions.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || filterMaterial || filterType
                ? "Hech qanday savol topilmadi"
                : "Hozircha savollar yo'q"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

