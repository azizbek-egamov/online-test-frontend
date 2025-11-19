import type React from "react"
import { cn } from "@/lib/utils"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
}

export function IconButton({ icon, size = "md", variant = "default", className, ...props }: IconButtonProps) {
  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const variantClasses = {
    default: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary/20",
    ghost: "hover:bg-muted active:bg-muted/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent/20",
    outline: "border border-border hover:bg-muted active:bg-muted/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent/20",
  }

  return (
    <button
      className={cn(
        "rounded-lg flex items-center justify-center transition-all duration-200 active:scale-[0.98] outline-none",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
