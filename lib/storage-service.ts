// Storage service layer for data management
// Works with API tokens

export interface User {
  id: number | string
  username?: string
  name: string
  email: string
  first_name?: string
  last_name?: string
  createdAt?: string
}

export interface TestResult {
  testId: string
  testTitle: string
  completedAt: string
  score: number
  totalQuestions: number
  answers: Record<string, string>
}

class StorageService {
  private sessionKey = "session_user"
  private adminSessionKey = "admin_session_user"
  private historyPrefix = "user_history_"
  private tokenKey = "access_token"
  private refreshTokenKey = "refresh_token"
  private adminTokenKey = "admin_access_token"
  private adminRefreshTokenKey = "admin_refresh_token"

  // Session Management
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const session = localStorage.getItem(this.sessionKey)
    return session ? JSON.parse(session) : null
  }

  setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.sessionKey, JSON.stringify(user))
  }

  getAdminUser(): User | null {
    if (typeof window === 'undefined') return null
    const session = localStorage.getItem(this.adminSessionKey)
    return session ? JSON.parse(session) : null
  }

  setAdminUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.adminSessionKey, JSON.stringify(user))
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  setTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.tokenKey, access)
    localStorage.setItem(this.refreshTokenKey, refresh)
  }

  setAdminTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.adminTokenKey, access)
    localStorage.setItem(this.adminRefreshTokenKey, refresh)
  }

  logout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.sessionKey)
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  logoutAdmin(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.adminSessionKey)
    localStorage.removeItem(this.adminTokenKey)
    localStorage.removeItem(this.adminRefreshTokenKey)
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(this.adminTokenKey)
  }

  // User Management (kept for backward compatibility, but should use API)
  createUser(name: string, email: string, password: string): User {
    // This method is deprecated, use API instead
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    }
    return newUser
  }

  authenticateUser(email: string, password: string): User {
    // This method is deprecated, use API instead
    throw new Error("Please use API authentication")
  }

  private getAllUsers(): User[] {
    const users = localStorage.getItem("all_users")
    return users ? JSON.parse(users) : []
  }

  // Test Results
  saveTestResult(userId: string, result: TestResult): void {
    const key = this.historyPrefix + userId
    const history = this.getUserHistory(userId)
    history.push(result)
    localStorage.setItem(key, JSON.stringify(history))
  }

  getUserHistory(userId: string): TestResult[] {
    const key = this.historyPrefix + userId
    const history = localStorage.getItem(key)
    return history ? JSON.parse(history) : []
  }

  getTestResult(userId: string, testId: string, index: number): TestResult | null {
    const history = this.getUserHistory(userId)
    return history[index] || null
  }
}

export const storageService = new StorageService()
