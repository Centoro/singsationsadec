"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, CreditCard, Clock, AlertTriangle, User, Volume2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api"

interface DownloadScreenProps {
  video: string | null
  onBack: () => void
  onProfile?: () => void // Added profile navigation prop
  songTitle?: string
  category?: string
}

export default function DownloadScreen({
  video,
  onBack,
  onProfile,
  songTitle = "Karaoke Performance",
  category = "General",
}: DownloadScreenProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [videoError, setVideoError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && video) {
      const videoElement = videoRef.current

      videoElement.muted = false
      videoElement.volume = 1.0

      const handleLoadedData = () => {
        console.log("Video loaded successfully:", {
          duration: videoElement.duration,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          readyState: videoElement.readyState,
          src: videoElement.src,
        })
        setVideoError("")
      }

      const handleError = (e: Event) => {
        const error = (e.target as HTMLVideoElement).error
        console.error("Video error details:", {
          error: error,
          code: error?.code,
          message: error?.message,
          videoSrc: videoElement.src,
          videoType: video.startsWith("blob:") ? "blob" : "url",
        })

        let errorMessage = "Unknown video error"
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Video loading was aborted"
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading video"
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Video format not supported for playback"
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Video source not supported - try recording again"
              break
            default:
              errorMessage = error.message || "Video playback error"
          }
        }
        setVideoError(errorMessage)
      }

      const handleCanPlay = () => {
        console.log("Video can play - ready for playback")
        setVideoError("")
      }

      const handleLoadStart = () => {
        console.log("Video loading started for:", video.substring(0, 50))
        setVideoError("")
      }

      videoElement.addEventListener("loadstart", handleLoadStart)
      videoElement.addEventListener("loadeddata", handleLoadedData)
      videoElement.addEventListener("error", handleError)
      videoElement.addEventListener("canplay", handleCanPlay)

      return () => {
        videoElement.removeEventListener("loadstart", handleLoadStart)
        videoElement.removeEventListener("loadeddata", handleLoadedData)
        videoElement.removeEventListener("error", handleError)
        videoElement.removeEventListener("canplay", handleCanPlay)
      }
    }
  }, [video])

  const handlePayment = () => {
    setShowPaymentDialog(true)
  }

  const processPayment = () => {
    setPaymentStatus("processing")
    setShowPaymentDialog(false)

    const paymentWindow = window.open(
      "https://pay.yoco.com/r/4WXyWk",
      "YoCoPayment",
      "width=600,height=700,scrollbars=yes,resizable=yes",
    )

    const checkPayment = setInterval(() => {
      if (paymentWindow?.closed) {
        clearInterval(checkPayment)
        setTimeout(() => {
          setPaymentStatus("completed")
          savePurchasedVideo()
          alert("Payment successful! You can now download your video.")
        }, 2000)
      }
    }, 1000)

    setTimeout(() => {
      if (paymentStatus === "processing") {
        clearInterval(checkPayment)
        setPaymentStatus("completed")
        savePurchasedVideo()
      }
    }, 30000)
  }

  const savePurchasedVideo = async () => {
    if (!video) return

    const purchaseDate = new Date()
    const expiryDate = new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    const user = apiClient.getCurrentUser()

    const purchasedVideo = {
      id: `video_${Date.now()}`,
      songTitle: songTitle,
      category: category,
      videoUrl: video,
      purchaseDate: purchaseDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
    }

    try {
      if (user) {
        await apiClient.savePurchase({
          user_id: user.id,
          song_title: songTitle,
          artist_name: user.name || "Unknown",
          category: category,
          video_url: video,
          amount: 50,
        })
      }

      const existingVideos = JSON.parse(localStorage.getItem("purchasedVideos") || "[]")
      existingVideos.push(purchasedVideo)
      localStorage.setItem("purchasedVideos", JSON.stringify(existingVideos))
    } catch (error) {
      console.error("Failed to save purchased video:", error)
      const existingVideos = JSON.parse(localStorage.getItem("purchasedVideos") || "[]")
      existingVideos.push(purchasedVideo)
      localStorage.setItem("purchasedVideos", JSON.stringify(existingVideos))
    }
  }

  const downloadVideo = () => {
    if (!video || paymentStatus !== "completed") {
      alert("Payment required before download")
      return
    }

    const link = document.createElement("a")
    link.href = video
    link.download = `karaoke-performance-${Date.now()}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert("Video downloaded successfully! Remember, your video will be available in the cloud for 7 days only.")
  }

  const playVideoWithAudio = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current
      videoElement.muted = false
      videoElement.volume = 1.0
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error)
        alert("Unable to play video. Please try clicking the play button on the video player.")
      })
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
    }
  }

  const getPaymentButtonText = () => {
    switch (paymentStatus) {
      case "processing":
        return "Processing Payment..."
      case "completed":
        return "Payment Completed ✓"
      case "failed":
        return "Payment Failed - Retry"
      default:
        return "Pay R50 to Download"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recording
          </Button>

          {onProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfile}
              className="text-white hover:bg-white/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Performance</h1>
          <p className="text-white/90">Review your recording and download it to your device</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Preview</CardTitle>
                <CardDescription>
                  Review your karaoke performance - use the video controls to play with audio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {video ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                        playsInline
                        controlsList="nodownload"
                        key={video} // Add key prop to force re-render when video changes
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {videoError && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Video Error:</strong> {videoError}
                          <br />
                          <small>Try refreshing the page or recording again.</small>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <Volume2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Audio Included:</strong> Your recording includes both video and audio. Use the play
                        button on the video player above to hear your performance.
                        {video && (
                          <>
                            <br />
                            <small>Video URL: {video.substring(0, 50)}...</small>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Download Video
                </CardTitle>
                <CardDescription>Secure your performance with a one-time payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">R50</div>
                  <p className="text-sm text-gray-600">One-time download fee</p>
                </div>

                {paymentStatus === "pending" && (
                  <Button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {getPaymentButtonText()}
                  </Button>
                )}

                {paymentStatus === "processing" && (
                  <Button disabled className="w-full" size="lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {getPaymentButtonText()}
                  </Button>
                )}

                {paymentStatus === "completed" && (
                  <Button onClick={downloadVideo} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Download Video
                  </Button>
                )}

                {paymentStatus === "failed" && (
                  <Button onClick={handlePayment} className="w-full bg-red-600 hover:bg-red-700" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {getPaymentButtonText()}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Cloud Storage:</strong> Your video will be available for download for 7 days after payment.
                After this period, the video will be permanently deleted from our servers.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> If your device is wiped and the 7-day period expires, you will lose access
                to your video and forfeit the R50 payment.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                You will be redirected to YoCo's secure payment platform to complete your R50 payment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Payment Details:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Amount: R50.00</li>
                  <li>• Service: Karaoke Video Download</li>
                  <li>• Payment Method: YoCo Secure Payment</li>
                  <li>• Video Access: 7 days from payment</li>
                </ul>
              </div>
              <div className="flex space-x-2">
                <Button onClick={processPayment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Proceed to Payment
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What you get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong>High Quality Video</strong>
                  <p className="text-gray-600">Full HD recording of your performance</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong>Direct Download</strong>
                  <p className="text-gray-600">Video downloads directly to your device</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong>7-Day Access</strong>
                  <p className="text-gray-600">Re-download within 7 days if needed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
