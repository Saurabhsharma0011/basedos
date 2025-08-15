"use client"

import { useState, useEffect } from "react"

interface TaskbarProps {
  openWindows: string[]
  activeWindow: string | null
  onAppClick: (appId: string) => void
  onAppOpen: (appId: string) => void
}

export function Taskbar({ openWindows, activeWindow, onAppClick, onAppOpen }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [batteryCharging, setBatteryCharging] = useState(false)
  const [batterySupported, setBatterySupported] = useState(false)
  const [networkStatus, setNetworkStatus] = useState("connected")
  const [volumeLevel, setVolumeLevel] = useState(75)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const initBattery = async () => {
      try {
        if ("getBattery" in navigator) {
          const battery = await (navigator as any).getBattery()
          setBatterySupported(true)

          setBatteryLevel(Math.round(battery.level * 100))
          setBatteryCharging(battery.charging)

          const updateBatteryLevel = () => setBatteryLevel(Math.round(battery.level * 100))
          const updateChargingStatus = () => setBatteryCharging(battery.charging)

          battery.addEventListener("levelchange", updateBatteryLevel)
          battery.addEventListener("chargingchange", updateChargingStatus)

          return () => {
            battery.removeEventListener("levelchange", updateBatteryLevel)
            battery.removeEventListener("chargingchange", updateChargingStatus)
          }
        } else {
          setBatterySupported(false)
          const batteryTimer = setInterval(() => {
            setBatteryLevel((prev) => Math.max(20, prev - Math.random() * 0.1))
          }, 30000)

          return () => clearInterval(batteryTimer)
        }
      } catch (error) {
        console.log("[v0] Battery API not supported, using mock data")
        setBatterySupported(false)
        const batteryTimer = setInterval(() => {
          setBatteryLevel((prev) => Math.max(20, prev - Math.random() * 0.1))
        }, 30000)

        return () => clearInterval(batteryTimer)
      }
    }

    const cleanup = initBattery()

    const networkTimer = setInterval(() => {
      setNetworkStatus((prev) => (Math.random() > 0.95 ? "disconnected" : "connected"))
    }, 10000)

    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn())
      clearInterval(networkTimer)
    }
  }, [])

  const appNames: Record<string, string> = {
    "file-manager": "My Files",
    terminal: "Terminal",
    notes: "Notes",
    music: "Music Player",
    tetris: "Tetris",
    "pixel-runner": "Pixel Runner",
    settings: "Settings",
    dexscreener: "DexScreener",
  }

  const appIcons: Record<string, string> = {
    "file-manager": "📁",
    terminal: "💻",
    notes: "📝",
    music: "🎵",
    tetris: "🎮",
    "pixel-runner": "🏃",
    settings: "⚙️",
    dexscreener: "📊",
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-pixel-gray border-t-2 border-pixel-black flex items-center px-1">
      {/* Start Button */}
      <button
        className={`
          h-6 px-3 text-xs font-pixel border border-pixel-black
          ${showStartMenu ? "bg-pixel-white pressed-button" : "bg-pixel-cream hover:bg-pixel-white"}
          flex items-center gap-1
        `}
        onClick={() => setShowStartMenu(!showStartMenu)}
      >
        <span className="text-sm">🏠</span>
        Start
      </button>

      {/* Start Menu */}
      {showStartMenu && (
        <div className="absolute bottom-8 left-0 w-48 bg-pixel-cream border-2 border-pixel-black shadow-lg">
          <div className="bg-pixel-blue text-pixel-white px-2 py-1 text-xs font-pixel">Programs</div>
          <div className="p-1">
            {Object.entries(appNames).map(([appId, name]) => (
              <button
                key={appId}
                className="w-full text-left px-2 py-1 text-xs font-pixel hover:bg-pixel-blue hover:text-pixel-white flex items-center gap-2"
                onClick={() => {
                  onAppOpen(appId)
                  setShowStartMenu(false)
                }}
              >
                <span>{appIcons[appId]}</span>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="w-px h-4 bg-pixel-black mx-1" />

      {/* Open Applications */}
      <div className="flex-1 flex items-center gap-1">
        {openWindows.map((appId) => (
          <button
            key={appId}
            className={`
              h-6 px-2 text-xs font-pixel border border-pixel-black
              ${activeWindow === appId ? "bg-pixel-white pressed-button" : "bg-pixel-cream hover:bg-pixel-white"}
              flex items-center gap-1 max-w-32 truncate
            `}
            onClick={() => onAppClick(appId)}
          >
            <span className="text-xs">{appIcons[appId]}</span>
            <span className="truncate">{appNames[appId]}</span>
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-2 px-2 relative">
        {/* Network status icon */}
        <button
          className="text-xs hover:bg-pixel-white px-1 rounded relative"
          onMouseEnter={() => setShowTooltip("network")}
          onMouseLeave={() => setShowTooltip(null)}
          onClick={() => setNetworkStatus((prev) => (prev === "connected" ? "disconnected" : "connected"))}
        >
          {networkStatus === "connected" ? "📶" : "📵"}
        </button>

        {/* Volume/sound icon */}
        <button
          className="text-xs hover:bg-pixel-white px-1 rounded relative"
          onMouseEnter={() => setShowTooltip("volume")}
          onMouseLeave={() => setShowTooltip(null)}
          onClick={() => setVolumeLevel((prev) => (prev > 0 ? 0 : 75))}
        >
          {volumeLevel > 50 ? "🔊" : volumeLevel > 0 ? "🔉" : "🔇"}
        </button>

        {/* Battery icon */}
        <button
          className="text-xs hover:bg-pixel-white px-1 rounded relative"
          onMouseEnter={() => setShowTooltip("battery")}
          onMouseLeave={() => setShowTooltip(null)}
          onClick={() => !batterySupported && setBatteryLevel((prev) => Math.min(100, prev + 10))}
        >
          {batteryCharging ? "🔌" : batteryLevel > 75 ? "🔋" : batteryLevel > 25 ? "🪫" : "🔴"}
        </button>

        {/* Tooltips for system tray icons */}
        {showTooltip && (
          <div className="absolute bottom-8 right-0 bg-pixel-black text-pixel-white px-2 py-1 text-xs font-pixel whitespace-nowrap border border-pixel-gray">
            {showTooltip === "network" && `Network: ${networkStatus}`}
            {showTooltip === "volume" && `Volume: ${volumeLevel}%`}
            {showTooltip === "battery" &&
              `Battery: ${Math.round(batteryLevel)}%${batteryCharging ? " (Charging)" : ""}${!batterySupported ? " (Mock)" : ""}`}
          </div>
        )}

        {/* Separator */}
        <div className="w-px h-4 bg-pixel-black" />

        <div className="text-xs font-pixel text-pixel-black">{currentTime}</div>
      </div>
    </div>
  )
}
