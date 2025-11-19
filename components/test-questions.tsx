"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { storageService, type User } from "@/lib/storage-service"
import { apiService, type ReadingMaterial, type Question } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"

interface TestQuestionsProps {
  material: ReadingMaterial
  questions: Question[]
  user: User
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string>) => void
  onComplete: () => void
}

export default function TestQuestionsComponent({ 
  material, 
  questions, 
  user, 
  answers, 
  setAnswers,
  onComplete 
}: TestQuestionsProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 text-center">
        <p className="text-muted-foreground">Bu material uchun savollar mavjud emas.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const allAnswered = questions.every((q) => {
    const answer = answers[q.id.toString()]
    return answer !== undefined && answer !== null && answer.trim() !== ''
  })
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Javoblarni API formatiga o'tkazish
      const answersData: Record<string, string> = {}
      questions.forEach((q) => {
        const answer = answers[q.id.toString()]
        if (answer) {
          answersData[q.id.toString()] = answer
      }
    })

      // Test javoblarini API'ga yuborish
      await apiService.submitTest(material.id, answersData)
      
      // Natija sahifasiga o'tish
      onComplete()
    } catch (err: any) {
      console.error("Test submit error:", err)
      alert(err.message || "Testni topshirishda xatolik")
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-muted-foreground">
            Savol {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border border-border animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.question_type === 'multiple_choice' ? (
            // Ko'p tanlovli savol
            ['A', 'B', 'C', 'D'].map((optionKey) => {
              const optionValue = currentQuestion[`option_${optionKey.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d']
              if (!optionValue) return null
              
              const isSelected = answers[currentQuestion.id.toString()] === optionKey
            return (
              <button
                  key={optionKey}
                  onClick={() => handleSelectAnswer(currentQuestion.id.toString(), optionKey)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? "border-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/15 active:scale-[0.98]" 
                    : "border-border hover:border-primary/50 hover:bg-accent/50 active:bg-accent/70 active:scale-[0.98] bg-background"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                  </div>
                  <div className="flex-1">
                      <span className="font-medium">{optionKey}.</span>
                      <span className="ml-2">{optionValue}</span>
                  </div>
                </div>
              </button>
            )
            })
          ) : (
            // Yozma savol
            <div className="space-y-2">
              <Input
                type="text"
                value={answers[currentQuestion.id.toString()] || ''}
                onChange={(e) => handleSelectAnswer(currentQuestion.id.toString(), e.target.value)}
                placeholder="Javobingizni kiriting..."
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2 justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-accent active:bg-accent/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Oldingi
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-accent active:bg-accent/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Keyingi
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={!allAnswered || isSubmitting} 
            size="sm" 
            className="gap-2 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Topshirilmoqda...' : 'Topshirish'}
          </Button>
        </div>
      </div>

      {!allAnswered && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 text-center">
          Barcha savollarga javob bering
        </div>
      )}
    </div>
  )
}
