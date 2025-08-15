"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface TerminalLine {
  type: "command" | "output" | "error"
  content: string
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "Retro Pixel OS Terminal v1.0" },
    { type: "output", content: 'Type "help" for available commands' },
    { type: "output", content: "" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentDirectory, setCurrentDirectory] = useState("C:\\")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const commands = {
    help: () => [
      "Available commands:",
      "  help     - Show this help message",
      "  dir      - List directory contents",
      "  cd       - Change directory",
      "  cls      - Clear screen",
      "  echo     - Display text",
      "  date     - Show current date",
      "  time     - Show current time",
      "  ver      - Show OS version",
      "  exit     - Close terminal",
      "",
    ],
    dir: () => [
      "Directory of " + currentDirectory,
      "",
      "12/15/24  10:30 AM    <DIR>          Documents",
      "12/15/24  10:30 AM    <DIR>          Pictures",
      "12/15/24  10:30 AM    <DIR>          Music",
      "12/15/24  10:30 AM    <DIR>          Programs",
      "12/14/24  09:15 AM         1,024     autoexec.bat",
      "12/14/24  09:15 AM           512     config.sys",
      "               2 File(s)          1,536 bytes",
      "               4 Dir(s)   1,048,576 bytes free",
      "",
    ],
    cls: () => {
      setLines([])
      return []
    },
    date: () => [new Date().toLocaleDateString(), ""],
    time: () => [new Date().toLocaleTimeString(), ""],
    ver: () => ["Retro Pixel OS Version 1.0", ""],
    exit: () => {
      // In a real implementation, this would close the terminal window
      return ["Terminal session ended.", ""]
    },
  }

  const executeCommand = (input: string) => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    // Add command to history
    setCommandHistory((prev) => [...prev, trimmedInput])
    setHistoryIndex(-1)

    // Add command line to output
    setLines((prev) => [
      ...prev,
      {
        type: "command",
        content: `${currentDirectory}> ${trimmedInput}`,
      },
    ])

    // Parse command
    const parts = trimmedInput.toLowerCase().split(" ")
    const command = parts[0]
    const args = parts.slice(1)

    let output: string[] = []

    if (command === "cd") {
      if (args.length === 0) {
        output = [currentDirectory, ""]
      } else {
        const newDir = args[0]
        if (newDir === "..") {
          const pathParts = currentDirectory.split("\\").filter((p) => p)
          if (pathParts.length > 1) {
            setCurrentDirectory(pathParts.slice(0, -1).join("\\") + "\\")
          } else {
            setCurrentDirectory("C:\\")
          }
        } else if (newDir.includes(":")) {
          setCurrentDirectory(newDir.endsWith("\\") ? newDir : newDir + "\\")
        } else {
          setCurrentDirectory(currentDirectory + newDir + "\\")
        }
        output = [""]
      }
    } else if (command === "echo") {
      output = [args.join(" "), ""]
    } else if (command in commands) {
      output = (commands as any)[command]()
    } else {
      output = [`'${command}' is not recognized as an internal or external command.`, ""]
    }

    // Add output lines
    if (output.length > 0) {
      setLines((prev) => [
        ...prev,
        ...output.map((line) => ({
          type: "output" as const,
          content: line,
        })),
      ])
    }

    setCurrentInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div
      className="h-full bg-pixel-black text-pixel-green font-mono-pixel text-xs p-2 overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className="flex-1 overflow-y-auto">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`${
              line.type === "command"
                ? "text-pixel-yellow"
                : line.type === "error"
                  ? "text-pixel-red"
                  : "text-pixel-green"
            }`}
          >
            {line.content}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex">
          <span className="text-pixel-yellow">{currentDirectory}&gt; </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-pixel-green outline-none border-none font-mono-pixel text-xs"
            style={{ caretColor: "#2ecc71" }}
          />
          <span className="animate-pulse text-pixel-green">_</span>
        </div>
      </div>
    </div>
  )
}
