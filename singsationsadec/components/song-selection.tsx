"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, Square, Check, AlertCircle, User } from "lucide-react"

interface SongSelectionProps {
  onNext: (song: any) => void
  onBack: () => void
  onProfile?: () => void // Added profile navigation prop
}

interface Song {
  id: string
  title: string
  artist: string
  audioUrl: string
  videoUrl: string
}

export default function SongSelection({ onNext, onBack, onProfile }: SongSelectionProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [audioLoadErrors, setAudioLoadErrors] = useState<Set<string>>(new Set())
  const [audioLoading, setAudioLoading] = useState<Set<string>>(new Set())
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const songs: Song[] = [
    {
      id: "adele-one-and-only",
      title: "One and Only",
      artist: "Adele",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsAdele%20-%20One%20and%20Only.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosAdele%20-%20One%20and%20Only.mp4",
    },
    {
      id: "bryan-adams-summer-69",
      title: "Summer Of 69",
      artist: "Bryan Adams",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsBryan%20Adams%20-Summer%20Of%2069.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosBryan%20Adams%20-Summer%20Of%2069.mp4",
    },
    {
      id: "ccr-have-you-ever-seen-rain",
      title: "Have You Ever Seen The Rain",
      artist: "Creedence Clearwater Revival",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsCreedence%20Clearwater%20Revival%20-%20Have%20You%20Ever%20Seen%20The%20Rain.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosCreedence%20Clearwater%20Revival%20-%20Have%20You%20Ever%20Seen%20The%20Rain.mp4",
    },
    {
      id: "dr-victor-wie-se-kind",
      title: "Wie Se Kind Is Jy",
      artist: "Dr Victor & Theuns Jordaan",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsDr%20Victor%20%26%20Theuns%20Jordaan%20-%20Wie%20Se%20Kind%20Is%20Jy.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosDr%20Victor%20%26%20Theuns%20Jordaan%20-%20Wie%20Se%20Kind%20Is%20Jy.mp4",
    },
    {
      id: "lacy-j-dalton-black-coffee",
      title: "Black Coffee",
      artist: "Lacy J Dalton",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsLacy%20J%20Dalton%20-%20Black%20Coffee.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosLacy%20J%20Dalton%20-%20Black%20Coffee.mp4",
    },
    {
      id: "lynyrd-skynyrd-simple-man",
      title: "Simple Man",
      artist: "Lynyrd Skynyrd",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsLynyrd%20Skynyrd%20-%20Simple%20Man.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosLynyrd%20Skynyrd%20-%20Simple%20Man.mp4",
    },
    {
      id: "meredith-brooks-bitch",
      title: "Bitch",
      artist: "Meredith Brooks",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsMeredith%20Brooks%20-%20Bitch.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosMeredith%20Brooks%20-%20Bitch.mp4",
    },
    {
      id: "neil-diamond-sweet-caroline",
      title: "Sweet Caroline",
      artist: "Neil Diamond",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsNeil%20Diamond%20-%20Sweet%20Caroline.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosNeil%20Diamond%20-%20Sweet%20Caroline.mp4",
    },
    {
      id: "taylor-swift-shake-it-off",
      title: "Shake It Off",
      artist: "Taylor Swift",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsTaylor%20Swift%20-%20Shake%20It%20Off.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosTaylor%20Swift%20-%20Shake%20It%20Off.mp4",
    },
    {
      id: "teddy-swims-lose-control",
      title: "Lose Control",
      artist: "Teddy Swims",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsTeddy%20Swims%20-%20Lose%20Control.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosTeddy%20Swims%20-%20Lose%20Control.mp4",
    },
    {
      id: "the-animals-house-of-rising-sun",
      title: "House Of The Rising Sun",
      artist: "The Animals",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsThe%20Animals%20-%20House%20Of%20The%20Rising%20Sun.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosThe%20Animals%20-%20House%20Of%20The%20Rising%20Sun.mp4",
    },
    {
      id: "red-clay-strays-wondering-why",
      title: "Wondering Why",
      artist: "The Red Clay Strays",
      audioUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-songs/o/songsThe%20Red%20Clay%20Strays%20-%20Wondering%20Why.mp3",
      videoUrl:
        "https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/karaoke-videos/o/videosThe%20Red%20Clay%20Strays%20-%20Wondering%20Why.mp4",
    },
  ]

  useEffect(() => {
    songs.forEach((song) => {
      if (!audioRefs.current[song.id]) {
        const audio = new Audio()

        // Set CORS to anonymous to avoid CORS issues
        audio.crossOrigin = "anonymous"

        // Add error handling
        audio.addEventListener("error", (e) => {
          console.warn(`Failed to load audio for ${song.title}:`, e)
          setAudioLoadErrors((prev) => new Set([...prev, song.id]))
          setAudioLoading((prev) => {
            const newSet = new Set(prev)
            newSet.delete(song.id)
            return newSet
          })
        })

        // Add loading state management
        audio.addEventListener("loadstart", () => {
          setAudioLoading((prev) => new Set([...prev, song.id]))
        })

        audio.addEventListener("canplay", () => {
          setAudioLoading((prev) => {
            const newSet = new Set(prev)
            newSet.delete(song.id)
            return newSet
          })
        })

        audio.addEventListener("ended", () => {
          setCurrentlyPlaying(null)
        })

        // Set the source after adding event listeners
        audio.src = song.audioUrl

        audioRefs.current[song.id] = audio
      }
    })

    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [])

  const handlePlay = async (songId: string) => {
    // Stop any currently playing audio
    if (currentlyPlaying && currentlyPlaying !== songId) {
      audioRefs.current[currentlyPlaying]?.pause()
      audioRefs.current[currentlyPlaying].currentTime = 0
    }

    const audio = audioRefs.current[songId]
    if (audio && !audioLoadErrors.has(songId)) {
      try {
        await audio.play()
        setCurrentlyPlaying(songId)
      } catch (error) {
        console.warn(`Failed to play audio for song ${songId}:`, error)
        setAudioLoadErrors((prev) => new Set([...prev, songId]))
      }
    }
  }

  const handlePause = (songId: string) => {
    const audio = audioRefs.current[songId]
    if (audio) {
      audio.pause()
      setCurrentlyPlaying(null)
    }
  }

  const handleStop = (songId: string) => {
    const audio = audioRefs.current[songId]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setCurrentlyPlaying(null)
    }
  }

  const handleSelectSong = (song: Song) => {
    // Stop any playing audio
    if (currentlyPlaying) {
      handleStop(currentlyPlaying)
    }
    setSelectedSong(song)
  }

  const handleProceed = () => {
    if (selectedSong) {
      onNext(selectedSong)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
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

            {selectedSong && (
              <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700 text-white">
                Continue with "{selectedSong.title}"
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Song</h1>
          <p className="text-white/90">Listen to the preview and select the song you want to perform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {songs.map((song) => (
            <Card
              key={song.id}
              className={`transition-all duration-200 ${
                selectedSong?.id === song.id ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-lg"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <CardDescription>{song.artist}</CardDescription>
                  </div>
                  {selectedSong?.id === song.id && <Check className="h-6 w-6 text-green-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {audioLoadErrors.has(song.id) ? (
                      <div className="flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Audio unavailable
                      </div>
                    ) : audioLoading.has(song.id) ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlay(song.id)}
                          disabled={currentlyPlaying === song.id}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePause(song.id)}
                          disabled={currentlyPlaying !== song.id}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStop(song.id)}>
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSelectSong(song)}
                    className={
                      selectedSong?.id === song.id
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    }
                  >
                    {selectedSong?.id === song.id ? "Selected" : "Select"}
                  </Button>
                </div>
                {currentlyPlaying === song.id && (
                  <div className="mt-2 text-sm text-green-600 font-medium">Now Playing...</div>
                )}
                {audioLoadErrors.has(song.id) && (
                  <div className="mt-2 text-xs text-red-600">
                    Preview unavailable, but you can still select this song for karaoke
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedSong && (
          <div className="mt-8 text-center">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Selected Song: {selectedSong.title} by {selectedSong.artist}
                </h3>
                <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700 text-white">
                  Proceed to Recording
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
