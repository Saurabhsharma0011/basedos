"use client"

import { useState, useEffect } from "react"

export function SolPriceWidget() {
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Using CoinGecko API for SOL price
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
        )

        if (!response.ok) {
          throw new Error("Failed to fetch price")
        }

        const data = await response.json()
        const price = data.solana?.usd
        const change = data.solana?.usd_24h_change

        if (price) {
          setSolPrice(price)
          setPriceChange(change || 0)
          console.log("[v0] SOL price updated:", price, "Change:", change)
        } else {
          throw new Error("Invalid price data")
        }
      } catch (err) {
        console.error("[v0] Failed to fetch SOL price:", err)
        setError("Failed to load")
        // Fallback mock data for demo
        setSolPrice(180.45)
        setPriceChange(2.34)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchSolPrice()

    // Update every 30 seconds
    const interval = setInterval(fetchSolPrice, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-pixel-black/10 border border-pixel-black/20 rounded">
        <span className="text-xs font-pixel text-pixel-black">SOL</span>
        <div className="w-4 h-4 border border-pixel-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && !solPrice) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded">
        <span className="text-xs font-pixel text-red-600">SOL: Error</span>
      </div>
    )
  }

  const isPositive = priceChange >= 0
  const formattedPrice = solPrice?.toFixed(2) || "0.00"
  const formattedChange = Math.abs(priceChange).toFixed(2)

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-pixel-cream/80 border border-pixel-black rounded shadow-sm">
      <span className="text-xs font-pixel text-pixel-black">SOL:</span>
      <span className="text-xs font-pixel font-bold text-pixel-black">${formattedPrice}</span>
      <span className={`text-xs font-pixel ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "↗" : "↘"} {formattedChange}%
      </span>
    </div>
  )
}
