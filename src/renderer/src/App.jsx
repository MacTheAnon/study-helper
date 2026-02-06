import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Book,
  LayoutGrid,
  FileText,
  Trash2,
  Search,
  Sparkles,
  Clock,
  Info,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

// ==========================================
// 1. COMPONENTS
// ==========================================

const SidebarItem = ({ note, isActive, onClick, onDelete }) => (
  <div
    onClick={onClick}
    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-700 text-slate-300'
    }`}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <FileText size={18} className={isActive ? 'text-blue-200' : 'text-slate-500'} />
      <span className="truncate font-medium text-sm">
        {note.name.replace('.html', '').replace('.txt', '').replace('.docx', '')}
      </span>
    </div>
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

const DocumentViewer = ({ note }) => (
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

DocumentViewer.propTypes = {
  note: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired
}

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className="group h-64 w-full md:w-96 [perspective:1000px] cursor-pointer mx-auto"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-200 px-8 text-center [backface-visibility:hidden]">
          <h3 className="text-xl font-bold text-slate-800">{question}</h3>
          <p className="absolute bottom-4 text-xs text-slate-400 uppercase tracking-widest">
            Click to Flip
          </p>
        </div>
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

const AboutPage = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
          <Book size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">About Study Helper</h1>
          <p className="text-slate-500">Version 1.0.0 • Educational Utility</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 leading-relaxed">
          Study Helper is designed to streamline your learning process. By combining a
          distraction-free reading environment with automated retrieval practice, we help you retain
          information faster and more effectively.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" /> Library & Reading
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Import your study guides, lecture notes, or textbooks (PDF/DOCX/TXT). Our read-only mode
          ensures you focus on the content without accidental edits.
        </p>
        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 border border-slate-200">
          <strong>Tip:</strong> Supports standard formatting and images from Word docs.
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" /> Smart Extraction
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Don&apos;t waste time typing. Our algorithms scan your notes for &quot;Term:
          Definition&quot; patterns and automatically generate flashcards for you.
        </p>
        <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-700 border border-amber-100">
          <strong>Try it:</strong> Open a note and click &quot;Auto-Generate Cards&quot; in the top
          bar.
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <LayoutGrid size={20} className="text-indigo-500" /> Quiz Mode
        </h3>
        <p className="text-slate-600 text-sm">
          Test your knowledge with interactive flashcards. Flip cards to reveal answers and
          reinforce your memory through active recall.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-emerald-500" /> Focus Timer
        </h3>
        <p className="text-slate-600 text-sm">
          Built-in adjustable timer helps you structure your study sessions. Click the time to edit
          the duration.
        </p>
      </div>
    </div>
  </div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <div className="bg-slate-100 p-6 rounded-full mb-6">
      <Search size={48} className="text-slate-300" />
    </div>
    <h2 className="text-xl font-bold text-slate-600 mb-2">No Note Selected</h2>
    <p className="text-sm max-w-xs text-center">
      Select a document from the sidebar to start reading or switch to Quiz Mode.
    </p>
  </div>
)

// ==========================================
// 2. MAIN APP LOGIC
// ==========================================

function App() {
  const [view, setView] = useState('about')
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [cards, setCards] = useState([])
  const [newCard, setNewCard] = useState({ q: '', a: '' })

  // --- TIMER STATE ---
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(30) // Default 30 mins
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [isEditingTimer, setIsEditingTimer] = useState(false)

  // Load Data
  useEffect(() => {
    const initData = async () => {
      const savedNotes = await window.studyHelperAPI.getNotes()
      const savedCards = await window.studyHelperAPI.getCards()
      setNotes(savedNotes)
      setCards(savedCards)
      if (savedNotes.length > 0) setView('notes')
    }
    initData()
  }, [])

  // Timer Logic (Fixed to avoid setState warning)
  useEffect(() => {
    let interval = null
    if (timerActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerActive(false) // Safe state update inside callback
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleTimerEdit = (e) => {
    if (e.key === 'Enter') {
      const newMins = parseInt(e.target.value, 10)
      if (!isNaN(newMins) && newMins > 0) {
        setTimerDuration(newMins)
        setTimeLeft(newMins * 60)
        setIsEditingTimer(false)
        setTimerActive(false)
      }
    }
  }

  // Flashcard Logic
  const extractFlashcards = async () => {
    if (!selectedNote || !selectedNote.content) return
    const text = selectedNote.content.replace(/<[^>]*>/g, '')
    const lines = text.split(/\r?\n/)
    const newExtractedCards = []

    lines.forEach((line) => {
      const parts = line.split(/[:\-\u2014]/)
      if (parts.length === 2 && parts[0].trim().length < 60 && parts[1].trim().length > 3) {
        newExtractedCards.push({
          id: Date.now() + Math.random(),
          question: parts[0].trim(),
          answer: parts[1].trim()
        })
      }
    })

    if (newExtractedCards.length > 0) {
      const updated = [...cards, ...newExtractedCards]
      setCards(updated)
      await window.studyHelperAPI.saveCards(updated)
      alert(`Auto-generated ${newExtractedCards.length} flashcards from this note!`)
    }
  }

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

  // View Routing
  const renderContent = () => {
    switch (view) {
      case 'about':
        return <AboutPage />
      case 'quiz':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex gap-4">
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
        )
      case 'notes':
      default:
        return selectedNote ? <DocumentViewer note={selectedNote} /> : <EmptyState />
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
        <nav className="space-y-2 mb-8 flex-1">
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
          <button
            onClick={() => setView('about')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              view === 'about' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <Info size={18} /> About App
          </button>
        </nav>

        {view === 'notes' && (
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] border-t border-slate-700 pt-4">
            <div className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">Your Files</div>
            <button
              onClick={async () => {
                const n = await window.studyHelperAPI.openFilePicker()
                if (n) setNotes([...notes, n])
              }}
              className="w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-white mb-4 transition text-sm"
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
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize">{view} Mode</h2>
            {selectedNote && view === 'notes' && (
              <button
                onClick={extractFlashcards}
                className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition"
              >
                <Sparkles size={14} /> Auto-Generate Cards
              </button>
            )}
          </div>

          {/* FUNCTIONAL TIMER COMPONENT */}
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${
              timerActive
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Clock size={16} className={timerActive ? 'animate-pulse' : ''} />

            {isEditingTimer ? (
              <input
                type="number"
                defaultValue={timerDuration}
                className="w-12 bg-white border border-slate-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onBlur={() => setIsEditingTimer(false)}
                onKeyDown={handleTimerEdit}
              />
            ) : (
              <span
                className="text-sm font-mono font-bold cursor-pointer hover:text-blue-600"
                onClick={() => setIsEditingTimer(true)}
                title="Click to edit duration"
              >
                {formatTime(timeLeft)}
              </span>
            )}

            <div className="w-px h-4 bg-slate-300"></div>

            <button
              onClick={() => setTimerActive(!timerActive)}
              className="hover:text-blue-600 transition"
              title={timerActive ? 'Pause' : 'Start'}
            >
              {timerActive ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button
              onClick={() => {
                setTimerActive(false)
                setTimeLeft(timerDuration * 60)
              }}
              className="hover:text-blue-600 transition"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto bg-[#F8FAFC]">{renderContent()}</div>
      </main>
    </div>
  )
}

export default App
