import { useState, useEffect, useMemo } from 'react'
import { Book, Plus, Lock } from 'lucide-react'

// 1. Import your new components
import { SidebarItem } from './components/SidebarItem'
import { SearchBar } from './components/SearchBar'
import { DocumentViewer } from './components/DocumentViewer'
import { EmptyState } from './components/EmptyState'

function App() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Load notes from AppData on startup
  useEffect(() => {
    const loadNotes = async () => {
      const saved = await window.studyHelperAPI.getNotes()
      setNotes(saved)
    }
    loadNotes()
  }, [])

  const handleImport = async () => {
    const newNote = await window.studyHelperAPI.openFilePicker()
    if (newNote) {
      setNotes(prev => [...prev, newNote])
      setSelectedNote(newNote)
    }
  }
const handleDelete = async (noteToDelete) => {
  const confirmed = window.confirm(`Are you sure you want to remove "${noteToDelete.name}"?`);
  if (confirmed) {
    const result = await window.studyHelperAPI.deleteNote(noteToDelete.path);
    if (result.success) {
      setNotes(notes.filter(n => n.path !== noteToDelete.path));
      if (selectedNote?.path === noteToDelete.path) setSelectedNote(null);
    }
  }
};
  // Filter notes based on the search bar
  const filteredNotes = useMemo(() => {
    return notes.filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [notes, searchTerm])

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-[#1E293B] overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#1E293B] text-white p-6 flex flex-col shadow-xl z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-500 p-2 rounded-lg"><Book size={24} /></div>
          <h1 className="text-xl font-bold tracking-tight">Study Helper</h1>
        </div>

        <button 
          onClick={handleImport} 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl mb-8 transition-all font-semibold shadow-lg"
        >
          <Plus size={18} /> Import Note
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Library</p>
          
          {/* IMPLEMENTATION: Mapping through notes using SidebarItem component */}
          {filteredNotes.map((note, i) => (
          <SidebarItem 
            key={i} 
            note={note} 
            isActive={selectedNote?.name === note.name} 
            onClick={() => setSelectedNote(note)} 
            onDelete={handleDelete} // Pass the function here
          />
        ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-10 justify-between shadow-sm">
          
          {/* IMPLEMENTATION: SearchBar component */}
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <Lock size={14} /> 
            <span className="text-xs font-bold uppercase tracking-tighter">Read Only Mode</span>
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-auto bg-[#F8FAFC]">
          {/* IMPLEMENTATION: Conditional rendering between Viewer and Empty State */}
          {selectedNote ? (
            <DocumentViewer note={selectedNote} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  )
}

export default App