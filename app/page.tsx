"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Sparkles, Zap, Target } from 'lucide-react'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ReadMaster
            </span>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-base font-semibold hover:bg-primary/10 hover:text-foreground active:bg-primary/15 transition-all duration-200">
              Kirish
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Zamonaviy O'qish Platformasi</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight text-foreground">
                O'qishni
                <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  qiziqarli qil
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Interactive testlar, real-time audio qo'llab-quvvatlash va ajoyib animatsiyalar bilan o'qish
                ko'nikmalarini takomillashtirib bor.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 px-8 gap-2 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:shadow-lg hover:shadow-primary/40 hover:text-primary-foreground active:from-primary/80 active:to-accent/80 active:scale-[0.98] transition-all duration-200"
                >
                  Boshlash
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-semibold border-2 border-primary hover:bg-primary/10 hover:border-primary/50 hover:text-foreground active:bg-primary/15 active:scale-[0.98] transition-all duration-200"
                >
                  Kirish
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <p className="text-3xl font-black text-primary">500+</p>
                <p className="text-sm font-semibold text-muted-foreground">Ajoyib Testlar</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-accent">10K+</p>
                <p className="text-sm font-semibold text-muted-foreground">Baxtli O'quvchilar</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden md:flex items-center justify-center h-96">
            <div className="relative w-full h-full flex items-center justify-center animate-scale-in">
              <div className="absolute w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <div className="relative z-10 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce-sm" />
                <p className="font-bold text-lg">Hozir boshlang!</p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 border-t border-border/50">
        <h2 className="text-3xl font-black mb-12 text-center text-foreground">Nima xohlaysiz?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Tezkor",
              desc: "Sodda interfeys, aniq natijalar. Har bir qadamni birdan sezib borasiz.",
              bgColor: "bg-primary/10",
              textColor: "text-primary",
            },
            {
              icon: BookOpen,
              title: "500+ Testlar",
              desc: "Turli mavzular va murakkablik darajalari bir joyda jamlangan.",
              bgColor: "bg-accent/10",
              textColor: "text-accent",
            },
            {
              icon: Target,
              title: "Real Natijalar",
              desc: "To'liq tahlil va chuqur fikr-mulohaza. Taraqqiyotingiz real vaqt rejimida ko'rinadi.",
              bgColor: "bg-secondary/10",
              textColor: "text-secondary",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-3xl bg-card border-2 border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.textColor}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 border-t border-border/50">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20 p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-foreground">O'qish sayohatingizni boshlang</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ro'yxatdan o'ting va ajoyib o'qish testlarini yechishga tayyor bo'ling. Butunlay bepul va mutlaqo
              mashaqqatsiz!
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 px-8 gap-2 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:shadow-lg hover:shadow-primary/40 hover:text-primary-foreground active:from-primary/80 active:to-accent/80 active:scale-[0.98] transition-all duration-200"
              >
                Hozir Ro'yxatdan O'tish
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <p>© 2025 ReadMaster. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </main>
  )
}
