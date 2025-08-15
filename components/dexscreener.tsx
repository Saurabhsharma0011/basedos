"use client"

import { useState, useEffect } from "react"

export function DexScreener() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full w-full bg-pixel-white border-2 border-pixel-black">
      {/* Header */}
      <div className="bg-pixel-blue text-pixel-white px-2 py-1 border-b-2 border-pixel-black">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="text-xs font-pixel">DexScreener - Crypto Analytics</span>
        </div>
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="h-[calc(100%-32px)] flex items-center justify-center bg-pixel-cream">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-xs font-pixel text-pixel-black mb-2">Loading DexScreener...</div>
            <div className="w-32 h-2 bg-pixel-gray border border-pixel-black">
              <div className="h-full bg-pixel-blue animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* DexScreener iframe */}
      {!isLoading && (
        <div className="h-[calc(100%-32px)]">
          <iframe
            src="https://dexscreener.com/"
            className="w-full h-full border-none"
            title="DexScreener"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
          />
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-pixel-gray border-t border-pixel-black px-2 py-1">
        <div className="text-xs font-pixel text-pixel-black">DexScreener v1.0 - Real-time crypto analytics</div>
      </div>
    </div>
  )
}
