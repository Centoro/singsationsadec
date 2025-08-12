"use client"

import { useState, useEffect } from "react"
import SplashScreen from "@/components/splash-screen"
import AuthScreen from "@/components/auth-screen"
import CategorySelection from "@/components/category-selection"
import SongSelection from "@/components/song-selection"
import KaraokeRecording from "@/components/karaoke-recording"
import DownloadScreen from "@/components/download-screen"
import ProfilePage from "@/components/profile-page"
import Notifications from "@/components/notifications"
import AdminDashboard from "@/components/admin-dashboard"

type Screen =
  | "splash"
  | "auth"
  | "category"
  | "songs"
  | "recording"
  | "download"
  | "profile"
  | "notifications"
  | "admin"

export default function KaraokeApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)

  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("auth")
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  const handleLogout = () => {
    // Clear any user session data
    localStorage.removeItem("userSession")
    setCurrentScreen("auth")
  }

  const handleScreenChange = (screen: Screen, data?: any) => {
    setCurrentScreen(screen)
    if (data) {
      if (screen === "songs") setSelectedCategory(data)
      if (screen === "recording") setSelectedSong(data)
      if (screen === "download") setRecordedVideo(data)
    }
  }

  const handleAdminAccess = () => {
    const password = prompt("Enter admin password:")
    if (password === "admin123") {
      setCurrentScreen("admin")
    } else {
      alert("Invalid password")
    }
  }

  return (
    <div className="min-h-screen">
      {currentScreen === "splash" && <SplashScreen />}
      {currentScreen === "auth" && (
        <AuthScreen onNext={() => handleScreenChange("category")} onAdminAccess={handleAdminAccess} />
      )}
      {currentScreen === "category" && (
        <CategorySelection
          onNext={(category) => handleScreenChange("songs", category)}
          onProfile={() => handleScreenChange("profile")}
        />
      )}
      {currentScreen === "songs" && (
        <SongSelection
          onNext={(song) => handleScreenChange("recording", song)}
          onBack={() => handleScreenChange("category")}
          onProfile={() => handleScreenChange("profile")}
        />
      )}
      {currentScreen === "recording" && (
        <KaraokeRecording
          song={selectedSong}
          onNext={(video) => handleScreenChange("download", video)}
          onBack={() => handleScreenChange("songs")}
        />
      )}
      {currentScreen === "download" && (
        <DownloadScreen
          video={recordedVideo}
          onBack={() => handleScreenChange("songs")}
          onProfile={() => handleScreenChange("profile")}
        />
      )}
      {currentScreen === "profile" && (
        <ProfilePage
          onBack={() => handleScreenChange("category")}
          onLogout={handleLogout}
          onNotifications={() => handleScreenChange("notifications")}
        />
      )}
      {currentScreen === "notifications" && <Notifications onBack={() => handleScreenChange("profile")} />}
      {currentScreen === "admin" && <AdminDashboard onBack={() => handleScreenChange("auth")} />}
    </div>
  )
}
