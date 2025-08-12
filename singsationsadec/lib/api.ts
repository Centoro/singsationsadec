const API_BASE_URL = "http://129.151.182.215:3000"

// Fallback to localStorage when API is unavailable
const USE_FALLBACK = true // Set to false when API server is ready

export interface User {
  id: number
  email: string
  phone?: string
  name?: string
  created_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

export interface PurchaseData {
  user_id: number
  song_title: string
  artist_name: string
  category: string
  video_url: string
  amount: number
}

export interface ActivityLog {
  id: string
  userId: number
  eventType: "signup" | "signin" | "song_selection" | "recording_complete" | "payment"
  timestamp: string
  details?: {
    songTitle?: string
    category?: string
    paymentAmount?: number
    [key: string]: any
  }
}

export interface UserReport {
  userId: number
  email: string
  artistName?: string
  totalSignIns: number
  songsSelected: number
  recordingsCompleted: number
  paymentsCompleted: number
  lastActivity: string
  activities: ActivityLog[]
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private fallbackSignup(email: string, password: string, phone?: string, name?: string): AuthResponse {
    const users = JSON.parse(localStorage.getItem("fallback_users") || "[]")

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return {
        success: false,
        message: "User already exists with this email.",
      }
    }

    const newUser: User = {
      id: Date.now(),
      email,
      phone,
      name,
      created_at: new Date().toISOString(),
    }

    const userData = { ...newUser, password }
    users.push(userData)
    localStorage.setItem("fallback_users", JSON.stringify(users))

    const token = `fallback_token_${newUser.id}`
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_data", JSON.stringify(newUser))

    return {
      success: true,
      message: "Account created successfully!",
      user: newUser,
      token,
    }
  }

  private fallbackSignin(email: string, password: string): AuthResponse {
    const users = JSON.parse(localStorage.getItem("fallback_users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    const { password: _, ...userWithoutPassword } = user
    const token = `fallback_token_${user.id}`
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))

    return {
      success: true,
      message: "Signed in successfully!",
      user: userWithoutPassword,
      token,
    }
  }

  private logActivity(eventType: ActivityLog["eventType"], details?: ActivityLog["details"]): void {
    const user = this.getCurrentUser()
    if (!user) return

    const activity: ActivityLog = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      eventType,
      timestamp: new Date().toISOString(),
      details,
    }

    // Store in localStorage
    const activities = JSON.parse(localStorage.getItem("user_activities") || "[]")
    activities.push(activity)
    localStorage.setItem("user_activities", JSON.stringify(activities))

    // Try to send to API if available
    if (!USE_FALLBACK) {
      this.sendActivityToAPI(activity).catch(console.error)
    }
  }

  private async sendActivityToAPI(activity: ActivityLog): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(`${API_BASE_URL}/api/activity`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(activity),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("Failed to send activity to API:", error)
    }
  }

  async signup(email: string, password: string, phone?: string, name?: string): Promise<AuthResponse> {
    const result = USE_FALLBACK
      ? this.fallbackSignup(email, password, phone, name)
      : await this.performAPISignup(email, password, phone, name)

    if (result.success) {
      this.logActivity("signup", { email, phone, name })
    }

    return result
  }

  private async performAPISignup(
    email: string,
    password: string,
    phone?: string,
    name?: string,
  ): Promise<AuthResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password, phone, name }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error("Signup error:", error)
      console.log("API unavailable, using fallback authentication...")
      return this.fallbackSignup(email, password, phone, name)
    }
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const result = USE_FALLBACK ? this.fallbackSignin(email, password) : await this.performAPISignin(email, password)

    if (result.success) {
      this.logActivity("signin", { email })
    }

    return result
  }

  private async performAPISignin(email: string, password: string): Promise<AuthResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error("Signin error:", error)
      console.log("API unavailable, using fallback authentication...")
      return this.fallbackSignin(email, password)
    }
  }

  async logout(): Promise<void> {
    if (!USE_FALLBACK) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    // Always clear local storage
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  async savePurchase(purchaseData: PurchaseData): Promise<{ success: boolean; message: string }> {
    const purchases = JSON.parse(localStorage.getItem("user_purchases") || "[]")
    const purchaseWithId = {
      ...purchaseData,
      id: Date.now(),
      purchased_at: new Date().toISOString(),
    }
    purchases.push(purchaseWithId)
    localStorage.setItem("user_purchases", JSON.stringify(purchases))

    if (USE_FALLBACK) {
      return {
        success: true,
        message: "Purchase saved successfully!",
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}/api/purchases`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(purchaseData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Save purchase error:", error)
      // Purchase already saved to localStorage above
      return {
        success: true,
        message: "Purchase saved locally (API unavailable).",
      }
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data")
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  logSongSelection(songTitle: string, category: string): void {
    this.logActivity("song_selection", { songTitle, category })
  }

  logRecordingComplete(songTitle: string, category: string): void {
    this.logActivity("recording_complete", { songTitle, category })
  }

  logPayment(songTitle: string, category: string, amount: number): void {
    this.logActivity("payment", { songTitle, category, paymentAmount: amount })
  }

  getUserReport(userId?: number): UserReport | null {
    const user = userId ? this.getUserById(userId) : this.getCurrentUser()
    if (!user) return null

    const activities = JSON.parse(localStorage.getItem("user_activities") || "[]")
      .filter((activity: ActivityLog) => activity.userId === user.id)
      .sort((a: ActivityLog, b: ActivityLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const signIns = activities.filter((a: ActivityLog) => a.eventType === "signin").length
    const songSelections = activities.filter((a: ActivityLog) => a.eventType === "song_selection").length
    const recordings = activities.filter((a: ActivityLog) => a.eventType === "recording_complete").length
    const payments = activities.filter((a: ActivityLog) => a.eventType === "payment").length

    return {
      userId: user.id,
      email: user.email,
      artistName: user.name,
      totalSignIns: signIns,
      songsSelected: songSelections,
      recordingsCompleted: recordings,
      paymentsCompleted: payments,
      lastActivity: activities.length > 0 ? activities[0].timestamp : user.created_at,
      activities,
    }
  }

  getAllUserReports(): UserReport[] {
    const users = JSON.parse(localStorage.getItem("fallback_users") || "[]")
    return users.map((user: any) => this.getUserReport(user.id)).filter(Boolean)
  }

  getTopUsers(limit = 10): UserReport[] {
    const reports = this.getAllUserReports()
    return reports
      .map((report) => ({
        ...report,
        totalActivity:
          report.totalSignIns + report.songsSelected + report.recordingsCompleted + report.paymentsCompleted,
      }))
      .sort((a, b) => (b as any).totalActivity - (a as any).totalActivity)
      .slice(0, limit)
  }

  exportUserData(): string {
    const reports = this.getAllUserReports()
    const headers = [
      "User ID",
      "Email",
      "Artist Name",
      "Sign-ins",
      "Songs Selected",
      "Recordings",
      "Payments",
      "Last Activity",
    ]

    const csvContent = [
      headers.join(","),
      ...reports.map((report) =>
        [
          report.userId,
          `"${report.email}"`,
          `"${report.artistName || ""}"`,
          report.totalSignIns,
          report.songsSelected,
          report.recordingsCompleted,
          report.paymentsCompleted,
          `"${new Date(report.lastActivity).toLocaleString()}"`,
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }

  private getUserById(userId: number): User | null {
    const users = JSON.parse(localStorage.getItem("fallback_users") || "[]")
    const userData = users.find((u: any) => u.id === userId)
    if (!userData) return null

    const { password, ...userWithoutPassword } = userData
    return userWithoutPassword
  }
}

export const apiClient = new ApiClient()
