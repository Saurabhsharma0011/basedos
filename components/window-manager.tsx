"use client"

import { useRef } from "react"
import { useState } from "react"
import React from "react"
import { DexScreener } from "@/components/dexscreener"
import { FileManager } from "@/components/file-manager"
import { Terminal } from "@/components/terminal"
import { Notes } from "@/components/notes"
import { Settings } from "@/components/settings"
import { MusicPlayer } from "@/components/music-player"
import { Tetris } from "@/components/tetris"
import { PixelRunner } from "@/components/pixel-runner"

interface WindowManagerProps {
  openWindows: string[]
  activeWindow: string | null
  onClose: (appId: string) => void
  onFocus: (appId: string) => void
  onMinimize: (appId: string) => void
  onMaximize: (appId: string) => void
  minimizedWindows: string[]
  maximizedWindows: string[]
}

export function WindowManager({
  openWindows,
  activeWindow,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  minimizedWindows,
  maximizedWindows,
}: WindowManagerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {openWindows.map((appId) => (
        <Window
          key={appId}
          appId={appId}
          isActive={activeWindow === appId}
          isMinimized={minimizedWindows.includes(appId)}
          isMaximized={maximizedWindows.includes(appId)}
          onClose={() => onClose(appId)}
          onFocus={() => onFocus(appId)}
          onMinimize={() => onMinimize(appId)}
          onMaximize={() => onMaximize(appId)}
        />
      ))}
    </div>
  )
}

interface WindowProps {
  appId: string
  isActive: boolean
  isMinimized: boolean
  isMaximized: boolean
  onClose: () => void
  onFocus: () => void
  onMinimize: () => void
  onMaximize: () => void
}

function Window({ appId, isActive, isMinimized, isMaximized, onClose, onFocus, onMinimize, onMaximize }: WindowProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [previousSize, setPreviousSize] = useState({ width: 600, height: 500 })
  const [previousPosition, setPreviousPosition] = useState({ x: 50, y: 50 })
  const windowRef = useRef<HTMLDivElement>(null)

  const appTitles: Record<string, string> = {
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains("drag-handle") || target.closest(".drag-handle")) {
      console.log("[v0] Starting drag for window:", appId)
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
      onFocus()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowRef.current) {
      const windowWidth = windowRef.current.offsetWidth
      const windowHeight = windowRef.current.offsetHeight

      const newX = Math.max(0, Math.min(window.innerWidth - windowWidth, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - windowHeight, e.clientY - dragOffset.y))

      console.log("[v0] Dragging window to:", { x: newX, y: newY })
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      console.log("[v0] Ending drag for window:", appId)
      setIsDragging(false)
    }
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, position])

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreviousPosition(position)
      setPreviousSize({ width: 600, height: 500 })
    } else {
      setPosition(previousPosition)
    }
    onMaximize()
  }

  const windowStyle = isMaximized
    ? {
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 32px)", // Account for taskbar
      }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${previousSize.width}px`,
        height: `${previousSize.height}px`,
      }

  if (isMinimized) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={`
        absolute pointer-events-auto
        ${isActive ? "z-10" : "z-0"}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
      style={windowStyle}
      onClick={onFocus}
    >
      <div
        className={`
        h-full bg-pixel-cream border-2 border-pixel-black shadow-lg
        ${isActive ? "" : "opacity-90"}
      `}
      >
        {/* Title Bar */}
        <div
          className={`
          h-6 flex items-center justify-between px-1 cursor-grab drag-handle
          ${isActive ? "bg-pixel-blue text-pixel-white" : "bg-pixel-gray text-pixel-black"}
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          ${isMaximized ? "cursor-default" : ""}
        `}
          onMouseDown={!isMaximized ? handleMouseDown : undefined}
        >
          <div className="flex items-center gap-1 pointer-events-none drag-handle">
            <span className="text-xs">{appIcons[appId]}</span>
            <span className="text-xs font-pixel">{appTitles[appId]}</span>
          </div>
          <div className="flex gap-1">
            <button
              className="w-4 h-4 bg-pixel-yellow border border-pixel-black text-pixel-black text-xs font-pixel hover:bg-yellow-400 flex items-center justify-center pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                onMinimize()
              }}
              title="Minimize"
            >
              −
            </button>
            <button
              className="w-4 h-4 bg-pixel-green border border-pixel-black text-pixel-black text-xs font-pixel hover:bg-green-400 flex items-center justify-center pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                handleMaximize()
              }}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "⧉" : "□"}
            </button>
            <button
              className="w-4 h-4 bg-pixel-red border border-pixel-black text-pixel-white text-xs font-pixel hover:bg-red-600 flex items-center justify-center pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="h-[calc(100%-24px)] p-2 bg-pixel-white">
          <WindowContent appId={appId} />
        </div>
      </div>
    </div>
  )
}

function WindowContent({ appId }: { appId: string }) {
  switch (appId) {
    case "file-manager":
      return (
        <div className="h-full -m-2">
          <FileManager />
        </div>
      )
    case "terminal":
      return (
        <div className="h-full -m-2">
          <Terminal />
        </div>
      )
    case "notes":
      return (
        <div className="h-full -m-2">
          <Notes />
        </div>
      )
    case "music":
      return (
        <div className="h-full -m-2">
          <MusicPlayer />
        </div>
      )
    case "tetris":
      return (
        <div className="h-full -m-2">
          <Tetris />
        </div>
      )
    case "pixel-runner":
      return (
        <div className="h-full -m-2">
          <PixelRunner />
        </div>
      )
    case "settings":
      return (
        <div className="h-full -m-2">
          <Settings />
        </div>
      )
    case "dexscreener":
      return (
        <div className="h-full -m-2">
          <DexScreener />
        </div>
      )
    default:
      return <div>Unknown application</div>
  }
}
