"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search, BookOpen, FileQuestion, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* 404 Number with Animation */}
        <div className="space-y-6">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/10 select-none leading-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/5 animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sahifa topilmadi
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
              Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
            </p>
          </div>
        </div>

        {/* Illustration with Icons */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center animate-pulse">
              <Search className="w-28 h-28 md:w-32 md:h-32 text-primary/40" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg animate-bounce">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center border-4 border-background shadow-lg">
              <FileQuestion className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="gap-2 w-full sm:w-auto hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Bosh sahifaga qaytish
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2 w-full sm:w-auto hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-6">
            Yoki quyidagi sahifalardan birini tanlang:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
              >
                Profil
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              >
                Kirish
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="pt-8">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"></div>
            <span>404 Error</span>
            <div className="w-2 h-2 rounded-full bg-accent/30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

