"use client"

import { useReducer, useEffect, useCallback, useState } from "react"

// Tetris piece shapes
const PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

const PIECE_COLORS = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

type PieceType = keyof typeof PIECES
type Board = number[][]

interface GameState {
  board: Board
  currentPiece: {
    shape: number[][]
    x: number
    y: number
    type: PieceType
  } | null
  nextPiece: PieceType
  score: number
  level: number
  lines: number
  gameOver: boolean
  paused: boolean
}

type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_DOWN" }
  | { type: "ROTATE" }
  | { type: "DROP" }
  | { type: "SPAWN_PIECE" }
  | { type: "LOCK_PIECE" }
  | { type: "CLEAR_LINES" }
  | { type: "GAME_OVER" }
  | { type: "RESTART" }
  | { type: "TOGGLE_PAUSE" }

const createEmptyBoard = (): Board =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0))

const getRandomPiece = (): PieceType => {
  const pieces = Object.keys(PIECES) as PieceType[]
  return pieces[Math.floor(Math.random() * pieces.length)]
}

const rotatePiece = (piece: number[][]): number[][] => {
  const rows = piece.length
  const cols = piece[0].length
  const rotated = Array(cols)
    .fill(null)
    .map(() => Array(rows).fill(0))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = piece[i][j]
    }
  }

  return rotated
}

const isValidPosition = (board: Board, piece: number[][], x: number, y: number): boolean => {
  for (let i = 0; i < piece.length; i++) {
    for (let j = 0; j < piece[i].length; j++) {
      if (piece[i][j]) {
        const newX = x + j
        const newY = y + i

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false
        }

        if (newY >= 0 && board[newY][newX]) {
          return false
        }
      }
    }
  }
  return true
}

const placePiece = (board: Board, piece: number[][], x: number, y: number, pieceType: PieceType): Board => {
  const newBoard = board.map((row) => [...row])

  for (let i = 0; i < piece.length; i++) {
    for (let j = 0; j < piece[i].length; j++) {
      if (piece[i][j] && y + i >= 0) {
        newBoard[y + i][x + j] = Object.keys(PIECES).indexOf(pieceType) + 1
      }
    }
  }

  return newBoard
}

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0))
  const linesCleared = BOARD_HEIGHT - newBoard.length

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0))
  }

  return { newBoard, linesCleared }
}

const initialState: GameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: getRandomPiece(),
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  paused: false,
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SPAWN_PIECE": {
      if (state.gameOver || state.paused) return state

      const pieceType = state.nextPiece
      const shape = PIECES[pieceType]
      const x = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2)
      const y = 0

      if (!isValidPosition(state.board, shape, x, y)) {
        return { ...state, gameOver: true }
      }

      return {
        ...state,
        currentPiece: { shape, x, y, type: pieceType },
        nextPiece: getRandomPiece(),
      }
    }

    case "MOVE_LEFT": {
      if (!state.currentPiece || state.gameOver || state.paused) return state

      const newX = state.currentPiece.x - 1
      if (isValidPosition(state.board, state.currentPiece.shape, newX, state.currentPiece.y)) {
        return {
          ...state,
          currentPiece: { ...state.currentPiece, x: newX },
        }
      }
      return state
    }

    case "MOVE_RIGHT": {
      if (!state.currentPiece || state.gameOver || state.paused) return state

      const newX = state.currentPiece.x + 1
      if (isValidPosition(state.board, state.currentPiece.shape, newX, state.currentPiece.y)) {
        return {
          ...state,
          currentPiece: { ...state.currentPiece, x: newX },
        }
      }
      return state
    }

    case "MOVE_DOWN": {
      if (!state.currentPiece || state.gameOver || state.paused) return state

      const newY = state.currentPiece.y + 1
      if (isValidPosition(state.board, state.currentPiece.shape, state.currentPiece.x, newY)) {
        return {
          ...state,
          currentPiece: { ...state.currentPiece, y: newY },
        }
      } else {
        // Lock the piece
        const newBoard = placePiece(
          state.board,
          state.currentPiece.shape,
          state.currentPiece.x,
          state.currentPiece.y,
          state.currentPiece.type,
        )
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

        const points = linesCleared * 100 * state.level
        const newLines = state.lines + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1

        return {
          ...state,
          board: clearedBoard,
          currentPiece: null,
          score: state.score + points,
          lines: newLines,
          level: newLevel,
        }
      }
    }

    case "ROTATE": {
      if (!state.currentPiece || state.gameOver || state.paused) return state

      const rotated = rotatePiece(state.currentPiece.shape)
      if (isValidPosition(state.board, rotated, state.currentPiece.x, state.currentPiece.y)) {
        return {
          ...state,
          currentPiece: { ...state.currentPiece, shape: rotated },
        }
      }
      return state
    }

    case "DROP": {
      if (!state.currentPiece || state.gameOver || state.paused) return state

      let newY = state.currentPiece.y
      while (isValidPosition(state.board, state.currentPiece.shape, state.currentPiece.x, newY + 1)) {
        newY++
      }

      const newBoard = placePiece(
        state.board,
        state.currentPiece.shape,
        state.currentPiece.x,
        newY,
        state.currentPiece.type,
      )
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

      const points = linesCleared * 100 * state.level + (newY - state.currentPiece.y) * 2
      const newLines = state.lines + linesCleared
      const newLevel = Math.floor(newLines / 10) + 1

      return {
        ...state,
        board: clearedBoard,
        currentPiece: null,
        score: state.score + points,
        lines: newLines,
        level: newLevel,
      }
    }

    case "RESTART": {
      return {
        ...initialState,
        nextPiece: getRandomPiece(),
      }
    }

    case "TOGGLE_PAUSE": {
      return {
        ...state,
        paused: !state.paused,
      }
    }

    default:
      return state
  }
}

export function Tetris() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [gameStarted, setGameStarted] = useState(false)

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameStarted) return

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          dispatch({ type: "MOVE_LEFT" })
          break
        case "ArrowRight":
          event.preventDefault()
          dispatch({ type: "MOVE_RIGHT" })
          break
        case "ArrowDown":
          event.preventDefault()
          dispatch({ type: "MOVE_DOWN" })
          break
        case "ArrowUp":
          event.preventDefault()
          dispatch({ type: "ROTATE" })
          break
        case " ":
          event.preventDefault()
          dispatch({ type: "DROP" })
          break
        case "Escape":
          event.preventDefault()
          dispatch({ type: "TOGGLE_PAUSE" })
          break
      }
    },
    [gameStarted],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (!gameStarted || state.gameOver || state.paused) return

    const interval = setInterval(
      () => {
        if (!state.currentPiece) {
          dispatch({ type: "SPAWN_PIECE" })
        } else {
          dispatch({ type: "MOVE_DOWN" })
        }
      },
      Math.max(50, 1000 - (state.level - 1) * 100),
    )

    return () => clearInterval(interval)
  }, [gameStarted, state.gameOver, state.paused, state.level, state.currentPiece])

  const startGame = () => {
    setGameStarted(true)
    dispatch({ type: "RESTART" })
    dispatch({ type: "SPAWN_PIECE" })
  }

  const restartGame = () => {
    dispatch({ type: "RESTART" })
    dispatch({ type: "SPAWN_PIECE" })
  }

  const renderBoard = () => {
    const displayBoard = state.board.map((row) => [...row])

    // Add current piece to display board
    if (state.currentPiece) {
      for (let i = 0; i < state.currentPiece.shape.length; i++) {
        for (let j = 0; j < state.currentPiece.shape[i].length; j++) {
          if (state.currentPiece.shape[i][j]) {
            const x = state.currentPiece.x + j
            const y = state.currentPiece.y + i
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = Object.keys(PIECES).indexOf(state.currentPiece.type) + 1
            }
          }
        }
      }
    }

    return displayBoard.map((row, i) => (
      <div key={i} className="flex">
        {row.map((cell, j) => (
          <div
            key={j}
            className="w-6 h-6 border border-pixel-gray"
            style={{
              backgroundColor: cell ? Object.values(PIECE_COLORS)[cell - 1] : "#f0f0f0",
            }}
          />
        ))}
      </div>
    ))
  }

  const renderNextPiece = () => {
    const nextShape = PIECES[state.nextPiece]
    return nextShape.map((row, i) => (
      <div key={i} className="flex">
        {row.map((cell, j) => (
          <div
            key={j}
            className="w-4 h-4 border border-pixel-gray"
            style={{
              backgroundColor: cell ? PIECE_COLORS[state.nextPiece] : "transparent",
            }}
          />
        ))}
      </div>
    ))
  }

  if (!gameStarted) {
    return (
      <div className="h-full flex items-center justify-center bg-pixel-cream">
        <div className="bg-pixel-white border-2 border-pixel-black p-6 text-center">
          <h2 className="text-xl font-pixel mb-4 text-pixel-black">TETRIS</h2>
          <p className="text-sm font-pixel mb-4 text-pixel-black">
            Use arrow keys to move and rotate pieces.
            <br />
            Space to drop, Escape to pause.
          </p>
          <button
            className="bg-pixel-blue text-pixel-white px-4 py-2 border-2 border-pixel-black font-pixel hover:bg-blue-600"
            onClick={startGame}
          >
            START GAME
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-pixel-cream p-4 flex gap-4">
      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-pixel-white border-2 border-pixel-black p-2">{renderBoard()}</div>
      </div>

      {/* Side Panel */}
      <div className="w-48 space-y-4">
        {/* Score */}
        <div className="bg-pixel-white border-2 border-pixel-black p-3">
          <h3 className="font-pixel text-sm mb-2 text-pixel-black">SCORE</h3>
          <p className="font-pixel text-lg text-pixel-black">{state.score}</p>
        </div>

        {/* Level */}
        <div className="bg-pixel-white border-2 border-pixel-black p-3">
          <h3 className="font-pixel text-sm mb-2 text-pixel-black">LEVEL</h3>
          <p className="font-pixel text-lg text-pixel-black">{state.level}</p>
        </div>

        {/* Lines */}
        <div className="bg-pixel-white border-2 border-pixel-black p-3">
          <h3 className="font-pixel text-sm mb-2 text-pixel-black">LINES</h3>
          <p className="font-pixel text-lg text-pixel-black">{state.lines}</p>
        </div>

        {/* Next Piece */}
        <div className="bg-pixel-white border-2 border-pixel-black p-3">
          <h3 className="font-pixel text-sm mb-2 text-pixel-black">NEXT</h3>
          <div className="flex flex-col items-center">{renderNextPiece()}</div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button
            className="w-full bg-pixel-blue text-pixel-white px-3 py-2 border-2 border-pixel-black font-pixel hover:bg-blue-600"
            onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
          >
            {state.paused ? "RESUME" : "PAUSE"}
          </button>
          <button
            className="w-full bg-pixel-green text-pixel-white px-3 py-2 border-2 border-pixel-black font-pixel hover:bg-green-600"
            onClick={restartGame}
          >
            RESTART
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {state.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-pixel-white border-2 border-pixel-black p-6 text-center">
            <h2 className="text-xl font-pixel mb-4 text-pixel-black">GAME OVER</h2>
            <p className="font-pixel mb-2 text-pixel-black">Final Score: {state.score}</p>
            <p className="font-pixel mb-4 text-pixel-black">Level: {state.level}</p>
            <button
              className="bg-pixel-blue text-pixel-white px-4 py-2 border-2 border-pixel-black font-pixel hover:bg-blue-600"
              onClick={restartGame}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {state.paused && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-pixel-white border-2 border-pixel-black p-6 text-center">
            <h2 className="text-xl font-pixel mb-4 text-pixel-black">PAUSED</h2>
            <button
              className="bg-pixel-blue text-pixel-white px-4 py-2 border-2 border-pixel-black font-pixel hover:bg-blue-600"
              onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            >
              RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
