import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Book, Lock, LayoutGrid, FileText, Trash2, Search } from 'lucide-react'

// ==========================================
// 1. COMPONENTS
// ==========================================

const SidebarItem = ({ note, isActive, onClick, onDelete }) => {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-700 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText size={18} className={isActive ? 'text-blue-200' : 'text-slate-500'} />
        <span className="truncate font-medium text-sm">
          {note.name.replace('.html', '').replace('.txt', '')}
        </span>
      </div>

      {/* Delete Button - Only visible on hover or active */}
      <button
        onClick={(e) => {
          e.stopPropagation() // Prevent clicking the note itself
          onDelete(note)
        }}
        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
          isActive
            ? 'hover:bg-blue-500 text-blue-100'
            : 'hover:bg-slate-600 text-slate-400 hover:text-red-400'
        }`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

SidebarItem.propTypes = {
  note: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string,
    type: PropTypes.string
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

const DocumentViewer = ({ note }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white min-h-[calc(100vh-120px)] shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 truncate">{note.name}</h1>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-200 px-2 py-1 rounded">
          {note.type.toUpperCase()}
        </span>
      </div>
      <div
        className="p-8 prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </div>
  )
}

DocumentViewer.propTypes = {
  note: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired
}

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Search size={48} className="text-slate-300" />
      </div>
      <h2 className="text-xl font-bold text-slate-600 mb-2">No Note Selected</h2>
      <p className="text-sm max-w-xs text-center">
        Select a document from the sidebar to start reading or switch to Quiz Mode to test yourself.
      </p>
    </div>
  )
}

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="group h-64 w-full md:w-96 [perspective:1000px] cursor-pointer mx-auto mb-8"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front Side (Question) */}
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-200 px-8 text-center [backface-visibility:hidden]">
          <h3 className="text-xl font-bold text-slate-800">{question}</h3>
          <p className="absolute bottom-4 text-xs text-slate-400 uppercase tracking-widest">
            Click to Flip
          </p>
        </div>

        {/* Back Side (Answer) */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-blue-600 px-8 text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center">
          <p className="text-lg font-medium leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

Flashcard.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired
}

// ==========================================
// 2. MAIN APP LOGIC
// ==========================================

function App() {
  const [view, setView] = useState('notes')
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [cards, setCards] = useState([])
  const [newCard, setNewCard] = useState({ q: '', a: '' })

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      const savedNotes = await window.studyHelperAPI.getNotes()
      const savedCards = await window.studyHelperAPI.getCards()
      setNotes(savedNotes)
      setCards(savedCards)
    }
    initData()
  }, [])

  const handleAddCard = async () => {
    if (!newCard.q || !newCard.a) return
    const updatedCards = [...cards, { id: Date.now(), question: newCard.q, answer: newCard.a }]
    setCards(updatedCards)
    await window.studyHelperAPI.saveCards(updatedCards)
    setNewCard({ q: '', a: '' })
  }

  const handleDelete = async (noteToDelete) => {
    const result = await window.studyHelperAPI.deleteNote(noteToDelete.path)
    if (result.success) {
      setNotes(notes.filter((n) => n.path !== noteToDelete.path))
      if (selectedNote?.path === noteToDelete.path) {
        setSelectedNote(null)
      }
    }
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-[#1E293B] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#1E293B] text-white p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Book size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Study Helper</h1>
        </div>

        <nav className="space-y-2 mb-8">
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              view === 'notes' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <FileText size={18} /> Notes Library
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              view === 'quiz' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <LayoutGrid size={18} /> Quiz Mode
          </button>
        </nav>

        {view === 'notes' && (
          <div className="flex-1 overflow-y-auto space-y-2">
            <button
              onClick={async () => {
                const n = await window.studyHelperAPI.openFilePicker()
                if (n) setNotes([...notes, n])
              }}
              className="w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-white hover:border-blue-500 mb-4 transition text-sm"
            >
              + Import Note
            </button>
            {notes.map((note, i) => (
              <SidebarItem
                key={i}
                note={note}
                isActive={selectedNote?.name === note.name}
                onClick={() => setSelectedNote(note)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center px-10 justify-between shadow-sm">
          <h2 className="text-lg font-bold capitalize">{view} Mode</h2>
          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-full border">
            <Lock size={14} /> <span className="text-xs font-bold uppercase">Read Only</span>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto bg-[#F8FAFC]">
          {view === 'notes' ? (
            selectedNote ? (
              <DocumentViewer note={selectedNote} />
            ) : <EmptyState />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex gap-4">
                <input
                  value={newCard.q}
                  onChange={(e) => setNewCard({ ...newCard, q: e.target.value })}
                  className="flex-1 bg-slate-100 p-3 rounded-xl outline-none"
                  placeholder="Question"
                />
                <input
                  value={newCard.a}
                  onChange={(e) => setNewCard({ ...newCard, a: e.target.value })}
                  className="flex-1 bg-slate-100 p-3 rounded-xl outline-none"
                  placeholder="Answer"
                />
                <button
                  onClick={handleAddCard}
                  className="bg-blue-600 text-white px-6 rounded-xl font-bold"
                >
                  Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                  <Flashcard key={card.id} question={card.question} answer={card.answer} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App