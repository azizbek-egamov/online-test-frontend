"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { storageService, type User, type TestResult } from "@/lib/storage-service"
import { testData, type TestContent } from "@/lib/test-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { Home, History, Check, X } from "lucide-react"

function ReviewContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const testId = params.id as string
  const resultIndex = Number.parseInt(searchParams.get("index") || "0")

  const [user, setUser] = useState<User | null>(null)
  const [test, setTest] = useState<TestContent | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = storageService.getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)

    const foundTest = testData.find((t) => t.id === testId)
    if (!foundTest) {
      router.push("/dashboard")
      return
    }
    setTest(foundTest)

    const history = storageService.getUserHistory(currentUser.id)
    if (history[resultIndex] && history[resultIndex].testId === testId) {
      setResult(history[resultIndex])
    }

    setIsLoading(false)
  }, [router, testId, resultIndex])

  if (isLoading || !user || !test || !result) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </main>
    )
  }

  const percentage = (result.score / result.totalQuestions) * 100
  const isPassed = percentage >= 60

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
        {/* Score Summary */}
        <Card
          className={`border-2 ${isPassed ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}`}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">{test.title}</h1>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-2xl font-bold text-green-600">{result.score}</div>
                  <div className="text-xs text-muted-foreground mt-1">To'g'ri</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.score}</div>
                  <div className="text-xs text-muted-foreground mt-1">Noto'g'ri</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{percentage.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Foiz</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Javoblar ko'rikmasi</h2>

          {test.questions.map((question, idx) => {
            const userAnswer = result.answers[question.id]
            const isCorrect = userAnswer === question.correct
            const userAnswerText = question.options.find((opt) => opt.key === userAnswer)?.text
            const correctAnswerText = question.options.find((opt) => opt.key === question.correct)?.text

            return (
              <Card
                key={question.id}
                className={`border-l-4 ${
                  isCorrect ? "border-l-green-500 bg-green-50/50" : "border-l-red-500 bg-red-50/50"
                }`}
              >
                <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    <div className="flex-1 space-y-2 text-sm">
                      <p className="font-medium">{question.text}</p>
                      <p className="text-muted-foreground">
                        Sizning javob:{" "}
                        <span className="font-medium">
                          {userAnswer}. {userAnswerText}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-muted-foreground">
                          To'g'ri javob:{" "}
                          <span className="font-medium text-green-700">
                            {question.correct}. {correctAnswerText}
                          </span>
                        </p>
                      )}
                      <p className="text-muted-foreground pt-2 italic">{question.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Back Buttons */}
        <div className="flex gap-2 justify-center pt-4">
          <Link href="/profile">
            <Button variant="outline" className="gap-2 hover:bg-accent active:bg-accent/80 active:scale-[0.98] transition-all duration-200">
              <History className="w-4 h-4" />
              Tariximga qaytish
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2 hover:shadow-md active:scale-[0.98] transition-all duration-200">
              <Home className="w-4 h-4" />
              Bosh sahifa
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function TestReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </main>
      }
    >
      <ReviewContent />
    </Suspense>
  )
}
