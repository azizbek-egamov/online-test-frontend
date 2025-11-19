"use client"

import { useState } from "react"
import type { ReadingMaterial } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ZoomIn, ZoomOut } from "lucide-react"

interface TestReaderProps {
  material: ReadingMaterial
  onContinue: () => void
}

export default function TestReaderComponent({ material, onContinue }: TestReaderProps) {
  const [textSize, setTextSize] = useState<"normal" | "large">("normal")

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">{material.title}</h1>
        {material.short_description && (
          <p className="text-muted-foreground">{material.short_description}</p>
        )}
      </div>

      {/* Reader Tools */}
      <Card className="border border-border">
        <CardContent className="px-3 py-2 flex justify-end">
          <Button
            onClick={() => setTextSize(textSize === "normal" ? "large" : "normal")}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs hover:bg-transparent hover:text-primary"
          >
            {textSize === "normal" ? (
              <>
                <ZoomIn className="w-4 h-4" />
                Kattalashtir
              </>
            ) : (
              <>
                <ZoomOut className="w-4 h-4" />
                Kichiklashtir
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Main Text */}
      <Card className="border border-border">
        <CardContent
          className={`p-6 whitespace-pre-wrap leading-relaxed ${textSize === "large" ? "text-xl" : "text-base"}`}
        >
          {material.content}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onContinue} size="lg" className="gap-2">
          Savollarga o'tish
        </Button>
      </div>
    </div>
  )
}
