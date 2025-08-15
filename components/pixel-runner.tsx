"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// Game constants
const GAME_WIDTH = 480
const GAME_HEIGHT = 270
const GRAVITY = 2000
const JUMP_IMPULSE = 650
const BASE_SCROLL_SPEED = 180
const MAX_SCROLL_SPEED = 360
const SPEED_INCREASE_INTERVAL = 20000 // 20 seconds
const SPEED_INCREASE = 10

// Game states
type GameState = "BOOT" | "MENU" | "COUNTDOWN" | "RUNNING" | "PAUSED" | "GAME_OVER"

// Game objects
interface GameObject {
  x: number
  y: number
  width: number
  height: number
  active: boolean
}

interface Player extends GameObject {
  velocityY: number
  isGrounded: boolean
  animFrame: number
  animTimer: number
}

interface Coin extends GameObject {
  animFrame: number
  animTimer: number
  collected: boolean
}

interface Obstacle extends GameObject {
  type: "crate" | "cone" | "bird"
  animFrame?: number
  animTimer?: number
}

export function PixelRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Game state
  const [gameState, setGameState] = useState<GameState>("MENU")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)

  // Game objects
  const playerRef = useRef<Player>({
    x: 80,
    y: GAME_HEIGHT - 60,
    width: 16,
    height: 24,
    velocityY: 0,
    isGrounded: true,
    animFrame: 0,
    animTimer: 0,
    active: true,
  })

  const coinsRef = useRef<Coin[]>([])
  const obstaclesRef = useRef<Obstacle[]>([])
  const scrollSpeedRef = useRef(BASE_SCROLL_SPEED)
  const spawnTimerRef = useRef(0)
  const multiplierRef = useRef(1)
  const multiplierTimerRef = useRef(0)
  const gameTimeRef = useRef(0)

  // Input handling
  const keysRef = useRef<Set<string>>(new Set())
  const jumpBufferRef = useRef(0)
  const coyoteTimeRef = useRef(0)

  // Audio context
  const audioContextRef = useRef<AudioContext | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Initialize high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pixelRunner.highScore")
    if (saved) {
      setHighScore(Number.parseInt(saved))
    }
  }, [])

  // Create audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Play sound effect
  const playSound = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "square") => {
      if (!soundEnabled || !audioContextRef.current) return

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    },
    [soundEnabled],
  )

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)

      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        if (gameState === "RUNNING") {
          jumpBufferRef.current = 80 // 80ms jump buffer
        } else if (gameState === "MENU") {
          startGame()
        } else if (gameState === "GAME_OVER") {
          restartGame()
        }
      }

      if (e.code === "Escape" && gameState === "RUNNING") {
        setGameState("PAUSED")
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameState])

  // Game functions
  const startGame = useCallback(() => {
    initAudio()
    setGameState("COUNTDOWN")
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setGameState("RUNNING")
          resetGame()
          return 0
        }
        playSound(800, 0.1)
        return prev - 1
      })
    }, 1000)
  }, [playSound, initAudio])

  const resetGame = useCallback(() => {
    setScore(0)
    playerRef.current = {
      x: 80,
      y: GAME_HEIGHT - 60,
      width: 16,
      height: 24,
      velocityY: 0,
      isGrounded: true,
      animFrame: 0,
      animTimer: 0,
      active: true,
    }
    coinsRef.current = []
    obstaclesRef.current = []
    scrollSpeedRef.current = BASE_SCROLL_SPEED
    spawnTimerRef.current = 0
    multiplierRef.current = 1
    multiplierTimerRef.current = 0
    gameTimeRef.current = 0
    jumpBufferRef.current = 0
    coyoteTimeRef.current = 0
  }, [])

  const restartGame = useCallback(() => {
    startGame()
  }, [startGame])

  const gameOver = useCallback(() => {
    setGameState("GAME_OVER")
    playSound(200, 0.5)

    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("pixelRunner.highScore", score.toString())
      setShowNameInput(true)
    }
  }, [score, highScore, playSound])

  // Spawn objects
  const spawnCoin = useCallback((x: number, y: number) => {
    coinsRef.current.push({
      x,
      y,
      width: 16,
      height: 16,
      active: true,
      animFrame: 0,
      animTimer: 0,
      collected: false,
    })
  }, [])

  const spawnObstacle = useCallback((x: number, type: "crate" | "cone" | "bird") => {
    const obstacle: Obstacle = {
      x,
      y: type === "bird" ? GAME_HEIGHT - 120 : GAME_HEIGHT - 40,
      width: type === "cone" ? 24 : 16,
      height: type === "bird" ? 12 : 16,
      active: true,
      type,
      animFrame: 0,
      animTimer: 0,
    }
    obstaclesRef.current.push(obstacle)
  }, [])

  // Collision detection
  const checkCollision = useCallback((a: GameObject, b: GameObject) => {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }, [])

  // Game update loop
  const updateGame = useCallback(
    (deltaTime: number) => {
      if (gameState !== "RUNNING") return

      const dt = deltaTime / 1000
      gameTimeRef.current += deltaTime

      // Update scroll speed
      const speedIncrements = Math.floor(gameTimeRef.current / SPEED_INCREASE_INTERVAL)
      scrollSpeedRef.current = Math.min(BASE_SCROLL_SPEED + speedIncrements * SPEED_INCREASE, MAX_SCROLL_SPEED)

      // Update player
      const player = playerRef.current

      // Handle jump input with buffer and coyote time
      if (jumpBufferRef.current > 0) {
        jumpBufferRef.current -= deltaTime
        if ((player.isGrounded || coyoteTimeRef.current > 0) && player.velocityY >= 0) {
          player.velocityY = -JUMP_IMPULSE
          player.isGrounded = false
          coyoteTimeRef.current = 0
          jumpBufferRef.current = 0
          playSound(440, 0.1)
        }
      }

      // Apply gravity
      if (!player.isGrounded) {
        player.velocityY += GRAVITY * dt
        if (coyoteTimeRef.current > 0) {
          coyoteTimeRef.current -= deltaTime
        }
      }

      // Update player position
      player.y += player.velocityY * dt

      // Ground collision
      const groundY = GAME_HEIGHT - 60
      if (player.y >= groundY) {
        player.y = groundY
        player.velocityY = 0
        if (!player.isGrounded) {
          coyoteTimeRef.current = 80 // 80ms coyote time
        }
        player.isGrounded = true
      } else {
        player.isGrounded = false
      }

      // Update player animation
      player.animTimer += deltaTime
      if (player.animTimer > 100) {
        player.animFrame = (player.animFrame + 1) % 6
        player.animTimer = 0
      }

      // Spawn objects
      spawnTimerRef.current += deltaTime
      if (spawnTimerRef.current > 900 + Math.random() * 500) {
        spawnTimerRef.current = 0

        const spawnX = GAME_WIDTH + 50

        if (Math.random() < 0.6) {
          // Spawn coins
          const pattern = Math.floor(Math.random() * 3)
          if (pattern === 0) {
            // Line of coins
            for (let i = 0; i < 5; i++) {
              spawnCoin(spawnX + i * 30, GAME_HEIGHT - 100 - Math.random() * 50)
            }
          } else if (pattern === 1) {
            // Arc of coins
            for (let i = 0; i < 4; i++) {
              const angle = (i / 3) * Math.PI * 0.5
              spawnCoin(spawnX + i * 25, GAME_HEIGHT - 80 - Math.sin(angle) * 40)
            }
          } else {
            // Single coin
            spawnCoin(spawnX, GAME_HEIGHT - 80 - Math.random() * 60)
          }
        } else {
          // Spawn obstacle
          const obstacleTypes: ("crate" | "cone" | "bird")[] = ["crate", "cone", "bird"]
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
          spawnObstacle(spawnX, type)
        }
      }

      // Update coins
      coinsRef.current.forEach((coin) => {
        if (!coin.active) return

        coin.x -= scrollSpeedRef.current * dt
        coin.animTimer += deltaTime
        if (coin.animTimer > 100) {
          coin.animFrame = (coin.animFrame + 1) % 6
          coin.animTimer = 0
        }

        // Check collision with player
        if (!coin.collected && checkCollision(player, coin)) {
          coin.collected = true
          setScore((prev) => prev + 10 * multiplierRef.current)
          multiplierRef.current = Math.min(multiplierRef.current + 0.1, 5)
          multiplierTimerRef.current = 3000
          playSound(660, 0.1)
        }

        // Remove off-screen coins
        if (coin.x < -coin.width) {
          coin.active = false
        }
      })

      // Update obstacles
      obstaclesRef.current.forEach((obstacle) => {
        if (!obstacle.active) return

        obstacle.x -= scrollSpeedRef.current * dt

        if (obstacle.type === "bird") {
          obstacle.animTimer! += deltaTime
          if (obstacle.animTimer! > 200) {
            obstacle.animFrame! = (obstacle.animFrame! + 1) % 2
            obstacle.animTimer! = 0
          }
        }

        // Check collision with player
        if (checkCollision(player, obstacle)) {
          gameOver()
        }

        // Remove off-screen obstacles
        if (obstacle.x < -obstacle.width) {
          obstacle.active = false
        }
      })

      // Update multiplier decay
      if (multiplierTimerRef.current > 0) {
        multiplierTimerRef.current -= deltaTime
        if (multiplierTimerRef.current <= 0) {
          multiplierRef.current = 1
        }
      }

      // Clean up inactive objects
      coinsRef.current = coinsRef.current.filter((coin) => coin.active)
      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => obstacle.active)
    },
    [gameState, checkCollision, gameOver, playSound, spawnCoin, spawnObstacle],
  )

  // Render game
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set pixel rendering
    ctx.imageSmoothingEnabled = false

    // Clear canvas
    ctx.fillStyle = "#87CEEB"
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw parallax background
    const offset = (gameTimeRef.current * scrollSpeedRef.current * 0.1) % GAME_WIDTH

    // Sky gradient bands
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT * 0.6)
    gradient.addColorStop(0, "#87CEEB")
    gradient.addColorStop(1, "#E0F6FF")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6)

    // Ground
    ctx.fillStyle = "#90EE90"
    ctx.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60)

    // Road
    ctx.fillStyle = "#696969"
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40)

    // Road lines
    ctx.fillStyle = "#FFFF00"
    for (let x = -offset; x < GAME_WIDTH; x += 40) {
      ctx.fillRect(x, GAME_HEIGHT - 22, 20, 4)
    }

    // Draw coins
    ctx.fillStyle = "#FFD700"
    coinsRef.current.forEach((coin) => {
      if (coin.active && !coin.collected) {
        ctx.fillRect(coin.x, coin.y, coin.width, coin.height)
        // Simple coin animation - just a rotating square
        if (coin.animFrame % 2 === 0) {
          ctx.fillStyle = "#FFA500"
          ctx.fillRect(coin.x + 2, coin.y + 2, coin.width - 4, coin.height - 4)
          ctx.fillStyle = "#FFD700"
        }
      }
    })

    // Draw obstacles
    obstaclesRef.current.forEach((obstacle) => {
      if (!obstacle.active) return

      if (obstacle.type === "crate") {
        ctx.fillStyle = "#8B4513"
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        ctx.strokeStyle = "#654321"
        ctx.lineWidth = 1
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
      } else if (obstacle.type === "cone") {
        ctx.fillStyle = "#FF4500"
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(obstacle.x + 2, obstacle.y + 4, obstacle.width - 4, 4)
      } else if (obstacle.type === "bird") {
        ctx.fillStyle = "#8B4513"
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        // Simple wing flap animation
        if (obstacle.animFrame === 1) {
          ctx.fillRect(obstacle.x - 2, obstacle.y + 2, 4, 8)
          ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + 2, 4, 8)
        }
      }
    })

    // Draw player
    const player = playerRef.current
    ctx.fillStyle = "#FF6B6B"
    ctx.fillRect(player.x, player.y, player.width, player.height)

    // Simple run animation
    if (player.isGrounded && player.animFrame % 2 === 0) {
      ctx.fillStyle = "#FF4444"
      ctx.fillRect(player.x, player.y + player.height - 4, 6, 4)
      ctx.fillRect(player.x + 10, player.y + player.height - 4, 6, 4)
    }

    // Eyes
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(player.x + 3, player.y + 4, 3, 3)
    ctx.fillRect(player.x + 10, player.y + 4, 3, 3)
    ctx.fillStyle = "#000000"
    ctx.fillRect(player.x + 4, player.y + 5, 1, 1)
    ctx.fillRect(player.x + 11, player.y + 5, 1, 1)
  }, [])

  // Main game loop
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      updateGame(deltaTime)
      renderGame()

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGame, renderGame])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const scale = Math.min(containerWidth / GAME_WIDTH, containerHeight / GAME_HEIGHT)

      const scaledWidth = GAME_WIDTH * scale
      const scaledHeight = GAME_HEIGHT * scale

      canvas.style.width = `${scaledWidth}px`
      canvas.style.height = `${scaledHeight}px`
      canvas.style.imageRendering = "pixelated"
      canvas.style.imageRendering = "crisp-edges"
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <div className="h-full w-full bg-pixel-cream flex flex-col relative">
      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-2 border-pixel-black"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* HUD */}
      {gameState === "RUNNING" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-pixel text-pixel-black" style={{ textShadow: "2px 2px 0px #FFF" }}>
            {score}
          </div>
          <div className="text-sm font-pixel text-pixel-black" style={{ textShadow: "1px 1px 0px #FFF" }}>
            Best: {highScore}
          </div>
        </div>
      )}

      {/* Exit Button */}
      <button
        className="absolute top-2 right-2 px-3 py-1 bg-pixel-red text-pixel-white text-xs font-pixel border border-pixel-black hover:bg-red-600"
        onClick={() => window.history.back()}
      >
        Exit Game
      </button>

      {/* Start Menu */}
      {gameState === "MENU" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-pixel-cream border-2 border-pixel-black p-8 text-center max-w-md">
            <h1 className="text-2xl font-pixel text-pixel-black mb-4">Pixel Runner</h1>
            <p className="text-sm font-pixel text-pixel-black mb-2">Collect coins & win!</p>
            <p className="text-xs font-pixel text-pixel-black mb-6">
              Press SPACE or Arrow Up to jump to collect as many coins as you can to get on the leaderboard and win
              prizes!
            </p>
            <button
              className="px-6 py-2 bg-pixel-blue text-pixel-white font-pixel border border-pixel-black hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pixel-blue"
              onClick={startGame}
            >
              START GAME
            </button>
            <div className="mt-4 text-xs font-pixel text-pixel-black">Best Score: {highScore}</div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {gameState === "COUNTDOWN" && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-6xl font-pixel text-pixel-white" style={{ textShadow: "4px 4px 0px #000" }}>
            {countdown}
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState === "PAUSED" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-pixel-cream border-2 border-pixel-black p-6 text-center">
            <h2 className="text-xl font-pixel text-pixel-black mb-4">Paused</h2>
            <div className="space-y-2">
              <button
                className="block w-full px-4 py-2 bg-pixel-blue text-pixel-white font-pixel border border-pixel-black hover:bg-blue-600"
                onClick={() => setGameState("RUNNING")}
              >
                Resume
              </button>
              <button
                className="block w-full px-4 py-2 bg-pixel-gray text-pixel-black font-pixel border border-pixel-black hover:bg-gray-300"
                onClick={restartGame}
              >
                Restart
              </button>
              <button
                className="block w-full px-4 py-2 bg-pixel-red text-pixel-white font-pixel border border-pixel-black hover:bg-red-600"
                onClick={() => setGameState("MENU")}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "GAME_OVER" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-pixel-cream border-2 border-pixel-black p-6 text-center">
            <h2 className="text-xl font-pixel text-pixel-black mb-4">Game Over</h2>
            <div className="mb-4">
              <div className="text-lg font-pixel text-pixel-black">Score: {score}</div>
              <div className="text-sm font-pixel text-pixel-black">Best: {highScore}</div>
            </div>
            <div className="space-y-2">
              <button
                className="block w-full px-4 py-2 bg-pixel-blue text-pixel-white font-pixel border border-pixel-black hover:bg-blue-600"
                onClick={restartGame}
              >
                Restart
              </button>
              <button
                className="block w-full px-4 py-2 bg-pixel-gray text-pixel-black font-pixel border border-pixel-black hover:bg-gray-300"
                onClick={() => setShowLeaderboard(true)}
              >
                Leaderboard
              </button>
              <button
                className="block w-full px-4 py-2 bg-pixel-red text-pixel-white font-pixel border border-pixel-black hover:bg-red-600"
                onClick={() => setGameState("MENU")}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Input for High Score */}
      {showNameInput && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-pixel-cream border-2 border-pixel-black p-6 text-center">
            <h2 className="text-lg font-pixel text-pixel-black mb-4">New High Score!</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-2 py-1 border border-pixel-black font-pixel text-sm mb-4"
              maxLength={20}
            />
            <button
              className="px-4 py-2 bg-pixel-blue text-pixel-white font-pixel border border-pixel-black hover:bg-blue-600"
              onClick={() => {
                // Save to leaderboard (localStorage for now)
                const leaderboard = JSON.parse(localStorage.getItem("pixelRunner.leaderboard") || "[]")
                leaderboard.push({
                  name: playerName || "Anonymous",
                  score,
                  date: new Date().toLocaleDateString(),
                })
                leaderboard.sort((a: any, b: any) => b.score - a.score)
                leaderboard.splice(10) // Keep top 10
                localStorage.setItem("pixelRunner.leaderboard", JSON.stringify(leaderboard))

                setShowNameInput(false)
                setPlayerName("")
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-pixel-cream border-2 border-pixel-black p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-lg font-pixel text-pixel-black mb-4 text-center">Leaderboard</h2>
            <div className="space-y-1 mb-4">
              {JSON.parse(localStorage.getItem("pixelRunner.leaderboard") || "[]").map((entry: any, index: number) => (
                <div key={index} className="flex justify-between text-xs font-pixel text-pixel-black">
                  <span>
                    {index + 1}. {entry.name}
                  </span>
                  <span>{entry.score}</span>
                </div>
              ))}
              {JSON.parse(localStorage.getItem("pixelRunner.leaderboard") || "[]").length === 0 && (
                <div className="text-xs font-pixel text-pixel-black text-center">No scores yet!</div>
              )}
            </div>
            <button
              className="w-full px-4 py-2 bg-pixel-gray text-pixel-black font-pixel border border-pixel-black hover:bg-gray-300"
              onClick={() => setShowLeaderboard(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
