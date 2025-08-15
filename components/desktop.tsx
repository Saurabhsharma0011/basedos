"use client"

import { useState, useEffect } from "react"
import { Taskbar } from "@/components/taskbar"
import { WindowManager } from "@/components/window-manager"
import { SolPriceWidget } from "@/components/sol-price-widget"

interface DesktopIconProps {
  icon: string
  label: string
  onDoubleClick: () => void
}

function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <div
      className={`
        w-16 h-20 flex flex-col items-center justify-center cursor-pointer
        ${isSelected ? "bg-pixel-blue bg-opacity-20" : ""}
        hover:bg-pixel-blue hover:bg-opacity-10
        border border-transparent
        ${isSelected ? "border-pixel-blue border-dashed" : ""}
      `}
      onClick={() => setIsSelected(!isSelected)}
      onDoubleClick={onDoubleClick}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-pixel text-center text-pixel-black leading-tight">{label}</div>
    </div>
  )
}

export function Desktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([])
  const [maximizedWindows, setMaximizedWindows] = useState<string[]>([])
  const [wallpaper, setWallpaper] = useState<string>("default")

  const getWallpaperStyle = (wallpaperId: string) => {
    console.log("[v0] Converting wallpaper ID to style:", wallpaperId)
    switch (wallpaperId) {
      case "gradient-blue":
        return "linear-gradient(45deg, #4a90e2, #7bb3f0)"
      case "gradient-sunset":
        return "linear-gradient(45deg, #ff6b6b, #ffa726)"
      case "gradient-forest":
        return "linear-gradient(45deg, #4caf50, #81c784)"
      case "pattern-dots":
        return "radial-gradient(circle, #333 1px, transparent 1px)"
      case "pattern-grid":
        return "linear-gradient(90deg, #ddd 1px, transparent 1px), linear-gradient(180deg, #ddd 1px, transparent 1px)"
      case "solid-teal":
        return "linear-gradient(0deg, #008080, #008080)"
      case "solid-purple":
        return "linear-gradient(0deg, #800080, #800080)"
      case "desert-dino":
        return "url('/images/desert-dino-wallpaper.png')"
      case "clean-desert-dino":
        return "url('/images/clean-desert-dino.png')"
      default:
        return "linear-gradient(45deg, #c0c0c0, #e0e0e0)"
    }
  }

  useEffect(() => {
    const savedWallpaper = localStorage.getItem("BasedOS_wallpaper")
    console.log("[v0] Loading saved wallpaper from localStorage:", savedWallpaper)
    if (savedWallpaper) {
      setWallpaper(savedWallpaper)
    }

    const handleWallpaperChange = () => {
      console.log("[v0] Wallpaper change event received")
      const newWallpaper = localStorage.getItem("BasedOS_wallpaper")
      console.log("[v0] New wallpaper from localStorage:", newWallpaper)
      if (newWallpaper) {
        setWallpaper(newWallpaper)
      }
    }

    window.addEventListener("storage", handleWallpaperChange)
    window.addEventListener("wallpaperChanged", handleWallpaperChange)

    return () => {
      window.removeEventListener("storage", handleWallpaperChange)
      window.removeEventListener("wallpaperChanged", handleWallpaperChange)
    }
  }, [])

  const openApp = (appId: string) => {
    if (!openWindows.includes(appId)) {
      setOpenWindows((prev) => [...prev, appId])
    }
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
    setActiveWindow(appId)
  }

  const closeApp = (appId: string) => {
    setOpenWindows((prev) => prev.filter((id) => id !== appId))
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
    setMaximizedWindows((prev) => prev.filter((id) => id !== appId))
    if (activeWindow === appId) {
      const remaining = openWindows.filter((id) => id !== appId)
      setActiveWindow(remaining.length > 0 ? remaining[remaining.length - 1] : null)
    }
  }

  const focusWindow = (appId: string) => {
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
    setActiveWindow(appId)
  }

  const minimizeWindow = (appId: string) => {
    setMinimizedWindows((prev) => [...prev, appId])
    if (activeWindow === appId) {
      const remaining = openWindows.filter((id) => id !== appId && !minimizedWindows.includes(id))
      setActiveWindow(remaining.length > 0 ? remaining[remaining.length - 1] : null)
    }
  }

  const maximizeWindow = (appId: string) => {
    if (maximizedWindows.includes(appId)) {
      setMaximizedWindows((prev) => prev.filter((id) => id !== appId))
    } else {
      setMaximizedWindows((prev) => [...prev, appId])
    }
    setActiveWindow(appId)
  }

  const wallpaperStyle = getWallpaperStyle(wallpaper)
  console.log("[v0] Applying wallpaper style:", wallpaperStyle)

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage: wallpaperStyle,
        backgroundSize:
          wallpaper.includes("pattern") || wallpaper === "clean-desert-dino"
            ? "10px 10px"
            : wallpaper === "desert-dino"
              ? "cover"
              : "cover",
        backgroundRepeat: wallpaper.includes("pattern") ? "repeat" : "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-8 bg-pixel-gray/90 border-b border-pixel-black/20 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-pixel text-pixel-black font-bold">BasedOS</span>
          <span className="text-xs font-pixel text-pixel-black/60">v1.0.0</span>
        </div>
        <SolPriceWidget />
      </div>

      {/* Base grid pattern */}
      <div
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23222222' fillOpacity='0.15' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='23' cy='3' r='1'/%3E%3Ccircle cx='3' cy='23' r='1'/%3E%3Ccircle cx='23' cy='23' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanlines effect */}
      <div
        className="absolute inset-0 opacity-3 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%)`,
          backgroundSize: "100% 4px",
        }}
      />

      {/* Retro geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23222222' strokeWidth='0.5' strokeOpacity='0.1'%3E%3Cpath d='M0 0h80v80H0z'/%3E%3Cpath d='M20 0v80M40 0v80M60 0v80M0 20h80M0 40h80M0 60h80'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0,0,0,0.1) 100%)`,
        }}
      />

      {/* Retro computer terminal-style corner accent */}
      <div className="absolute top-4 right-4 opacity-10">
        <div className="w-16 h-16 border-2 border-pixel-black border-dashed"></div>
      </div>

      {/* Subtle animated scanline */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none animate-pulse"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(34,34,34,0.1) 50%, transparent 100%)`,
          animation: "scanline 8s linear infinite",
        }}
      />

      {/* Desktop Icons */}
      <div className="absolute top-12 left-4 space-y-4">
        <DesktopIcon icon="📁" label="My Files" onDoubleClick={() => openApp("file-manager")} />
        <DesktopIcon icon="💻" label="Terminal" onDoubleClick={() => openApp("terminal")} />
        <DesktopIcon icon="📝" label="Notes" onDoubleClick={() => openApp("notes")} />
        <DesktopIcon icon="🎵" label="Music" onDoubleClick={() => openApp("music")} />
        <DesktopIcon icon="🎮" label="Tetris" onDoubleClick={() => openApp("tetris")} />
        <DesktopIcon icon="🏃" label="Pixel Runner" onDoubleClick={() => openApp("pixel-runner")} />
        <DesktopIcon icon="⚙️" label="Settings" onDoubleClick={() => openApp("settings")} />
        <DesktopIcon icon="📊" label="DexScreener" onDoubleClick={() => openApp("dexscreener")} />
      </div>

      {/* Window Manager */}
      <WindowManager
        openWindows={openWindows}
        activeWindow={activeWindow}
        onClose={closeApp}
        onFocus={focusWindow}
        onMinimize={minimizeWindow}
        onMaximize={maximizeWindow}
        minimizedWindows={minimizedWindows}
        maximizedWindows={maximizedWindows}
      />

      {/* Taskbar */}
      <Taskbar openWindows={openWindows} activeWindow={activeWindow} onAppClick={focusWindow} onAppOpen={openApp} />
    </div>
  )
}
