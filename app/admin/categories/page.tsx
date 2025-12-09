"use client"

import { useEffect, useState } from "react"
import { adminApiService, type Category } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Folder,
  X
} from "lucide-react"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [searchQuery])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await adminApiService.adminGetCategories({ page_size: 200 })
      let filtered = data.results
      
      if (searchQuery) {
        filtered = filtered.filter(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      setCategories(filtered)
      setError(null)
    } catch (err: any) {
      console.error("Categories load error:", err)
      setError(err.message || "Kategoriyalarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setActionError(null)
    setFormData({ name: "" })
    setEditingCategory(null)
    setShowCreateForm(true)
  }

  const handleEdit = (category: Category) => {
    setActionError(null)
    setFormData({ name: category.name })
    setEditingCategory(category)
    setShowCreateForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kategoriyani o'chirishni xohlaysizmi?")) {
      return
    }

    try {
      setDeletingId(id)
      await adminApiService.adminDeleteCategory(id)
      await loadCategories()
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
      if (editingCategory) {
        await adminApiService.adminUpdateCategory(editingCategory.id, formData)
      } else {
        await adminApiService.adminCreateCategory(formData)
      }

      setShowCreateForm(false)
      setEditingCategory(null)
      setFormData({ name: "" })
      await loadCategories()
    } catch (err: any) {
      setActionError(err.message || "Saqlashda xatolik")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && categories.length === 0) {
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
          <h1 className="text-3xl font-bold mb-2">Kategoriyalar</h1>
          <p className="text-muted-foreground">Kategoriyalarni boshqarish</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi kategoriya
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
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
                <label className="text-sm font-medium mb-2 block">Kategoriya nomi</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  placeholder="Masalan: Matematika, Ingliz tili..."
                />
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saqlanmoqda..."
                    : editingCategory
                      ? "Yangilash"
                      : "Yaratish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCategory(null)
                    setFormData({ name: "" })
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

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Yaratilgan: {new Date(category.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Tahrirlash
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "Hech qanday kategoriya topilmadi"
                : "Hozircha kategoriyalar yo'q"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

