"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategoryRegistrationProps {
  category: string
  onBack: () => void
  onNext: () => void
}

export default function CategoryRegistration({ category, onBack, onNext }: CategoryRegistrationProps) {
  const [formData, setFormData] = useState({
    artistName: "",
    contactNumber: "",
    email: "",
    mailingList: false,
    agreeToTerms: false,
  })

  const generateUniqueCode = () => {
    const prefix = category.toUpperCase().substring(0, 3)
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert("You must agree to the Terms and Conditions to register")
      return
    }

    const uniqueCode = generateUniqueCode()
    alert(`Registration successful! Your competition tracking ID is: ${uniqueCode}`)
    onNext()
  }

  const getCategoryTitle = () => {
    switch (category) {
      case "adults":
        return "Adults Competition"
      case "kids":
        return "Kids Competition"
      case "celebrities":
        return "Celebrity Competition"
      default:
        return "Competition"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">{getCategoryTitle()} Registration</CardTitle>
            <CardDescription>Complete your registration for the karaoke competition</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist Name *</Label>
                <Input
                  id="artistName"
                  placeholder="Enter your artist name"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter your contact number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mailingList"
                  checked={formData.mailingList}
                  onCheckedChange={(checked) => setFormData({ ...formData, mailingList: checked as boolean })}
                />
                <Label htmlFor="mailingList" className="text-sm">
                  Sign up to mailing list and stay updated (optional)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-96 w-full rounded-md border p-4">
                        <div className="space-y-4 text-sm">
                          <h3 className="font-semibold">SING-SATION SADEC TERMS & CONDITIONS</h3>

                          <div>
                            <h4 className="font-semibold">1. Eligibility</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>School Competition: Ages 6–17 (with parental/guardian consent)</li>
                              <li>Adult Competition: Ages 18 and up</li>
                              <li>
                                Singer-Songwriter Competition: Open to all ages (parental consent required for minors)
                              </li>
                              <li>Employees or affiliates of the Organizer are not eligible</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold">2. Entry & Submission</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Entry Fee: R50 (non-refundable)</li>
                              <li>Submissions must be made via the official app</li>
                              <li>Submit original or cover performances (per category rules)</li>
                              <li>Content must be your own and free from third-party copyright claims</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold">3. Competition Format</h4>
                            <p>Rounds: Online Auditions → Public Voting → Live Sing-Offs (Top 5) → Finals</p>
                            <p>Voting via dedicated SMS (SMS costs will apply)</p>
                          </div>

                          <div>
                            <h4 className="font-semibold">4. Prizes</h4>
                            <p>
                              Cash for School and Adult Competition winners. Additional prizes may include: studio time,
                              promotional deals, or sponsorships.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold">5. Intellectual Property</h4>
                            <p>
                              By entering, you grant Singsation SADEC the right to use your content for promotional and
                              commercial purposes.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold">6. Conduct Rules</h4>
                            <p>
                              All participants must behave respectfully and professionally. Harassment, hate speech, or
                              cheating = immediate disqualification.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold">7. Governing Law</h4>
                            <p>These terms are governed by the laws of South Africa.</p>
                          </div>

                          <p className="text-xs text-gray-600 mt-4">For questions, contact: jp@sing-sation.com</p>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>{" "}
                  * (Required)
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={!formData.agreeToTerms}
              >
                Register for Competition
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
