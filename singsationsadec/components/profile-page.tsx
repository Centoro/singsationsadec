"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Trash2, User, LogOut, Bell, Activity } from "lucide-react"
import { apiClient } from "@/lib/api"

// Removed import and defined interface locally
interface PurchasedVideo {
  id: string
  songTitle: string
  category: string
  videoUrl: string
  purchaseDate: Date
  expiryDate: Date
}

interface ProfilePageProps {
  onBack: () => void
  onLogout: () => void
  onNotifications: () => void
}

export default function ProfilePage({ onBack, onLogout, onNotifications }: ProfilePageProps) {
  const [purchasedVideos, setPurchasedVideos] = useState<PurchasedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [user, setUser] = useState(apiClient.getCurrentUser())
  // Added userReport state for activity tracking
  const [userReport, setUserReport] = useState<any>(null)

  useEffect(() => {
    const loadPurchasedVideos = () => {
      try {
        const stored = localStorage.getItem("purchasedVideos")
        if (stored) {
          const videos = JSON.parse(stored).map((video: any) => ({
            ...video,
            purchaseDate: new Date(video.purchaseDate),
            expiryDate: new Date(video.expiryDate),
          }))

          const validVideos = videos.filter((video: PurchasedVideo) => video.expiryDate > new Date())

          if (validVideos.length !== videos.length) {
            localStorage.setItem("purchasedVideos", JSON.stringify(validVideos))
          }

          setPurchasedVideos(validVideos)
        }
      } catch (error) {
        console.error("Error loading purchased videos:", error)
      }
      setLoading(false)
    }

    const loadNotificationCount = () => {
      try {
        const stored = localStorage.getItem("notifications")
        if (stored) {
          const notifications = JSON.parse(stored)
          const unreadCount = notifications.filter((notif: any) => !notif.isRead).length
          setUnreadNotifications(unreadCount)
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    const loadUserReport = () => {
      const report = apiClient.getUserReport()
      setUserReport(report)
    }

    loadPurchasedVideos()
    loadNotificationCount()
    loadUserReport()
  }, [])

  const handleDownload = (video: PurchasedVideo) => {
    try {
      const link = document.createElement("a")
      link.href = video.videoUrl
      link.download = `${video.songTitle}_karaoke_${video.category}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    }
  }

  const handleDelete = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      const updatedVideos = purchasedVideos.filter((video) => video.id !== videoId)
      setPurchasedVideos(updatedVideos)
      localStorage.setItem("purchasedVideos", JSON.stringify(updatedVideos))
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.logout()
      onLogout()
    } catch (error) {
      console.error("Logout error:", error)
      onLogout()
    }
  }

  const getDaysRemaining = (expiryDate: Date) => {
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-800">My Profile</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onNotifications}
              className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent relative"
            >
              <Bell className="w-4 h-4" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {userReport && (
          <Card className="mb-6 border-amber-200">
            <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userReport.totalSignIns}</div>
                  <div className="text-sm text-gray-600">Sign-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userReport.songsSelected}</div>
                  <div className="text-sm text-gray-600">Songs Selected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userReport.recordingsCompleted}</div>
                  <div className="text-sm text-gray-600">Recordings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userReport.paymentsCompleted}</div>
                  <div className="text-sm text-gray-600">Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Info Card */}
        <Card className="mb-6 border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user?.email || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Videos</p>
                <p className="font-semibold">{purchasedVideos.length}</p>
              </div>
              {user?.name && (
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchased Videos */}
        <Card className="border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
            <CardTitle>My Purchased Videos</CardTitle>
            <p className="text-amber-100 text-sm">Videos are automatically removed after 7 days</p>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your videos...</p>
              </div>
            ) : purchasedVideos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No purchased videos yet</p>
                <Button onClick={onBack} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Start Recording
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchasedVideos.map((video) => {
                  const daysRemaining = getDaysRemaining(video.expiryDate)
                  return (
                    <Card key={video.id} className="border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <video
                            src={video.videoUrl}
                            className="w-full h-full object-cover rounded-lg"
                            controls={false}
                            poster="/placeholder.svg?height=120&width=200"
                          />
                        </div>

                        <h3 className="font-semibold text-gray-800 mb-1">{video.songTitle}</h3>
                        <p className="text-sm text-gray-600 mb-2 capitalize">{video.category} Category</p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>Purchased: {video.purchaseDate.toLocaleDateString()}</span>
                          <span className={`font-semibold ${daysRemaining <= 2 ? "text-red-600" : "text-amber-600"}`}>
                            {daysRemaining} days left
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(video)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(video.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
