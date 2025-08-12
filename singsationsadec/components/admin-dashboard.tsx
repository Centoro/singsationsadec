"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Users, Activity, Trophy, ArrowLeft } from "lucide-react"
import { apiClient, type UserReport } from "@/lib/api"

interface AdminDashboardProps {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [userReports, setUserReports] = useState<UserReport[]>([])
  const [topUsers, setTopUsers] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserReport | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [reports, top] = await Promise.all([apiClient.getAllUserReports(), apiClient.getTopUsers(10)])

      setUserReports(reports)
      setTopUsers(top)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const csvData = await apiClient.exportUserData()
      const blob = new Blob([csvData], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sing-sation-users-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const getActivityBadgeColor = (eventType: string) => {
    switch (eventType) {
      case "signup":
        return "bg-green-500"
      case "signin":
        return "bg-blue-500"
      case "song_selection":
        return "bg-purple-500"
      case "recording_complete":
        return "bg-orange-500"
      case "payment":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => setSelectedUser(null)} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedUser.artistName || selectedUser.email}
              </CardTitle>
              <CardDescription>User ID: {selectedUser.userId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.totalSignIns}</div>
                  <div className="text-sm text-gray-600">Sign-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.songsSelected}</div>
                  <div className="text-sm text-gray-600">Songs Selected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedUser.recordingsCompleted}</div>
                  <div className="text-sm text-gray-600">Recordings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{selectedUser.paymentsCompleted}</div>
                  <div className="text-sm text-gray-600">Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedUser.activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Badge className={`${getActivityBadgeColor(activity.eventType)} text-white`}>
                      {activity.eventType.replace("_", " ")}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">
                        {activity.details?.songTitle && `Song: ${activity.details.songTitle}`}
                        {activity.details?.category && `Category: ${activity.details.category}`}
                        {activity.details?.paymentAmount && `Payment: R${activity.details.paymentAmount}`}
                      </div>
                      <div className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <Button onClick={handleExportData} className="bg-yellow-600 hover:bg-yellow-700">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{userReports.length}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {userReports.reduce((sum, user) => sum + user.totalSignIns, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sign-ins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {userReports.reduce((sum, user) => sum + user.songsSelected, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Songs Selected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Download className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {userReports.reduce((sum, user) => sum + user.paymentsCompleted, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="top-users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="top-users">Top Users</TabsTrigger>
            <TabsTrigger value="all-users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="top-users">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Most Active Users</CardTitle>
                <CardDescription>
                  Users ranked by total activity (sign-ins + songs + recordings + payments)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{user.artistName || user.email}</div>
                          <div className="text-sm text-gray-600">
                            {user.totalSignIns} sign-ins • {user.songsSelected} songs • {user.recordingsCompleted}{" "}
                            recordings
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{(user as any).totalActivity} total activities</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Complete list of registered users and their activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userReports.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div>
                        <div className="font-medium">{user.artistName || user.email}</div>
                        <div className="text-sm text-gray-600">
                          Last activity: {new Date(user.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{user.totalSignIns} sign-ins</Badge>
                        <Badge variant="outline">{user.songsSelected} songs</Badge>
                        <Badge variant="outline">{user.paymentsCompleted} payments</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
