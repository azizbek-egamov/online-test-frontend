"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { adminApiService, type ReadingMaterial, type Category } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen,
  FileQuestion,
  X,
  Folder
} from "lucide-react"
import { getMediaUrl } from "@/lib/utils"

interface QuestionFormData {
  id?: number
  question_type: 'multiple_choice' | 'written'
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  correct_answer: string
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<ReadingMaterial[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<ReadingMaterial | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    content: "",
    category_id: "",
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [audioPreviewObjectUrl, setAudioPreviewObjectUrl] = useState<string | null>(null)
  const [audioRemoveRequested, setAudioRemoveRequested] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      question_type: 'multiple_choice',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: '',
      correct_answer: '',
    }
  ])
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([])

  const pageSize = 20

  useEffect(() => {
    return () => {
      if (audioPreviewObjectUrl) {
        URL.revokeObjectURL(audioPreviewObjectUrl)
      }
    }
  }, [audioPreviewObjectUrl])

  useEffect(() => {
    loadCategories()
    loadMaterials()
  }, [searchQuery, currentPage])

  const loadCategories = async () => {
    try {
      const data = await adminApiService.adminGetCategories({ page_size: 200 })
      setCategories(data.results)
    } catch (err) {
      console.error("Categories load error:", err)
    }
  }

  const loadMaterials = async () => {
    try {
      setIsLoading(true)
      const data = await adminApiService.adminGetReadingMaterials({
        page: currentPage,
        search: searchQuery || undefined,
      })
      setMaterials(data.results)
      setTotalCount(data.count)
      setHasNextPage(Boolean(data.next))
      setHasPreviousPage(Boolean(data.previous))
      setError(null)
    } catch (err: any) {
      console.error("Materials load error:", err)
      setError(err.message || "Materiallarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  const resetAudioState = () => {
    if (audioPreviewObjectUrl) {
      URL.revokeObjectURL(audioPreviewObjectUrl)
    }
    setAudioFile(null)
    setAudioPreview(null)
    setAudioPreviewObjectUrl(null)
    setAudioRemoveRequested(false)
  }

  const handleCreate = () => {
    setActionError(null)
    setFormData({ title: "", short_description: "", content: "", category_id: "" })
    setQuestions([{
      question_type: 'multiple_choice',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: '',
      correct_answer: '',
    }])
    setDeletedQuestionIds([])
    resetAudioState()
    setEditingMaterial(null)
    setShowCreateForm(true)
  }

  const handleEdit = async (material: ReadingMaterial) => {
    setActionError(null)
    setFormData({
      title: material.title,
      short_description: material.short_description || "",
      content: material.content,
      category_id: material.category?.id?.toString() || "",
    })
    setEditingMaterial(material)
    setDeletedQuestionIds([])
    resetAudioState()
    setAudioPreview(material.audio ? getMediaUrl(material.audio) : null)
    
    // Material savollarini yuklash
    try {
      const materialQuestionsResponse = await adminApiService.adminGetQuestions({ 
        reading_material: material.id,
        page_size: 200,
      })
      const materialQuestions = materialQuestionsResponse.results
      if (materialQuestions.length > 0) {
        setQuestions(materialQuestions.map(q => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_option: q.correct_option || '',
          correct_answer: q.correct_answer || '',
        })))
      } else {
        setQuestions([{
          question_type: 'multiple_choice',
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: '',
          correct_answer: '',
        }])
      }
    } catch (err) {
      console.error("Questions load error:", err)
      setQuestions([{
        question_type: 'multiple_choice',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: '',
        correct_answer: '',
      }])
    }
    
    setShowCreateForm(true)
  }

  const addQuestion = () => {
    setQuestions([...questions, {
      question_type: 'multiple_choice',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: '',
      correct_answer: '',
    }])
  }

  const removeQuestion = (index: number) => {
    const question = questions[index]
    // Agar mavjud savol bo'lsa (id bor), o'chirilganlar ro'yxatiga qo'shish
    if (question.id) {
      setDeletedQuestionIds([...deletedQuestionIds, question.id])
    }
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof QuestionFormData, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu materialni o'chirishni xohlaysizmi?")) {
      return
    }

    try {
      setDeletingId(id)
      await adminApiService.adminDeleteReadingMaterial(id)
      await loadMaterials()
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik")
    } finally {
      setDeletingId(null)
    }
  }

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (audioPreviewObjectUrl) {
      URL.revokeObjectURL(audioPreviewObjectUrl)
      setAudioPreviewObjectUrl(null)
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setAudioFile(file)
      setAudioPreview(objectUrl)
      setAudioPreviewObjectUrl(objectUrl)
      setAudioRemoveRequested(false)
    } else {
      setAudioFile(null)
      if (editingMaterial?.audio) {
        setAudioPreview(getMediaUrl(editingMaterial.audio))
      } else {
        setAudioPreview(null)
      }
    }
  }

  const handleRemoveAudio = () => {
    if (audioPreviewObjectUrl) {
      URL.revokeObjectURL(audioPreviewObjectUrl)
      setAudioPreviewObjectUrl(null)
    }
    setAudioFile(null)
    setAudioPreview(null)
    setAudioRemoveRequested(true)
  }

  const buildMaterialPayload = () => {
    const payload = new FormData()
    payload.append('title', formData.title)
    payload.append('short_description', formData.short_description || '')
    payload.append('content', formData.content)
    if (formData.category_id) {
      payload.append('category_id', formData.category_id)
    }
    if (audioFile) {
      payload.append('audio', audioFile)
    } else if (audioRemoveRequested) {
      payload.append('audio', '')
    }
    return payload
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setIsSubmittingForm(true)
    try {
      let materialId: number
      const payload = buildMaterialPayload()
      
      if (editingMaterial) {
        await adminApiService.adminUpdateReadingMaterial(editingMaterial.id, payload)
        materialId = editingMaterial.id
      } else {
        const newMaterial = await adminApiService.adminCreateReadingMaterial(payload)
        materialId = newMaterial.id
      }

      // O'chirilgan savollarni o'chirish
      for (const questionId of deletedQuestionIds) {
        try {
          await adminApiService.adminDeleteQuestion(questionId)
        } catch (err) {
          console.error("Question delete error:", err)
        }
      }

      // Savollarni saqlash
      for (const question of questions) {
        const questionData: any = {
          reading_material: materialId,
          question_type: question.question_type,
          question_text: question.question_text,
        }

        if (question.question_type === 'multiple_choice') {
          questionData.option_a = question.option_a
          questionData.option_b = question.option_b
          questionData.option_c = question.option_c
          questionData.option_d = question.option_d
          questionData.correct_option = question.correct_option
        } else {
          questionData.correct_answer = question.correct_answer
        }

        if (question.id) {
          // Mavjud savolni yangilash
          await adminApiService.adminUpdateQuestion(question.id, questionData)
        } else {
          // Yangi savol yaratish
          await adminApiService.adminCreateQuestion(questionData)
        }
      }

      setShowCreateForm(false)
      setEditingMaterial(null)
      setFormData({ title: "", short_description: "", content: "", category_id: "" })
      resetAudioState()
      setQuestions([{
        question_type: 'multiple_choice',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: '',
        correct_answer: '',
      }])
      setDeletedQuestionIds([])
      await loadMaterials()
    } catch (err: any) {
      setActionError(err.message || "Saqlashda xatolik")
    } finally {
      setIsSubmittingForm(false)
    }
  }

  if (isLoading && materials.length === 0) {
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
          <h1 className="text-3xl font-bold mb-2">O'quv materiallari</h1>
          <p className="text-muted-foreground">Materiallarni boshqarish</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi material
        </Button>
      </div>

      {/* Search and Category Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative max-w-md flex-1">
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
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
                setCurrentPage(1)
              }}
            >
              Barchasi
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id)
                  setCurrentPage(1)
                }}
              >
                <Folder className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingMaterial ? "Materialni tahrirlash" : "Yangi material"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {actionError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {actionError}
                </div>
              )}
              {/* Material Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Material ma'lumotlari</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">Kategoriya</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Kategoriya tanlang...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sarlavha</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Qisqacha ma'lumot
                  </label>
                  <Input
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        short_description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mazmun</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                    rows={10}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Audio fayl (ixtiyoriy)
                  </label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                  />
                  {audioPreview ? (
                    <div className="mt-3 p-3 border border-border rounded-lg space-y-3">
                      <audio controls src={audioPreview} className="w-full" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Audio yuklangan.</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={handleRemoveAudio}
                        >
                          Audioni o'chirish
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Audio fayl yuklanmagan.
                    </p>
                  )}
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">Savollar</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    disabled={isSubmittingForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Savol qo'shish
                  </Button>
                </div>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Savol #{index + 1}
                          </CardTitle>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Savol turi
                          </label>
                          <select
                            value={question.question_type}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                'question_type',
                                e.target.value as 'multiple_choice' | 'written'
                              )
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                          >
                            <option value="multiple_choice">Ko'p tanlovli</option>
                            <option value="written">Yozma</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Savol matni
                          </label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) =>
                              updateQuestion(index, 'question_text', e.target.value)
                            }
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                          />
                        </div>

                        {question.question_type === 'multiple_choice' ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  A variant
                                </label>
                                <Input
                                  value={question.option_a}
                                  onChange={(e) =>
                                    updateQuestion(index, 'option_a', e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  B variant
                                </label>
                                <Input
                                  value={question.option_b}
                                  onChange={(e) =>
                                    updateQuestion(index, 'option_b', e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  C variant
                                </label>
                                <Input
                                  value={question.option_c}
                                  onChange={(e) =>
                                    updateQuestion(index, 'option_c', e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  D variant
                                </label>
                                <Input
                                  value={question.option_d}
                                  onChange={(e) =>
                                    updateQuestion(index, 'option_d', e.target.value)
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
                                value={question.correct_option}
                                onChange={(e) =>
                                  updateQuestion(index, 'correct_option', e.target.value)
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
                              value={question.correct_answer}
                              onChange={(e) =>
                                updateQuestion(index, 'correct_answer', e.target.value)
                              }
                              required
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit" disabled={isSubmittingForm}>
                  {isSubmittingForm
                    ? "Saqlanmoqda..."
                    : editingMaterial
                      ? "Yangilash"
                      : "Yaratish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingMaterial(null)
                    setFormData({ title: "", short_description: "", content: "", category_id: "" })
                    resetAudioState()
                    setQuestions([{
                      question_type: 'multiple_choice',
                      question_text: '',
                      option_a: '',
                      option_b: '',
                      option_c: '',
                      option_d: '',
                      correct_option: '',
                      correct_answer: '',
                    }])
                    setDeletedQuestionIds([])
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

      {/* Materials List - Grouped by Categories */}
      {categories.length > 0 && selectedCategory === null ? (
        <>
          {/* Kategoriyalar bo'yicha guruhlangan materiallar */}
          {categories.map((category) => {
            const categoryMaterials = materials.filter(
              (m) => m.category?.id === category.id
            )
            if (categoryMaterials.length === 0) return null

            return (
              <div key={category.id} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Folder className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({categoryMaterials.length} ta)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryMaterials.map((material) => (
                    <Card key={material.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{material.title}</CardTitle>
                            {material.short_description && (
                              <p className="text-sm text-muted-foreground">
                                {material.short_description}
                              </p>
                            )}
                              {material.audio && (
                                <span className="inline-flex items-center mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Audio mavjud
                                </span>
                              )}
                          </div>
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileQuestion className="w-4 h-4" />
                            <span>{material.questions_count || 0} ta savol</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(material)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                              disabled={deletingId === material.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
          
          {/* Kategoriyaga bog'lanmagan materiallar */}
          {(() => {
            const uncategorizedMaterials = materials.filter(
              (m) => !m.category || !m.category.id
            )
            
            if (uncategorizedMaterials.length === 0) return null

            return (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Folder className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Kategoriyaga bog'lanmagan</h2>
                  <span className="text-sm text-muted-foreground">
                    ({uncategorizedMaterials.length} ta)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uncategorizedMaterials.map((material) => (
                    <Card key={material.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{material.title}</CardTitle>
                            {material.short_description && (
                              <p className="text-sm text-muted-foreground">
                                {material.short_description}
                              </p>
                            )}
                              {material.audio && (
                                <span className="inline-flex items-center mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Audio mavjud
                                </span>
                              )}
                          </div>
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileQuestion className="w-4 h-4" />
                            <span>{material.questions_count || 0} ta savol</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(material)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                              disabled={deletingId === material.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })()}
        </>
      ) : (
        <>
          {/* Filtered Materials or All Materials */}
          {(() => {
            const filteredMaterials = selectedCategory
              ? materials.filter((m) => m.category?.id === selectedCategory)
              : materials

            return filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory
                      ? "Hech qanday material topilmadi"
                      : "Hozircha materiallar yo'q"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {material.category && (
                    <span className="inline-flex items-center mb-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {material.category.name}
                    </span>
                  )}
                  <CardTitle className="text-lg mb-2">{material.title}</CardTitle>
                  {material.short_description && (
                    <p className="text-sm text-muted-foreground">
                      {material.short_description}
                    </p>
                  )}
                    {material.audio && (
                      <span className="inline-flex items-center mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Audio mavjud
                      </span>
                    )}
                </div>
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileQuestion className="w-4 h-4" />
                  <span>{material.questions_count || 0} ta savol</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(material)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Tahrirlash
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(material.id)}
                    disabled={deletingId === material.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
                </Card>
              ))}
            </div>
            )
          })()}
        </>
      )}

      {totalCount > pageSize && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <p className="text-sm text-muted-foreground">
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
            {Math.min(currentPage * pageSize, totalCount)} / {totalCount} ta material
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

    </div>
  )
}

