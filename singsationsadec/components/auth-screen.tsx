"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient } from "@/lib/api"

interface AuthScreenProps {
  onNext: () => void
}

export default function AuthScreen({ onNext }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await apiClient.signin(email, password)
      if (response.success) {
        onNext()
      } else {
        setError(response.message)
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.signup(
        formData.email,
        formData.password,
        formData.phone || undefined,
        formData.username || undefined,
      )

      if (response.success) {
        onNext()
      } else {
        setError(response.message)
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Welcome to Sing Sation</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email/Contact</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm">
                    By signing up, you agree to our{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-blue-600 hover:underline">
                          Terms of Service
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96 w-full rounded-md border p-4">
                          <div className="space-y-4 text-sm">
                            <h3 className="font-semibold">SING-SATION SADEC PRIVACY POLICY</h3>
                            <p>
                              <strong>Who We Are</strong>
                            </p>
                            <p>
                              Our website address is: https://sing-sation.com. We value your privacy and are committed
                              to protecting your personal information.
                            </p>

                            <h4 className="font-semibold">Eligibility</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>School Competition: Ages 6–17 (with parental/guardian consent)</li>
                              <li>Adult Competition: Ages 18 and up</li>
                              <li>Singer-Songwriter Competition: Open to all ages</li>
                            </ul>

                            <h4 className="font-semibold">Entry & Submission</h4>
                            <p>Entry Fee: R50 (non-refundable). Submissions must be made via the official app.</p>

                            <h4 className="font-semibold">Competition Format</h4>
                            <p>Rounds: Online Auditions → Public Voting → Live Sing-Offs (Top 5) → Finals.</p>

                            <p className="text-xs text-gray-600">For complete terms, contact jp@sing-sation.com</p>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>{" "}
                    and{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Privacy Policy</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96 w-full rounded-md border p-4">
                          <div className="space-y-4 text-sm">
                            <p>
                              We collect information you provide in forms, along with your IP address and browser
                              details for spam detection.
                            </p>
                            <p>Cookies are used for login information (2 days) and preferences (1 year).</p>
                            <p>You can request copies of your data or ask for deletion at any time.</p>
                            <p>Contact jp@sing-sation.com for privacy concerns.</p>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={!formData.agreeToTerms || loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-xs text-gray-600">
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:underline">Privacy Policy</button>
              </DialogTrigger>
            </Dialog>
            {" • "}
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:underline">FAQ</button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
