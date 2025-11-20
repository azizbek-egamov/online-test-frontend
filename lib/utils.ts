import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, '')

export function getMediaUrl(path?: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${MEDIA_BASE}${normalizedPath}`
}
