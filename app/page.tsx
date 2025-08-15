"use client"

import { useState, useEffect } from "react"
import { BootSequence } from "@/components/boot-sequence"
import { AuthScreen } from "@/components/auth-screen"
import { Desktop } from "@/components/desktop"

export default function RetroPixelOS() {
  const [isBooting, setIsBooting] = useState(true)
  const [bootComplete, setBootComplete] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    // Boot sequence duration
    const bootTimer = setTimeout(() => {
      setBootComplete(true)
      setTimeout(() => {
        setIsBooting(false)
      }, 500)
    }, 4000)

    return () => clearTimeout(bootTimer)
  }, [])

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  return (
    <div className="h-screen w-screen bg-pixel-cream overflow-hidden pixel-cursor-default">
      {isBooting ? (
        <BootSequence isComplete={bootComplete} />
      ) : !isAuthenticated ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <Desktop />
      )}
    </div>
  )
}
