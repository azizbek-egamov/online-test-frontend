// API Service for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

export interface UserResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface UserResult {
  id: number
  user: UserResponse
  reading_material: {
    id: number
    title: string
    content: string
    created_at: string
    questions_count: number
  }
  total_questions: number
  correct_answers: number
  percentage: string
  finished_at: string
}

export interface StatisticsResponse {
  total_tests: number
  average_percentage: number
  best_result: UserResult | null
  recent_results: UserResult[]
}

export interface ReadingMaterial {
  id: number
  title: string
  short_description?: string
  content: string
  created_at: string
  questions_count: number
  questions?: Question[]
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  private setTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })
    
    // Xato holatlar uchun JSON bo'lmasa ham xavfsiz ishlash
    if (!response.ok) {
      let errorData: any = {}
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          errorData = await response.json()
        }
      } catch {
        // body bo'sh bo'lsa yoki JSON bo'lmasa, e'tibor bermaymiz
      }
      throw new Error(
        errorData.detail ||
          errorData.message ||
          `HTTP error! status: ${response.status}`
      )
    }

    // DELETE kabi 204 No Content javoblarda JSON pars qilishga urunmaslik
    if (response.status === 204) {
      return undefined as unknown as T
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      // JSON bo'lmagan javoblar uchun hech narsa qaytarmaymiz
      return undefined as unknown as T
    }

    return response.json() as Promise<T>
  }

  // Authentication methods
  async register(data: RegisterRequest): Promise<{ user: UserResponse; message: string }> {
    const response = await this.request<{ user: UserResponse; message: string }>(
      '/auth/register/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    return response
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    this.setTokens(response.access, response.refresh)
    return response
  }

  async refreshToken(): Promise<LoginResponse> {
    const refresh = this.getRefreshToken()
    if (!refresh) {
      throw new Error('No refresh token available')
    }

    const response = await this.request<LoginResponse>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    })
    this.setTokens(response.access, response.refresh)
    return response
  }

  async getProfile(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/profile/')
  }

  async updateProfile(data: Partial<UserResponse>): Promise<UserResponse> {
    const response = await this.request<{ user: UserResponse; message: string }>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.user
  }

  async logout(): Promise<void> {
    this.clearTokens()
  }

  // Results methods
  async getMyResults(): Promise<UserResult[]> {
    return this.request<UserResult[]>('/results/my_results/')
  }

  async getResultById(id: number): Promise<UserResult> {
    return this.request<UserResult>(`/results/${id}/`)
  }

  async getStatistics(): Promise<StatisticsResponse> {
    return this.request<StatisticsResponse>('/results/statistics/')
  }

  // Reading Materials methods
  async getReadingMaterials(): Promise<ReadingMaterial[]> {
    const response = await this.request<{
      results?: ReadingMaterial[]
      count?: number
      next?: string | null
      previous?: string | null
    } | ReadingMaterial[]>('/reading-materials/')
    
    // Pagination response formatini tekshirish
    if (Array.isArray(response)) {
      return response
    }
    
    // Agar pagination formatida bo'lsa
    if (response && 'results' in response && Array.isArray(response.results)) {
      return response.results
    }
    
    return []
  }

  async getReadingMaterialById(id: number): Promise<ReadingMaterial> {
    return this.request<ReadingMaterial>(`/reading-materials/${id}/`)
  }

  async submitTest(materialId: number, answers: Record<string, string>): Promise<UserResult> {
    return this.request<UserResult>(`/reading-materials/${materialId}/submit_test/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    })
  }

  async getTestResult(materialId: number): Promise<UserResult> {
    return this.request<UserResult>(`/reading-materials/${materialId}/result/`)
  }

  // Admin methods
  async checkAdminAccess(): Promise<{ is_admin: boolean }> {
    try {
      await this.request('/admin/reading-materials/')
      return { is_admin: true }
    } catch {
      return { is_admin: false }
    }
  }

  // Admin - Reading Materials
  async adminGetReadingMaterials(params?: { page?: number; page_size?: number; search?: string }): Promise<PaginatedResponse<ReadingMaterial>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page_size', (params?.page_size || 20).toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.search) queryParams.append('search', params.search)
    const queryString = queryParams.toString()
    const response = await this.request<any>(`/admin/reading-materials/${queryString ? `?${queryString}` : ''}`)
    
    if (Array.isArray(response)) {
      return { results: response, count: response.length, next: null, previous: null }
    }
    
    return {
      results: response?.results || [],
      count: response?.count ?? (response?.results?.length || 0),
      next: response?.next ?? null,
      previous: response?.previous ?? null,
    }
  }

  async adminGetReadingMaterial(id: number): Promise<ReadingMaterial> {
    return this.request<ReadingMaterial>(`/admin/reading-materials/${id}/`)
  }

  async adminCreateReadingMaterial(data: Partial<ReadingMaterial>): Promise<ReadingMaterial> {
    return this.request<ReadingMaterial>('/admin/reading-materials/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminUpdateReadingMaterial(id: number, data: Partial<ReadingMaterial>): Promise<ReadingMaterial> {
    return this.request<ReadingMaterial>(`/admin/reading-materials/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async adminDeleteReadingMaterial(id: number): Promise<void> {
    return this.request<void>(`/admin/reading-materials/${id}/`, {
      method: 'DELETE',
    })
  }

  // Admin - Questions
  async adminGetQuestions(params?: { page?: number; page_size?: number; reading_material?: number; question_type?: string; search?: string }): Promise<PaginatedResponse<Question>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page_size', (params?.page_size || 20).toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.reading_material) queryParams.append('reading_material', params.reading_material.toString())
    if (params?.question_type) queryParams.append('question_type', params.question_type)
    if (params?.search) queryParams.append('search', params.search)
    
    const queryString = queryParams.toString()
    const url = `/admin/questions/${queryString ? '?' + queryString : ''}`
    
    const response = await this.request<any>(url)
    
    if (Array.isArray(response)) {
      return { results: response, count: response.length, next: null, previous: null }
    }
    
    return {
      results: response?.results || [],
      count: response?.count ?? (response?.results?.length || 0),
      next: response?.next ?? null,
      previous: response?.previous ?? null,
    }
  }

  async adminGetQuestion(id: number): Promise<Question> {
    return this.request<Question>(`/admin/questions/${id}/`)
  }

  async adminCreateQuestion(data: Partial<Question>): Promise<Question> {
    return this.request<Question>('/admin/questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminUpdateQuestion(id: number, data: Partial<Question>): Promise<Question> {
    return this.request<Question>(`/admin/questions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async adminDeleteQuestion(id: number): Promise<void> {
    return this.request<void>(`/admin/questions/${id}/`, {
      method: 'DELETE',
    })
  }

  // Admin - Results
  async adminGetResults(params?: { page?: number; page_size?: number; user?: number; reading_material?: number; search?: string }): Promise<PaginatedResponse<UserResult>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page_size', (params?.page_size || 20).toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.user) queryParams.append('user', params.user.toString())
    if (params?.reading_material) queryParams.append('reading_material', params.reading_material.toString())
    if (params?.search) queryParams.append('search', params.search)
    
    const queryString = queryParams.toString()
    const url = `/admin/results/${queryString ? '?' + queryString : ''}`
    
    const response = await this.request<any>(url)
    
    if (Array.isArray(response)) {
      return { results: response, count: response.length, next: null, previous: null }
    }
    
    return {
      results: response?.results || [],
      count: response?.count ?? (response?.results?.length || 0),
      next: response?.next ?? null,
      previous: response?.previous ?? null,
    }
  }

  async adminGetStatistics(): Promise<{
    total_results: number
    total_materials: number
    total_questions: number
    total_users: number
    average_percentage: number
  }> {
    return this.request('/admin/results/statistics/')
  }
}

export interface Question {
  id: number
  reading_material: number
  question_type: 'multiple_choice' | 'written'
  question_text: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_option?: string
  correct_answer?: string
  created_at: string
}

export const apiService = new ApiService()

