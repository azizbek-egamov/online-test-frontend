"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { adminApiService, type UserResponse } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Mail, UserCircle2, ArrowRight } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const pageSize = 20

  useEffect(() => {
    loadUsers()
  }, [searchQuery, currentPage])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await adminApiService.adminGetUsers({
        page: currentPage,
        search: searchQuery || undefined,
      })
      setUsers(data.results || [])
      setTotalCount(data.count || 0)
      setHasNextPage(Boolean(data.next))
      setHasPreviousPage(Boolean(data.previous))
      setError(null)
    } catch (err: any) {
      console.error("Admin users load error:", err)
      setError(err.message || "Foydalanuvchilarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Foydalanuvchilar</h1>
          <p className="text-muted-foreground">
            Tizimga ro'yxatdan o'tgan barcha foydalanuvchilar ro'yxati
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{totalCount} ta foydalanuvchi</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Foydalanuvchi nomi yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <Card className="mb-6 border border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && users.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          Yuklanmoqda...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-primary" />
                    {user.username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {(user.first_name || user.last_name) ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "Ism kiritilmagan"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email || "Email kiritilmagan"}</span>
                  </div>
                  <Link href={`/admin/users/${user.id}`}>
                    <Button
                      variant="outline"
                      className="w-full gap-2 hover:bg-primary/10"
                    >
                      Profilni ko'rish
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {users.length === 0 && !isLoading && (
            <Card className="mt-6">
              <CardContent className="p-12 text-center text-muted-foreground">
                Foydalanuvchilar topilmadi.
              </CardContent>
            </Card>
          )}

          {totalCount > pageSize && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
              <p className="text-sm text-muted-foreground">
                {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
                {Math.min(currentPage * pageSize, totalCount)} / {totalCount} ta foydalanuvchi
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
        </>
      )}
    </div>
  )
}

