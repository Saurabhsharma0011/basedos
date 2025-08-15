"use client"

import { useState } from "react"

interface Note {
  id: string
  title: string
  content: string
  modified: string
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome.txt",
      content:
        "Welcome to Retro Pixel OS Notes!\n\nThis is a simple text editor where you can create and edit notes.\n\nFeatures:\n- Create new notes\n- Edit existing notes\n- Auto-save functionality\n- Retro pixel styling\n\nEnjoy writing!",
      modified: "12/15/24 10:30 AM",
    },
    {
      id: "2",
      title: "Todo.txt",
      content:
        "Things to do:\n\n[ ] Learn the new OS\n[ ] Write some notes\n[ ] Explore the file manager\n[ ] Try the terminal\n[x] Have fun with retro computing!",
      modified: "12/15/24 09:15 AM",
    },
  ])
  const [selectedNoteId, setSelectedNoteId] = useState<string>("1")
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled.txt",
      content: "",
      modified: new Date().toLocaleString(),
    }
    setNotes((prev) => [...prev, newNote])
    setSelectedNoteId(newNote.id)
    setIsEditing(true)
    setEditContent("")
  }

  const startEditing = () => {
    if (selectedNote) {
      setIsEditing(true)
      setEditContent(selectedNote.content)
    }
  }

  const saveNote = () => {
    if (selectedNote) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNote.id ? { ...note, content: editContent, modified: new Date().toLocaleString() } : note,
        ),
      )
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditContent("")
  }

  const deleteNote = () => {
    if (selectedNote && notes.length > 1) {
      setNotes((prev) => prev.filter((note) => note.id !== selectedNote.id))
      const remainingNotes = notes.filter((note) => note.id !== selectedNote.id)
      setSelectedNoteId(remainingNotes[0]?.id || "")
    }
  }

  const renameNote = () => {
    if (selectedNote) {
      const newTitle = prompt("Enter new filename:", selectedNote.title)
      if (newTitle && newTitle.trim()) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === selectedNote.id
              ? { ...note, title: newTitle.trim(), modified: new Date().toLocaleString() }
              : note,
          ),
        )
      }
    }
  }

  return (
    <div className="h-full flex font-pixel text-xs">
      {/* File List Sidebar */}
      <div className="w-48 border-r border-pixel-black bg-pixel-cream">
        {/* Toolbar */}
        <div className="border-b border-pixel-black p-1 flex gap-1">
          <button
            className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
            onClick={createNewNote}
            title="New Note"
          >
            New
          </button>
          <button
            className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
            onClick={renameNote}
            disabled={!selectedNote}
            title="Rename"
          >
            Rename
          </button>
          <button
            className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
            onClick={deleteNote}
            disabled={!selectedNote || notes.length <= 1}
            title="Delete"
          >
            Delete
          </button>
        </div>

        {/* File List */}
        <div className="p-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-2 cursor-pointer hover:bg-pixel-blue hover:text-pixel-white ${
                selectedNoteId === note.id ? "bg-pixel-blue text-pixel-white" : ""
              }`}
              onClick={() => {
                setSelectedNoteId(note.id)
                setIsEditing(false)
              }}
            >
              <div className="font-pixel text-xs truncate">{note.title}</div>
              <div className="text-xs text-pixel-gray mt-1">{note.modified}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedNote && (
          <>
            {/* Editor Toolbar */}
            <div className="border-b border-pixel-black bg-pixel-cream p-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-pixel">{selectedNote.title}</span>
                <span className="text-xs text-pixel-gray">- {selectedNote.modified}</span>
              </div>
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <button
                      className="px-2 py-1 border border-pixel-black bg-pixel-green text-pixel-white hover:bg-green-600 text-xs"
                      onClick={saveNote}
                    >
                      Save
                    </button>
                    <button
                      className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="px-2 py-1 border border-pixel-black bg-pixel-white hover:bg-pixel-cream text-xs"
                    onClick={startEditing}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-2 bg-pixel-white">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full resize-none border border-pixel-black p-2 font-mono-pixel text-xs bg-pixel-white focus:outline-none focus:ring-1 focus:ring-pixel-blue"
                  placeholder="Start typing your note..."
                  autoFocus
                />
              ) : (
                <div className="h-full overflow-auto">
                  <pre className="font-mono-pixel text-xs whitespace-pre-wrap text-pixel-black">
                    {selectedNote.content || "This note is empty. Click Edit to add content."}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
