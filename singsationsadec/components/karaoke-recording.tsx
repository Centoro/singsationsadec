"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video, Square, RotateCcw, Play, Pause, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface KaraokeRecordingProps {
  song: {
    id: string
    title: string
    artist: string
    videoUrl: string
  }
  onNext: (recordedVideo: string) => void
  onBack: () => void
}

export default function KaraokeRecording({ song, onNext, onBack }: KaraokeRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionError, setPermissionError] = useState("")
  const [karaokeVideoPlaying, setKaraokeVideoPlaying] = useState(false)
  const [videoLoadError, setVideoLoadError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)

  const karaokeVideoRef = useRef<HTMLVideoElement>(null)
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    requestPermissions()
    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (karaokeVideoRef.current) {
      const video = karaokeVideoRef.current

      const handleLoadStart = () => setVideoLoading(true)
      const handleCanPlay = () => {
        setVideoLoading(false)
        setVideoLoadError(false)
      }
      const handleError = (e: Event) => {
        console.warn(`Failed to load karaoke video for ${song.title}:`, e)
        setVideoLoadError(true)
        setVideoLoading(false)
      }

      video.addEventListener("loadstart", handleLoadStart)
      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("error", handleError)

      return () => {
        video.removeEventListener("loadstart", handleLoadStart)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("error", handleError)
      }
    }
  }, [song.title])

  const requestPermissions = async () => {
    try {
      setPermissionError("")

      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Permission request timeout")), 10000)),
      ])

      streamRef.current = stream
      setHasPermission(true)

      // Display user video preview
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
    } catch (error: any) {
      console.error("Permission denied:", error)

      let errorMessage = "Camera and microphone access is required for recording."

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera and microphone permissions were denied. Please click the camera icon in your browser's address bar and allow access, then try again."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. Please connect a camera and microphone and try again."
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "Camera or microphone is already in use by another application. Please close other apps and try again."
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Camera settings not supported. Trying with basic settings..."
        setTimeout(() => requestBasicPermissions(), 1000)
        return
      } else if (error.message === "Permission request timeout") {
        errorMessage = "Permission request timed out. Please try again and respond to the permission prompt quickly."
      }

      setPermissionError(errorMessage)
    }
  }

  const requestBasicPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream
      setHasPermission(true)

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
    } catch (error: any) {
      console.error("Basic permission request failed:", error)
      setPermissionError("Unable to access camera and microphone. Please check your device settings and try again.")
    }
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
  }

  const startRecording = () => {
    if (!streamRef.current || !hasPermission) {
      alert("Camera and microphone permissions are required")
      return
    }

    const tracks = streamRef.current.getTracks()
    const activeTracks = tracks.filter((track) => track.readyState === "live")

    if (activeTracks.length === 0) {
      alert("Camera and microphone are not active. Please refresh and try again.")
      return
    }

    try {
      recordedChunksRef.current = []

      const stream = streamRef.current

      let mimeType = ""
      const supportedTypes = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm", "video/mp4"]

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      console.log(
        "Recording with format:",
        mediaRecorder.mimeType || "browser default",
        "active tracks:",
        activeTracks.length,
      )

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size)
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || "video/webm"
        const blob = new Blob(recordedChunksRef.current, { type: finalMimeType })

        console.log("Recording completed:", {
          size: blob.size,
          type: blob.type,
          chunks: recordedChunksRef.current.length,
          mimeType: mediaRecorder.mimeType,
        })

        if (blob.size > 0) {
          setRecordedBlob(blob)
        } else {
          console.error("Recording failed: empty blob")
          alert(
            "Recording failed - no data captured. Please ensure your camera and microphone are working and try again.",
          )
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        alert("Recording error occurred. Please try again.")
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Request data every 1 second
      setIsRecording(true)
      setRecordingTime(0)

      if (karaokeVideoRef.current && !videoLoadError) {
        karaokeVideoRef.current.currentTime = 0
        karaokeVideoRef.current.play().catch((e) => {
          console.warn("Failed to play karaoke video:", e)
        })
        setKaraokeVideoPlaying(true)
      }

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Recording failed:", error)
      alert("Recording failed. Please check your camera and microphone permissions and try again.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 1) {
        alert("Please record for at least 1 second before stopping.")
        return
      }

      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop karaoke video
      if (karaokeVideoRef.current) {
        karaokeVideoRef.current.pause()
        setKaraokeVideoPlaying(false)
      }

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const restartRecording = () => {
    stopRecording()
    setRecordedBlob(null)
    setRecordingTime(0)

    // Reset karaoke video
    if (karaokeVideoRef.current) {
      karaokeVideoRef.current.currentTime = 0
      karaokeVideoRef.current.pause()
      setKaraokeVideoPlaying(false)
    }
  }

  const toggleKaraokeVideo = () => {
    if (karaokeVideoRef.current && !videoLoadError) {
      if (karaokeVideoPlaying) {
        karaokeVideoRef.current.pause()
        setKaraokeVideoPlaying(false)
      } else {
        karaokeVideoRef.current.play().catch((e) => {
          console.warn("Failed to play karaoke video:", e)
        })
        setKaraokeVideoPlaying(true)
      }
    }
  }

  const proceedToDownload = () => {
    if (recordedBlob) {
      const videoUrl = URL.createObjectURL(recordedBlob)
      console.log("Created video URL:", videoUrl, "Blob size:", recordedBlob.size)
      onNext(videoUrl)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {permissionError || "Requesting camera and microphone permissions..."}
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button onClick={requestPermissions} className="w-full">
                {permissionError ? "Try Again" : "Grant Permissions"}
              </Button>
              {permissionError && (
                <Button onClick={requestBasicPermissions} variant="outline" className="w-full bg-transparent">
                  Try Basic Settings
                </Button>
              )}
              <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
                Go Back
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Allow camera and microphone when prompted</li>
                <li>• Check if other apps are using your camera</li>
                <li>• Try refreshing the page if permissions fail</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4">
      <div className="max-w-6xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold">{song.title}</h1>
            <p className="text-white/90">by {song.artist}</p>
          </div>
          <div className="text-white text-right">
            {isRecording && (
              <div className="text-lg font-mono">
                <span className="text-red-400">● REC</span> {formatTime(recordingTime)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Karaoke Video */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Karaoke Video</h3>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {videoLoadError ? (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                      <p className="text-lg font-medium mb-2">Karaoke Video Unavailable</p>
                      <p className="text-sm text-gray-300">You can still record your performance</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={karaokeVideoRef}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onEnded={() => setKaraokeVideoPlaying(false)}
                      preload="metadata"
                    >
                      <source src={song.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Loading video...</p>
                        </div>
                      </div>
                    )}
                    {!isRecording && !videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={toggleKaraokeVideo}
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white"
                        >
                          {karaokeVideoPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Recording */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={userVideoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  autoPlay
                  muted
                  playsInline
                />
                {isRecording && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      RECORDING
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recording Controls */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              {!isRecording && !recordedBlob && (
                <Button onClick={startRecording} size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                  <Video className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <>
                  <Button onClick={stopRecording} size="lg" className="bg-gray-600 hover:bg-gray-700 text-white px-8">
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                  <Button onClick={restartRecording} size="lg" variant="outline" className="px-8 bg-transparent">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Restart
                  </Button>
                </>
              )}

              {recordedBlob && !isRecording && (
                <div className="flex items-center space-x-4">
                  <Button onClick={restartRecording} size="lg" variant="outline" className="px-8 bg-transparent">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Record Again
                  </Button>
                  <Button
                    onClick={proceedToDownload}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    Continue to Download
                  </Button>
                </div>
              )}
            </div>

            {recordedBlob && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-medium">Recording completed! Duration: {formatTime(recordingTime)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Recording Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click "Start Recording" to begin your performance</li>
              <li>
                •{" "}
                {videoLoadError
                  ? "Sing along to your chosen song"
                  : "The karaoke video will play automatically when recording starts"}
              </li>
              <li>• Sing along while looking at the camera</li>
              <li>• Click "Stop Recording" when finished, or "Restart" to try again</li>
              <li>• Your recording includes both video and audio</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
