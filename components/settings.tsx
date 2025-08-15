"use client"

import { useState, useEffect } from "react"

interface SettingsTab {
  id: string
  label: string
  icon: string
}

export function Settings() {
  const [activeTab, setActiveTab] = useState("display")
  const [volume, setVolume] = useState(75)
  const [resolution, setResolution] = useState("800x600")
  const [colorDepth, setColorDepth] = useState("16-bit")
  const [systemSounds, setSystemSounds] = useState(true)
  const [selectedWallpaper, setSelectedWallpaper] = useState("default")
  const [pendingWallpaper, setPendingWallpaper] = useState("default")

  useEffect(() => {
    const savedWallpaper = localStorage.getItem("BasedOS_wallpaper")
    if (savedWallpaper) {
      setSelectedWallpaper(savedWallpaper)
      setPendingWallpaper(savedWallpaper)
    }
  }, [])

  const playSound = (type: "beep" | "alert" | "chord") => {
    if (!systemSounds) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const masterVolume = volume / 100

    if (type === "beep") {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3 * masterVolume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }

    if (type === "alert") {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + 0.1)
      oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.2)
      oscillator.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + 0.3)
      oscillator.type = "square"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.4 * masterVolume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    }

    if (type === "chord") {
      const frequencies = [261.63, 329.63, 392.0]

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.2 * masterVolume, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)

        oscillator.start(audioContext.currentTime + index * 0.05)
        oscillator.stop(audioContext.currentTime + 0.8)
      })
    }
  }

  const handleWallpaperSelect = (wallpaper: string) => {
    setPendingWallpaper(wallpaper)
  }

  const applyWallpaper = () => {
    setSelectedWallpaper(pendingWallpaper)
    localStorage.setItem("BasedOS_wallpaper", pendingWallpaper)

    window.dispatchEvent(new CustomEvent("wallpaperChanged"))

    const desktop = document.querySelector(".desktop-background") as HTMLElement
    if (desktop) {
      const wallpaperStyle = getWallpaperStyle(pendingWallpaper)
      desktop.style.backgroundImage = wallpaperStyle
      desktop.style.backgroundSize = pendingWallpaper.includes("pattern") ? "10px 10px" : "cover"
      desktop.style.backgroundRepeat = pendingWallpaper.includes("pattern") ? "repeat" : "no-repeat"
      desktop.style.backgroundPosition = "center"
    }
  }

  const getWallpaperStyle = (wallpaper: string) => {
    switch (wallpaper) {
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

  const wallpaperOptions = [
    { id: "default", name: "Default Gray", preview: "#c0c0c0" },
    { id: "gradient-blue", name: "Ocean Blue", preview: "linear-gradient(45deg, #4a90e2, #7bb3f0)" },
    { id: "gradient-sunset", name: "Sunset Orange", preview: "linear-gradient(45deg, #ff6b6b, #ffa726)" },
    { id: "gradient-forest", name: "Forest Green", preview: "linear-gradient(45deg, #4caf50, #81c784)" },
    {
      id: "pattern-dots",
      name: "Dotted Pattern",
      preview: "radial-gradient(circle, #333 1px, transparent 1px), #c0c0c0",
    },
    {
      id: "pattern-grid",
      name: "Grid Pattern",
      preview:
        "linear-gradient(90deg, #ddd 1px, transparent 1px), linear-gradient(180deg, #ddd 1px, transparent 1px), #f0f0f0",
    },
    { id: "solid-teal", name: "Solid Teal", preview: "#008080" },
    { id: "solid-purple", name: "Solid Purple", preview: "#800080" },
    { id: "desert-dino", name: "Desert Dino", preview: "#f5f5dc" },
    { id: "clean-desert-dino", name: "Clean Desert", preview: "#f8f8f8" },
  ]

  const tabs: SettingsTab[] = [
    { id: "display", label: "Display", icon: "🖥️" },
    { id: "sound", label: "Sound", icon: "🔊" },
    { id: "wallpaper", label: "Wallpaper", icon: "🖼️" },
    { id: "system", label: "System", icon: "⚙️" },
    { id: "about", label: "About", icon: "ℹ️" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "display":
        return (
          <div className="p-4 space-y-4">
            <div className="border border-pixel-black bg-pixel-cream p-3">
              <h3 className="font-pixel text-sm mb-3">Display Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-pixel mb-1">Screen Resolution:</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="border border-pixel-black bg-pixel-white px-2 py-1 text-xs font-pixel w-full"
                  >
                    <option value="640x480">640 x 480</option>
                    <option value="800x600">800 x 600</option>
                    <option value="1024x768">1024 x 768</option>
                    <option value="1280x1024">1280 x 1024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-pixel mb-1">Color Depth:</label>
                  <select
                    value={colorDepth}
                    onChange={(e) => setColorDepth(e.target.value)}
                    className="border border-pixel-black bg-pixel-white px-2 py-1 text-xs font-pixel w-full"
                  >
                    <option value="4-bit">4-bit (16 colors)</option>
                    <option value="8-bit">8-bit (256 colors)</option>
                    <option value="16-bit">16-bit (65,536 colors)</option>
                    <option value="24-bit">24-bit (16.7 million colors)</option>
                  </select>
                </div>

                <div className="border border-pixel-black bg-pixel-white p-2">
                  <div className="text-xs font-pixel mb-2">Preview:</div>
                  <div className="bg-pixel-cream border border-pixel-black p-2 text-center">
                    <div className="text-xs font-pixel">Sample Text</div>
                    <div className="flex justify-center gap-1 mt-1">
                      <div className="w-3 h-3 bg-pixel-red border border-pixel-black"></div>
                      <div className="w-3 h-3 bg-pixel-green border border-pixel-black"></div>
                      <div className="w-3 h-3 bg-pixel-blue border border-pixel-black"></div>
                      <div className="w-3 h-3 bg-pixel-yellow border border-pixel-black"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "sound":
        return (
          <div className="p-4 space-y-4">
            <div className="border border-pixel-black bg-pixel-cream p-3">
              <h3 className="font-pixel text-sm mb-3">Sound Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-pixel mb-1">Master Volume: {volume}%</label>
                  <div className="flex items-center gap-2">
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
                  <div className="mt-1 bg-pixel-white border border-pixel-black h-4 relative">
                    <div className="bg-pixel-green h-full" style={{ width: `${volume}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="systemSounds"
                    checked={systemSounds}
                    onChange={(e) => setSystemSounds(e.target.checked)}
                    className="border border-pixel-black"
                  />
                  <label htmlFor="systemSounds" className="text-xs font-pixel">
                    Enable System Sounds
                  </label>
                </div>

                <div className="border border-pixel-black bg-pixel-white p-2">
                  <div className="text-xs font-pixel mb-2">Sound Test:</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => playSound("beep")}
                      className="px-2 py-1 border border-pixel-black bg-pixel-cream hover:bg-pixel-white text-xs font-pixel"
                    >
                      🔔 Beep
                    </button>
                    <button
                      onClick={() => playSound("alert")}
                      className="px-2 py-1 border border-pixel-black bg-pixel-cream hover:bg-pixel-white text-xs font-pixel"
                    >
                      📢 Alert
                    </button>
                    <button
                      onClick={() => playSound("chord")}
                      className="px-2 py-1 border border-pixel-black bg-pixel-cream hover:bg-pixel-white text-xs font-pixel"
                    >
                      🎵 Chord
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "wallpaper":
        return (
          <div className="p-4 space-y-4">
            <div className="border border-pixel-black bg-pixel-cream p-3">
              <h3 className="font-pixel text-sm mb-3">Wallpaper Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-pixel mb-2">Choose Wallpaper:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {wallpaperOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleWallpaperSelect(option.id)}
                        className={`border-2 p-2 text-xs font-pixel text-left hover:border-pixel-blue transition-all ${
                          pendingWallpaper === option.id
                            ? "border-pixel-blue bg-pixel-blue text-pixel-white"
                            : selectedWallpaper === option.id
                              ? "border-pixel-green bg-pixel-green text-pixel-white"
                              : "border-pixel-black bg-pixel-white"
                        }`}
                      >
                        <div
                          className="w-full h-8 border border-pixel-black mb-1"
                          style={{
                            background:
                              option.id === "desert-dino" || option.id === "clean-desert-dino"
                                ? `url('/images/${option.id}.png')`
                                : option.preview,
                            backgroundSize:
                              option.id === "desert-dino" || option.id === "clean-desert-dino"
                                ? "cover"
                                : option.id.includes("pattern")
                                  ? "10px 10px"
                                  : "cover",
                            backgroundRepeat:
                              option.id === "desert-dino" || option.id === "clean-desert-dino"
                                ? "no-repeat"
                                : option.id.includes("pattern")
                                  ? "repeat"
                                  : "no-repeat",
                            backgroundPosition:
                              option.id === "desert-dino" || option.id === "clean-desert-dino" ? "center" : "center",
                          }}
                        ></div>
                        <div className="flex items-center justify-between">
                          <span>{option.name}</span>
                          {selectedWallpaper === option.id && pendingWallpaper === option.id && (
                            <span className="text-xs">✓</span>
                          )}
                          {selectedWallpaper === option.id && pendingWallpaper !== option.id && (
                            <span className="text-xs">●</span>
                          )}
                          {pendingWallpaper === option.id && selectedWallpaper !== option.id && (
                            <span className="text-xs">○</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={applyWallpaper}
                    disabled={pendingWallpaper === selectedWallpaper}
                    className={`px-4 py-2 border border-pixel-black text-xs font-pixel transition-all ${
                      pendingWallpaper === selectedWallpaper
                        ? "bg-pixel-gray text-pixel-black cursor-not-allowed"
                        : "bg-pixel-blue text-pixel-white hover:bg-pixel-dark active:scale-95"
                    }`}
                  >
                    Apply Wallpaper
                  </button>
                  <div className="text-xs font-pixel text-gray-600">
                    {pendingWallpaper === selectedWallpaper ? "No changes to apply" : "Click Apply to set wallpaper"}
                  </div>
                </div>

                <div className="border border-pixel-black bg-pixel-white p-2">
                  <div className="text-xs font-pixel mb-2">Current Wallpaper Preview:</div>
                  <div
                    className="w-full h-16 border border-pixel-black"
                    style={{
                      backgroundImage: getWallpaperStyle(selectedWallpaper),
                      backgroundSize: selectedWallpaper.includes("pattern") ? "10px 10px" : "cover",
                      backgroundRepeat: selectedWallpaper.includes("pattern") ? "repeat" : "no-repeat",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div className="text-xs font-pixel mt-1 text-center">
                    {wallpaperOptions.find((w) => w.id === selectedWallpaper)?.name || "Default"}
                  </div>
                </div>

                <div className="text-xs font-pixel text-gray-600 space-y-1">
                  <div>💡 Legend: ✓ Applied | ● Currently Applied | ○ Selected</div>
                  <div>Select a wallpaper and click Apply to change your desktop background.</div>
                </div>
              </div>
            </div>
          </div>
        )

      case "system":
        return (
          <div className="p-4 space-y-4">
            <div className="border border-pixel-black bg-pixel-cream p-3">
              <h3 className="font-pixel text-sm mb-3">System Information</h3>

              <div className="space-y-2 text-xs font-pixel">
                <div className="flex justify-between">
                  <span>Operating System:</span>
                  <span>Retro Pixel OS v1.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Processor:</span>
                  <span>Intel 486 DX2-66</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory (RAM):</span>
                  <span>8 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Disk Space:</span>
                  <span>1.2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Graphics:</span>
                  <span>VGA Compatible</span>
                </div>
                <div className="flex justify-between">
                  <span>Sound:</span>
                  <span>Sound Blaster 16</span>
                </div>
              </div>
            </div>

            <div className="border border-pixel-black bg-pixel-cream p-3">
              <h3 className="font-pixel text-sm mb-3">System Tools</h3>

              <div className="space-y-2">
                <button className="w-full px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs font-pixel text-left">
                  🧹 Disk Cleanup
                </button>
                <button className="w-full px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs font-pixel text-left">
                  🔧 System Diagnostics
                </button>
                <button className="w-full px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs font-pixel text-left">
                  📊 Performance Monitor
                </button>
              </div>
            </div>
          </div>
        )

      case "about":
        return (
          <div className="p-4">
            <div className="border border-pixel-black bg-pixel-cream p-4 text-center">
              <div className="text-2xl mb-2">💻</div>
              <h2 className="font-pixel text-lg mb-2">Retro Pixel OS</h2>
              <div className="text-xs font-pixel space-y-1 mb-4">
                <div>Version 1.0</div>
                <div>Build 1024</div>
                <div>Copyright © 2024 Pixel Systems Inc.</div>
              </div>

              <div className="border-t border-pixel-black pt-3 mt-3 text-xs font-pixel space-y-1">
                <div>A nostalgic operating system experience</div>
                <div>Built with modern web technologies</div>
                <div>Designed for retro computing enthusiasts</div>
              </div>

              <div className="mt-4">
                <button className="px-4 py-2 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs font-pixel">
                  📄 License Agreement
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Unknown tab</div>
    }
  }

  return (
    <div className="h-full flex font-pixel text-xs">
      <div className="w-32 border-r border-pixel-black bg-pixel-cream">
        <div className="p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full text-left px-2 py-2 text-xs hover:bg-pixel-blue hover:text-pixel-white flex items-center gap-2 ${
                activeTab === tab.id ? "bg-pixel-blue text-pixel-white" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-pixel-white">{renderTabContent()}</div>
    </div>
  )
}
