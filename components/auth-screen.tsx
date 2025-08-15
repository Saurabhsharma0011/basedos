"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface AuthScreenProps {
  onLogin: (username: string) => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        username,
        password, // In production, never store plain text passwords
        createdAt: new Date().toISOString(),
        loginType: isLogin ? "login" : "register",
      }

      // Save to localStorage
      localStorage.setItem("BasedOS_user", JSON.stringify(userData)) // Updated localStorage key from baseOS_user to BasedOS_user
      localStorage.setItem("BasedOS_isLoggedIn", "true") // Updated localStorage key from baseOS_isLoggedIn to BasedOS_isLoggedIn

      console.log("[v0] User data saved to localStorage:", { username, loginType: userData.loginType })
    } catch (error) {
      console.error("[v0] Failed to save to localStorage:", error)
    }

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false)
      onLogin(username)
    }, 1500)
  }

  return (
    <>
      <style jsx>{`
        .button-3d {
          padding: 0.1em 0.25em;
          background-color: #1f2937;
          border: 0.08em solid #fff;
          border-radius: 0.3em;
          cursor: pointer;
          position: relative;
        }
        
        .button-3d:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .button-3d-inner {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          bottom: 0.4em;
          background-color: #1f2937;
          border-radius: 0.2em;
          color: #fff;
          border: 0.08em solid #fff;
          box-shadow: 0 0.4em 0.1em 0.019em #fff;
          transition: all 0.5s ease;
          padding: 0.75em 1em;
          font-family: monospace;
          font-weight: bold;
        }
        
        .button-3d:hover:not(:disabled) .button-3d-inner {
          transform: translate(0, 0.4em);
          box-shadow: 0 0 0 0 #fff;
        }
        
        .button-3d:not(:hover) .button-3d-inner {
          transition: all 1s ease;
        }
        
        .link-button-3d {
          position: relative;
          display: inline-block;
          padding: 0.1em 0.25em;
          background-color: transparent;
          border: 0.08em solid #6b7280;
          border-radius: 0.3em;
          cursor: pointer;
          text-decoration: none;
        }
        
        .link-button-3d:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .link-button-3d-inner {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          bottom: 0.3em;
          background-color: transparent;
          border-radius: 0.2em;
          color: #6b7280;
          border: 0.08em solid #6b7280;
          box-shadow: 0 0.3em 0.1em 0.019em #6b7280;
          transition: all 0.5s ease;
          padding: 0.5em 0.75em;
          font-family: monospace;
          text-decoration: underline;
        }
        
        .link-button-3d:hover:not(:disabled) .link-button-3d-inner {
          transform: translate(0, 0.3em);
          box-shadow: 0 0 0 0 #6b7280;
          color: #374151;
        }
        
        .link-button-3d:not(:hover) .link-button-3d-inner {
          transition: all 1s ease;
        }
      `}</style>

      <div className="h-screen w-screen bg-pixel-cream flex items-center justify-center relative overflow-hidden">
        {/* Retro grid background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="w-full h-full animate-scanlines opacity-20"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-pixel-dark mb-2 font-mono tracking-wider">BasedOS</h1>{" "}
            {/* Updated from baseOS to BasedOS */}
            <div className="text-sm text-pixel-dark/70 font-mono">{isLogin ? "SYSTEM LOGIN" : "CREATE ACCOUNT"}</div>
            <div className="mt-2 text-xs text-pixel-dark/50 font-mono">v1.0.0 - {new Date().getFullYear()}</div>
          </div>

          {/* Login Form */}
          <div className="bg-white border-2 border-pixel-dark shadow-lg">
            {/* Title bar */}
            <div className="bg-pixel-dark text-white px-3 py-2 font-mono text-sm flex items-center justify-between">
              <span>{isLogin ? "LOGIN.EXE" : "REGISTER.EXE"}</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-400 border border-gray-600"></div>
                <div className="w-3 h-3 bg-gray-400 border border-gray-600"></div>
                <div className="w-3 h-3 bg-gray-400 border border-gray-600"></div>
              </div>
            </div>

            {/* Form content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-pixel-dark mb-1">USERNAME:</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="font-mono text-sm border-2 border-pixel-dark focus:border-pixel-dark focus:ring-0"
                    placeholder="Enter username"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-pixel-dark mb-1">PASSWORD:</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono text-sm border-2 border-pixel-dark focus:border-pixel-dark focus:ring-0"
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-mono text-pixel-dark mb-1">CONFIRM PASSWORD:</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="font-mono text-sm border-2 border-pixel-dark focus:border-pixel-dark focus:ring-0"
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <button type="submit" disabled={isLoading || !username || !password} className="w-full button-3d">
                    <div className="button-3d-inner">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white font-mono font-bold">
                            {isLogin ? "LOGGING IN..." : "CREATING ACCOUNT..."}
                          </span>
                        </span>
                      ) : (
                        <span className="text-white font-mono font-bold text-base">
                          {isLogin ? "LOGIN" : "CREATE ACCOUNT"}
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="link-button-3d"
                      disabled={isLoading}
                    >
                      <div className="link-button-3d-inner">
                        {isLogin ? "Need an account? Register here" : "Already have an account? Login here"}
                      </div>
                    </button>
                  </div>
                </div>
              </form>

              {/* System info */}
              <div className="mt-6 pt-4 border-t border-pixel-dark/20">
                <div className="text-xs font-mono text-pixel-dark/50 space-y-1">
                  <div>SYSTEM: BasedOS v1.0.0</div> {/* Updated from baseOS to BasedOS */}
                  <div>STATUS: READY</div>
                  <div>TIME: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs font-mono text-pixel-dark/50">
            © {new Date().getFullYear()} BasedOS Corporation. All rights reserved.{" "}
            {/* Updated from baseOS to BasedOS */}
          </div>
        </div>
      </div>
    </>
  )
}
