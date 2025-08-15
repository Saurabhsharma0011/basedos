"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Track {
  id: string
  title: string
  artist: string
  duration: string
  filename: string
  file?: File
  url?: string
}

export function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([
    { id: "1", title: "Pixel Dreams", artist: "Retro Synth", duration: "3:42", filename: "pixel_dreams.wav" },
    { id: "2", title: "8-Bit Adventure", artist: "Chip Master", duration: "2:58", filename: "8bit_adventure.mid" },
    {
      id: "3",
      title: "Digital Nostalgia",
      artist: "Vintage Beats",
      duration: "4:15",
      filename: "digital_nostalgia.wav",
    },
    { id: "4", title: "System Boot", artist: "OS Sounds", duration: "0:12", filename: "system_boot.wav" },
    { id: "5", title: "Modem Connection", artist: "Dial-Up Era", duration: "0:45", filename: "modem_connect.wav" },
  ])

  const [currentTrack, setCurrentTrack] = useState<Track | null>(playlist[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      const current = audio.currentTime
      const total = audio.duration
      setCurrentTime(formatTime(current))
      setDuration(formatTime(total))
      setProgress((current / total) * 100)
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        nextTrack()
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration))
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [isRepeat])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file)
        const newTrack: Track = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          artist: "Local File",
          duration: "0:00", // Will be updated when loaded
          filename: file.name,
          file: file,
          url: url,
        }
        setPlaylist((prev) => [...prev, newTrack])
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setCurrentTime("0:00")
    setProgress(0)

    if (audioRef.current) {
      if (track.url) {
        audioRef.current.src = track.url
      } else {
        audioRef.current.src = `/placeholder-audio.mp3` // This would be a placeholder
      }
      audioRef.current.load()
    }

    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime("0:00")
    setProgress(0)
  }

  const nextTrack = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id)
    let nextIndex

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length)
    } else {
      nextIndex = (currentIndex + 1) % playlist.length
    }

    playTrack(playlist[nextIndex])
  }

  const previousTrack = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    playTrack(playlist[prevIndex])
  }

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack) return

    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * audioRef.current.duration

    audioRef.current.currentTime = newTime
    setProgress(percentage * 100)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const removeTrack = (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId))
    if (currentTrack?.id === trackId) {
      stopTrack()
      setCurrentTrack(null)
    }
  }

  return (
    <div className="h-full flex flex-col font-pixel text-xs">
      <audio ref={audioRef} />

      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFileUpload} className="hidden" />

      <div className="border-b border-pixel-black bg-pixel-black text-pixel-green p-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {currentTrack ? (
              <div>
                <div className="text-sm font-pixel text-pixel-yellow">{isPlaying ? "♪ NOW PLAYING ♪" : "⏸ PAUSED"}</div>
                <div className="mt-1">
                  <div className="text-pixel-green">{currentTrack.title}</div>
                  <div className="text-pixel-white text-xs">{currentTrack.artist}</div>
                </div>
              </div>
            ) : (
              <div className="text-pixel-gray">No track selected</div>
            )}
          </div>

          <div className="text-right">
            <div className="text-pixel-yellow">
              {currentTime} / {duration}
            </div>
            <div className="text-pixel-white text-xs">{currentTrack?.filename || ""}</div>
          </div>
        </div>

        <div className="mt-2 bg-pixel-gray h-1 relative cursor-pointer" onClick={handleProgressClick}>
          <div className="bg-pixel-green h-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 border-r border-pixel-black">
          <div className="border-b border-pixel-black bg-pixel-cream p-1 flex items-center justify-between">
            <div className="font-pixel text-sm">Playlist ({playlist.length} tracks)</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-pixel-blue text-pixel-white border border-pixel-black hover:bg-blue-600 text-xs"
              title="Upload Music Files"
            >
              📁 Upload
            </button>
          </div>

          <div className="overflow-auto h-[calc(100%-32px)]">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`p-2 cursor-pointer hover:bg-pixel-blue hover:text-pixel-white border-b border-pixel-gray group ${
                  currentTrack?.id === track.id ? "bg-pixel-blue text-pixel-white" : ""
                }`}
                onClick={() => playTrack(track)}
                onDoubleClick={() => playTrack(track)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 text-right text-pixel-gray">{String(index + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <div className="font-pixel">{track.title}</div>
                      <div className="text-xs text-pixel-gray">{track.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-pixel-gray">{track.duration}</div>
                    {track.file && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTrack(track.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 bg-pixel-red text-pixel-white text-xs hover:bg-red-600 flex items-center justify-center"
                        title="Remove track"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-48 bg-pixel-cream">
          <div className="border-b border-pixel-black p-2">
            <div className="font-pixel text-sm mb-2">Transport</div>
            <div className="flex justify-center gap-1">
              <button
                className="w-8 h-8 border border-pixel-black bg-pixel-white hover:bg-pixel-cream flex items-center justify-center text-sm"
                onClick={previousTrack}
                title="Previous"
              >
                ⏮
              </button>
              <button
                className="w-8 h-8 border border-pixel-black bg-pixel-white hover:bg-pixel-cream flex items-center justify-center text-sm"
                onClick={togglePlayPause}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="w-8 h-8 border border-pixel-black bg-pixel-white hover:bg-pixel-cream flex items-center justify-center text-sm"
                onClick={stopTrack}
                title="Stop"
              >
                ⏹
              </button>
              <button
                className="w-8 h-8 border border-pixel-black bg-pixel-white hover:bg-pixel-cream flex items-center justify-center text-sm"
                onClick={nextTrack}
                title="Next"
              >
                ⏭
              </button>
            </div>
          </div>

          <div className="border-b border-pixel-black p-2">
            <div className="font-pixel text-sm mb-2">Volume: {volume}%</div>
            <div className="flex items-center gap-1">
              <span className="text-xs">🔇</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs">🔊</span>
            </div>
            <div className="mt-1 bg-pixel-white border border-pixel-black h-3 relative">
              <div className="bg-pixel-green h-full" style={{ width: `${volume}%` }}></div>
            </div>
          </div>

          <div className="border-b border-pixel-black p-2">
            <div className="font-pixel text-sm mb-2">Options</div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isRepeat}
                  onChange={(e) => setIsRepeat(e.target.checked)}
                  className="border border-pixel-black"
                />
                🔁 Repeat
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isShuffle}
                  onChange={(e) => setIsShuffle(e.target.checked)}
                  className="border border-pixel-black"
                />
                🔀 Shuffle
              </label>
            </div>
          </div>

          <div className="p-2">
            <div className="font-pixel text-sm mb-2">Equalizer</div>
            <div className="flex justify-center items-end gap-1 h-16 bg-pixel-black p-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-pixel-green w-2"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    animation: isPlaying ? `pulse ${0.5 + Math.random() * 0.5}s infinite` : "none",
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
