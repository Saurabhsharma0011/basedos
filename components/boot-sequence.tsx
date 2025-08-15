"use client"

import { useState, useEffect } from "react"

interface BootSequenceProps {
  isComplete: boolean
}

export function BootSequence({ isComplete }: BootSequenceProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const bootLines = [
    "BasedOS", // Updated from baseOS to BasedOS
    "Version 1.0.0",
    "",
    "Initializing system components...",
    "✓ Loading core modules",
    "✓ Configuring memory management",
    "✓ Starting graphics engine",
    "✓ Initializing audio subsystem",
    "✓ Loading desktop environment",
    "✓ Preparing user interface",
    "✓ System optimization complete",
    "",
    "Welcome to BasedOS!", // Updated from baseOS to BasedOS
  ]

  useEffect(() => {
    if (currentLine < bootLines.length) {
      const timer = setTimeout(() => {
        setCurrentLine((prev) => prev + 1)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentLine, bootLines.length])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <div className="h-full w-full bg-white text-gray-800 font-mono-pixel text-sm flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {bootLines[0] && currentLine >= 1 ? bootLines[0] : ""}
          </h1>
          <div className="text-gray-600">{bootLines[1] && currentLine >= 2 ? bootLines[1] : ""}</div>
        </div>

        <div className="text-left space-y-2">
          {bootLines.slice(3, currentLine).map((line, index) => (
            <div key={index + 3} className="text-gray-700">
              {line}
            </div>
          ))}
          {currentLine >= 3 && currentLine < bootLines.length && (
            <div className="text-gray-700">
              {bootLines[currentLine]}
              {showCursor && <span className="bg-gray-800 text-white ml-1">_</span>}
            </div>
          )}
        </div>

        {currentLine >= bootLines.length - 1 && (
          <div className="mt-8 text-center">
            <div className="text-xl font-semibold text-gray-900">{bootLines[bootLines.length - 1]}</div>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="absolute bottom-8 text-center animate-pulse">
          <div className="text-gray-600">Press any key to continue...</div>
        </div>
      )}
    </div>
  )
}
