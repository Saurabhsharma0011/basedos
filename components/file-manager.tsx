"use client"

import { useState } from "react"

interface FileItem {
  name: string
  type: "file" | "folder"
  size?: string
  modified?: string
  icon: string
}

export function FileManager() {
  const [currentPath, setCurrentPath] = useState("C:\\")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "icons">("list")

  const folders = [
    { name: "My Computer", path: "C:\\", icon: "💻" },
    { name: "Documents", path: "C:\\Documents", icon: "📄" },
    { name: "Pictures", path: "C:\\Pictures", icon: "🖼️" },
    { name: "Music", path: "C:\\Music", icon: "🎵" },
    { name: "Programs", path: "C:\\Programs", icon: "⚙️" },
    { name: "System", path: "C:\\System", icon: "🔧" },
  ]

  const getCurrentFiles = (): FileItem[] => {
    switch (currentPath) {
      case "C:\\":
        return [
          { name: "Documents", type: "folder", icon: "📁" },
          { name: "Pictures", type: "folder", icon: "📁" },
          { name: "Music", type: "folder", icon: "📁" },
          { name: "Programs", type: "folder", icon: "📁" },
          { name: "System", type: "folder", icon: "📁" },
          { name: "autoexec.bat", type: "file", size: "1.2 KB", modified: "12/15/24", icon: "📄" },
          { name: "config.sys", type: "file", size: "856 B", modified: "12/15/24", icon: "📄" },
        ]
      case "C:\\Documents":
        return [
          { name: "..", type: "folder", icon: "📁" },
          { name: "readme.txt", type: "file", size: "2.1 KB", modified: "12/14/24", icon: "📄" },
          { name: "letter.doc", type: "file", size: "15.3 KB", modified: "12/13/24", icon: "📄" },
          { name: "budget.xls", type: "file", size: "8.7 KB", modified: "12/12/24", icon: "📊" },
        ]
      case "C:\\Pictures":
        return [
          { name: "..", type: "folder", icon: "📁" },
          { name: "vacation.bmp", type: "file", size: "245 KB", modified: "12/10/24", icon: "🖼️" },
          { name: "family.jpg", type: "file", size: "89 KB", modified: "12/09/24", icon: "🖼️" },
          { name: "wallpaper.gif", type: "file", size: "156 KB", modified: "12/08/24", icon: "🖼️" },
        ]
      case "C:\\Music":
        return [
          { name: "..", type: "folder", icon: "📁" },
          { name: "song1.wav", type: "file", size: "3.2 MB", modified: "12/07/24", icon: "🎵" },
          { name: "track2.mid", type: "file", size: "45 KB", modified: "12/06/24", icon: "🎵" },
        ]
      case "C:\\Programs":
        return [
          { name: "..", type: "folder", icon: "📁" },
          { name: "Games", type: "folder", icon: "📁" },
          { name: "Utilities", type: "folder", icon: "📁" },
          { name: "paint.exe", type: "file", size: "128 KB", modified: "12/15/24", icon: "🎨" },
          { name: "calc.exe", type: "file", size: "64 KB", modified: "12/15/24", icon: "🔢" },
        ]
      default:
        return [{ name: "..", type: "folder", icon: "📁" }]
    }
  }

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      if (item.name === "..") {
        // Go up one directory
        const pathParts = currentPath.split("\\").filter((p) => p)
        if (pathParts.length > 1) {
          setCurrentPath(pathParts.slice(0, -1).join("\\") + "\\")
        } else {
          setCurrentPath("C:\\")
        }
      } else {
        // Navigate to folder
        const newPath = currentPath === "C:\\" ? `C:\\${item.name}` : `${currentPath}\\${item.name}`
        setCurrentPath(newPath)
      }
      setSelectedItems([])
    } else {
      // Select file
      setSelectedItems([item.name])
    }
  }

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === "file") {
      // Simulate opening file
      console.log(`Opening ${item.name}`)
    }
  }

  const navigateToPath = (path: string) => {
    setCurrentPath(path)
    setSelectedItems([])
  }

  const files = getCurrentFiles()

  return (
    <div className="h-full flex flex-col font-pixel text-xs">
      {/* Toolbar */}
      <div className="border-b border-pixel-black bg-pixel-cream p-1 flex items-center gap-2">
        <button
          className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
          onClick={() => {
            const pathParts = currentPath.split("\\").filter((p) => p)
            if (pathParts.length > 1) {
              setCurrentPath(pathParts.slice(0, -1).join("\\") + "\\")
            } else {
              setCurrentPath("C:\\")
            }
          }}
        >
          ← Back
        </button>
        <button
          className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
          onClick={() => setCurrentPath("C:\\")}
        >
          🏠 Home
        </button>
        <div className="flex-1 mx-2">
          <div className="border border-pixel-black bg-pixel-white px-2 py-1 text-xs">{currentPath}</div>
        </div>
        <button
          className={`px-2 py-1 border border-pixel-black text-xs ${viewMode === "list" ? "bg-pixel-blue text-pixel-white" : "bg-pixel-white hover:bg-pixel-cream"}`}
          onClick={() => setViewMode("list")}
        >
          ☰ List
        </button>
        <button
          className={`px-2 py-1 border border-pixel-black text-xs ${viewMode === "icons" ? "bg-pixel-blue text-pixel-white" : "bg-pixel-white hover:bg-pixel-cream"}`}
          onClick={() => setViewMode("icons")}
        >
          ⊞ Icons
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-32 border-r border-pixel-black bg-pixel-cream p-1">
          <div className="text-xs font-pixel mb-2 text-pixel-black">Places</div>
          {folders.map((folder) => (
            <button
              key={folder.path}
              className={`w-full text-left px-1 py-1 text-xs hover:bg-pixel-blue hover:text-pixel-white flex items-center gap-1 ${
                currentPath === folder.path ? "bg-pixel-blue text-pixel-white" : ""
              }`}
              onClick={() => navigateToPath(folder.path)}
            >
              <span className="text-xs">{folder.icon}</span>
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-pixel-white">
          {viewMode === "list" ? (
            <div className="h-full">
              {/* List Header */}
              <div className="border-b border-pixel-black bg-pixel-cream px-2 py-1 flex text-xs font-pixel">
                <div className="w-6"></div>
                <div className="flex-1">Name</div>
                <div className="w-16">Size</div>
                <div className="w-20">Modified</div>
              </div>

              {/* File List */}
              <div className="overflow-auto h-[calc(100%-24px)]">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 flex items-center text-xs cursor-pointer hover:bg-pixel-blue hover:text-pixel-white ${
                      selectedItems.includes(file.name) ? "bg-pixel-blue text-pixel-white" : ""
                    }`}
                    onClick={() => handleItemClick(file)}
                    onDoubleClick={() => handleItemDoubleClick(file)}
                  >
                    <div className="w-6 text-center">{file.icon}</div>
                    <div className="flex-1 truncate">{file.name}</div>
                    <div className="w-16 text-right">{file.size || ""}</div>
                    <div className="w-20 text-right">{file.modified || ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 grid grid-cols-4 gap-2 overflow-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`p-2 flex flex-col items-center text-center cursor-pointer hover:bg-pixel-blue hover:text-pixel-white border ${
                    selectedItems.includes(file.name)
                      ? "bg-pixel-blue text-pixel-white border-pixel-blue"
                      : "border-transparent"
                  }`}
                  onClick={() => handleItemClick(file)}
                  onDoubleClick={() => handleItemDoubleClick(file)}
                >
                  <div className="text-lg mb-1">{file.icon}</div>
                  <div className="text-xs truncate w-full">{file.name}</div>
                  {file.size && <div className="text-xs text-pixel-gray">{file.size}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-pixel-black bg-pixel-cream px-2 py-1 text-xs">
        {files.length} item{files.length !== 1 ? "s" : ""}
        {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
      </div>
    </div>
  )
}
