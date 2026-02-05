/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react';
import { Book, Lock, LayoutGrid, FileText } from 'lucide-react';
import { SidebarItem } from './components/SidebarItem';
import { DocumentViewer } from './components/DocumentViewer';
import { EmptyState } from './components/EmptyState';
import { Flashcard } from './components/Flashcard';

function App() {
  const [view, setView] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ q: '', a: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedNotes = await window.studyHelperAPI.getNotes();
    const savedCards = await window.studyHelperAPI.getCards();
    setNotes(savedNotes);
    setCards(savedCards);
  };

  const handleAddCard = async () => {
    if (!newCard.q || !newCard.a) return;
    const updatedCards = [...cards, { id: Date.now(), question: newCard.q, answer: newCard.a }];
    setCards(updatedCards);
    await window.studyHelperAPI.saveCards(updatedCards);
    setNewCard({ q: '', a: '' });
  };

  const handleDelete = async (noteToDelete) => {
    const result = await window.studyHelperAPI.deleteNote(noteToDelete.path);
    
    if (result.success) {
      setNotes(notes.filter((n) => n.path !== noteToDelete.path));
      if (selectedNote?.path === noteToDelete.path) {
        setSelectedNote(null);
      }
    }
  };

  return (
    <div className='flex h-screen bg-[#F1F5F9] font-sans text-[#1E293B] overflow-hidden'>
      {/* SIDEBAR */}
      <aside className='w-72 bg-[#1E293B] text-white p-6 flex flex-col shadow-xl'>
        <div className='flex items-center gap-3 mb-10'>
          <div className='bg-blue-500 p-2 rounded-lg'>
            <Book size={24} />
          </div>
          <h1 className='text-xl font-bold tracking-tight'>Study Helper</h1>
        </div>

        <nav className='space-y-2 mb-8'>
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'notes' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <FileText size={18} /> Notes Library
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'quiz' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutGrid size={18} /> Quiz Mode
          </button>
        </nav>

        {view === 'notes' && (
          <div className='flex-1 overflow-y-auto space-y-2'>
            <button
              onClick={async () => {
                const n = await window.studyHelperAPI.openFilePicker();
                if (n) setNotes([...notes, n]);
              }}
              className='w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-white hover:border-blue-500 mb-4 transition text-sm'
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
      <main className='flex-1 flex flex-col overflow-hidden'>
        <header className='h-20 bg-white border-b flex items-center px-10 justify-between shadow-sm'>
          <h2 className='text-lg font-bold capitalize'>{view} Mode</h2>
          <div className='flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-full border'>
            <Lock size={14} /> <span className='text-xs font-bold uppercase'>Read Only</span>
          </div>
        </header>

        <div className='p-8 flex-1 overflow-y-auto bg-[#F8FAFC]'>
          {view === 'notes' ? (
            selectedNote ? (
              <DocumentViewer note={selectedNote} />
            ) : (
              <EmptyState />
            )
          ) : (
            <div className='max-w-4xl mx-auto'>
              <div className='bg-white p-6 rounded-2xl shadow-sm border mb-8 flex gap-4'>
                <input
                  value={newCard.q}
                  onChange={(e) => setNewCard({ ...newCard, q: e.target.value })}
                  className='flex-1 bg-slate-100 p-3 rounded-xl outline-none'
                  placeholder='Question'
                />
                <input
                  value={newCard.a}
                  onChange={(e) => setNewCard({ ...newCard, a: e.target.value })}
                  className='flex-1 bg-slate-100 p-3 rounded-xl outline-none'
                  placeholder='Answer'
                />
                <button
                  onClick={handleAddCard}
                  className='bg-blue-600 text-white px-6 rounded-xl font-bold'
                >
                  Add Card
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {cards.map((card) => (
                  <Flashcard key={card.id} question={card.question} answer={card.answer} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;