"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Trophy, Users, Calendar, Star } from "lucide-react"

interface Notification {
  id: string
  type: "winner" | "competition" | "update" | "announcement"
  title: string
  message: string
  date: Date
  isRead: boolean
  category?: string
}

interface NotificationsProps {
  onBack: () => void
}

export default function Notifications({ onBack }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load notifications (in a real app, this would come from an API)
    const loadNotifications = () => {
      const sampleNotifications: Notification[] = [
        {
          id: "1",
          type: "winner",
          title: "🏆 Adults Category Winner Announced!",
          message:
            "Congratulations to Sarah Johnson for winning the Adults Category with her amazing rendition of 'My Heart Will Go On'! Prize: R5,000 cash + recording contract opportunity.",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          isRead: false,
          category: "adults",
        },
        {
          id: "2",
          type: "competition",
          title: "📊 Competition Update - Week 3",
          message:
            "We've received over 500 entries this week! Kids Category is heating up with some incredible young talent. Voting closes in 4 days.",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          isRead: false,
        },
        {
          id: "3",
          type: "winner",
          title: "🌟 Kids Category Winner!",
          message:
            "10-year-old Michael Thompson wins the Kids Category with his performance of 'A Whole New World'! Prize: R2,500 + Disney World trip!",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          isRead: true,
          category: "kids",
        },
        {
          id: "4",
          type: "announcement",
          title: "🎤 New Celebrity Judge Added!",
          message:
            "We're excited to announce that Grammy winner Toya Delazy has joined our celebrity judging panel! She'll be reviewing all Celebrity Category entries.",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          isRead: true,
        },
        {
          id: "5",
          type: "competition",
          title: "📈 Competition Statistics",
          message:
            "Total entries: 1,247 | Adults: 456 | Kids: 398 | Celebrity: 393. The competition is fierce! Keep those entries coming!",
          date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          isRead: false,
        },
        {
          id: "6",
          type: "update",
          title: "🔄 App Update Available",
          message:
            "New features added: Better video quality, improved recording interface, and faster upload speeds. Update now for the best experience!",
          date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          isRead: false,
        },
      ]

      // Load from localStorage if available
      const stored = localStorage.getItem("notifications")
      if (stored) {
        try {
          const parsedNotifications = JSON.parse(stored).map((notif: any) => ({
            ...notif,
            date: new Date(notif.date),
          }))
          setNotifications(parsedNotifications)
        } catch (error) {
          setNotifications(sampleNotifications)
        }
      } else {
        setNotifications(sampleNotifications)
        localStorage.setItem("notifications", JSON.stringify(sampleNotifications))
      }

      setLoading(false)
    }

    loadNotifications()
  }, [])

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif,
    )
    setNotifications(updatedNotifications)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, isRead: true }))
    setNotifications(updatedNotifications)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "winner":
        return <Trophy className="w-5 h-5 text-yellow-600" />
      case "competition":
        return <Users className="w-5 h-5 text-blue-600" />
      case "announcement":
        return <Star className="w-5 h-5 text-purple-600" />
      case "update":
        return <Bell className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "winner":
        return "bg-yellow-100 border-yellow-200"
      case "competition":
        return "bg-blue-100 border-blue-200"
      case "announcement":
        return "bg-purple-100 border-purple-200"
      case "update":
        return "bg-green-100 border-green-200"
      default:
        return "bg-gray-100 border-gray-200"
    }
  }

  const unreadCount = notifications.filter((notif) => !notif.isRead).length

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
            <Bell className="w-6 h-6 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-800">Notifications</h1>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 bg-transparent"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="border-amber-200">
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${getNotificationColor(notification.type)} ${
                  !notification.isRead ? "ring-2 ring-amber-300" : ""
                } cursor-pointer hover:shadow-md transition-all`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>}
                      </div>

                      <p className={`text-sm mb-3 ${!notification.isRead ? "text-gray-800" : "text-gray-600"}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {notification.date.toLocaleDateString()} at{" "}
                            {notification.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {notification.category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
