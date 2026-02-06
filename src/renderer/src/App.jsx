import { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import Confetti from 'react-confetti'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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
  RotateCcw,
  Folder,
  Maximize,
  Minimize,
  Volume2,
  Trophy,
  Activity,
  Settings,
  BrainCircuit,
  Cpu,
  ExternalLink,
  Headphones,
  Download,
  Upload,
  X,
  Square,
  CloudRain,
  Waves,
  Zap,
  Music,
  Volume1
} from 'lucide-react'

// ==========================================
// 1. UTILS (Advanced Audio Engine)
// ==========================================

const AudioEngine = {
  ctx: null,
  gainNode: null,
  activeSource: null,
  mode: 'rain',
  volume: 0.5,

  init: function () {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.gainNode = this.ctx.createGain()
      this.gainNode.connect(this.ctx.destination)
      this.gainNode.gain.value = this.volume
    }
  },

  setVolume: function (val) {
    this.volume = val
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1)
    }
  },

  stop: function () {
    if (this.activeSource) {
      try {
        this.activeSource.stop ? this.activeSource.stop() : this.activeSource.pause()
        this.activeSource.disconnect && this.activeSource.disconnect()
      } catch {
        /* ignore */
      }
      this.activeSource = null
    }
  },

  play: function (mode) {
    this.init()
    this.stop()
    this.mode = mode

    if (this.ctx.state === 'suspended') this.ctx.resume()

    switch (mode) {
      case 'rain':
        this.playNoise('pink')
        break
      case 'ocean':
        this.playOcean()
        break
      case 'meditation':
        this.playDrone()
        break
      case 'lofi':
        this.playLofi()
        break
      default:
        this.playNoise('brown')
    }
  },

  playNoise: function (type) {
    const bufferSize = 4096
    const node = this.ctx.createScriptProcessor(bufferSize, 1, 1)
    let b0, b1, b2, b3, b4, b5, b6
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0

    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        if (type === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          b3 = 0.8665 * b3 + white * 0.3104856
          b4 = 0.55 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.016898
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
          output[i] *= 0.11
          b6 = white * 0.115926
        } else {
          const val = (b0 + 0.02 * white) / 1.02
          b0 = val
          output[i] = val * 3.5
        }
      }
    }
    node.connect(this.gainNode)
    this.activeSource = node
  },

  playOcean: function () {
    const bufferSize = 4096
    const node = this.ctx.createScriptProcessor(bufferSize, 1, 1)
    let lastOut = 0
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
        output[i] *= 3.5
      }
    }

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 1

    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.1
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 800

    node.connect(filter)
    filter.connect(this.gainNode)

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    filter.frequency.value = 1000

    lfo.start()
    this.activeSource = {
      stop: () => {
        lfo.stop()
        node.disconnect()
        filter.disconnect()
      }
    }
  },

  playDrone: function () {
    const osc1 = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    gain.gain.value = 0.2

    osc1.type = 'sine'
    osc2.type = 'sine'
    osc1.frequency.value = 150
    osc2.frequency.value = 152

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.gainNode)

    osc1.start()
    osc2.start()

    this.activeSource = {
      stop: () => {
        osc1.stop()
        osc2.stop()
      }
    }
  },

  playLofi: function () {
    const audio = new Audio('https://stream.zeno.fm/0r0xa792kwzuv')
    audio.crossOrigin = 'anonymous'
    const source = this.ctx.createMediaElementSource(audio)
    source.connect(this.gainNode)
    audio.play()
    this.activeSource = {
      stop: () => {
        audio.pause()
        source.disconnect()
      }
    }
  }
}

// ==========================================
// 2. COMPONENTS
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
        e.stopPropagation()
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

const DocumentViewer = ({ note }) => {
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [ttsStatus, setTtsStatus] = useState('stopped')

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      if (available.length > 0 && !selectedVoice) {
        const defaultVoice = available.find((v) => v.lang.startsWith('en')) || available[0]
        setSelectedVoice(defaultVoice.name)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => window.speechSynthesis.cancel()
  }, [selectedVoice])

  // Removed the setTtsStatus useEffect here to fix "Set State in Effect" error.
  // Instead, the parent component passes a 'key' to force remount on note change.

  const handlePlay = () => {
    if (ttsStatus === 'paused') {
      window.speechSynthesis.resume()
      setTtsStatus('playing')
      return
    }
    window.speechSynthesis.cancel()
    const text = note.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utterance.voice = voice
    utterance.onend = () => setTtsStatus('stopped')
    window.speechSynthesis.speak(utterance)
    setTtsStatus('playing')
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setTtsStatus('paused')
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setTtsStatus('stopped')
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-[calc(100vh-120px)] shadow-sm border border-slate-200 rounded-xl overflow-hidden relative">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 truncate max-w-md">{note.name}</h1>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-200 px-2 py-1 rounded">
            {note.type.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 w-fit shadow-sm">
          <Volume2 size={16} className="text-slate-400 ml-2" />
          <select
            className="text-xs bg-transparent font-bold text-slate-600 outline-none max-w-[200px] truncate cursor-pointer hover:text-blue-600"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          {ttsStatus === 'playing' ? (
            <button
              onClick={handlePause}
              className="p-1.5 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded transition"
            >
              <Pause size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="p-1.5 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded transition"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
          <button
            onClick={handleStop}
            className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded transition"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>
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
    content: PropTypes.string.isRequired,
    path: PropTypes.string
  }).isRequired
}

const Flashcard = ({ card, onDelete, onReview, interactive = true }) => {
  const [flipped, setFlipped] = useState(false)

  // Removed the useEffect that reset flipped state on card.id change.
  // We rely on the parent providing a unique 'key={card.id}' to force a remount.

  useEffect(() => {
    if (!interactive) return
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [interactive])

  const handleReview = (e, difficulty) => {
    e?.stopPropagation()
    onReview(card.id, difficulty)
    setFlipped(false)
  }

  return (
    <div
      className={`group w-full ${interactive ? 'h-96 max-w-2xl' : 'h-72 md:w-96'} [perspective:1000px] cursor-pointer mx-auto relative`}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-slate-200 px-8 text-center [backface-visibility:hidden]">
          <h3 className={`${interactive ? 'text-3xl' : 'text-xl'} font-bold text-slate-800`}>
            {card.question}
          </h3>
          <p className="absolute bottom-4 text-xs text-slate-400 uppercase tracking-widest">
            {interactive ? 'Press Space to Flip' : 'Click to Flip'}
          </p>
          {card.masteryLevel > 0 && (
            <div className="absolute top-4 left-4 flex gap-1">
              {[...Array(card.masteryLevel)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-400"></div>
              ))}
            </div>
          )}
        </div>

        {/* BACK */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-slate-800 px-8 text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center">
          <p className={`${interactive ? 'text-2xl' : 'text-lg'} font-medium leading-relaxed mb-6`}>
            {card.answer}
          </p>
          <div className="flex gap-2 w-full justify-center">
            <button
              onClick={(e) => handleReview(e, 'hard')}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
            >
              Hard {interactive && '(1)'}
            </button>
            <button
              onClick={(e) => handleReview(e, 'good')}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
            >
              Good {interactive && '(2)'}
            </button>
            <button
              onClick={(e) => handleReview(e, 'easy')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
            >
              Easy {interactive && '(3)'}
            </button>
          </div>
        </div>
      </div>
      {!interactive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute -top-2 -right-2 bg-slate-200 text-slate-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm z-10 hover:bg-red-500 hover:text-white"
          title="Delete Card"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

Flashcard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    masteryLevel: PropTypes.number
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onReview: PropTypes.func.isRequired,
  interactive: PropTypes.bool
}

const StatsView = ({ xp, level, cards, categories }) => {
  const data = categories.map((cat) => {
    const catCards = cards.filter((c) => c.category === cat)
    const mastered = catCards.filter((c) => c.masteryLevel >= 3).length
    return { name: cat, total: catCards.length, mastered: mastered }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Trophy size={64} />
          </div>
          <div className="text-sm font-medium opacity-80 mb-1">Current Level</div>
          <div className="text-4xl font-bold mb-2">{level}</div>
          <div className="text-xs bg-white/20 inline-block px-2 py-1 rounded-lg">
            {xp} XP Earned Total
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <BrainCircuit size={20} />
            <span className="text-sm font-bold uppercase">Total Cards</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{cards.length}</div>
          <div className="text-xs text-slate-400 mt-2"> across {categories.length} categories</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Sparkles size={20} />
            <span className="text-sm font-bold uppercase">Mastery</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {cards.filter((c) => c.masteryLevel >= 3).length}
          </div>
          <div className="text-xs text-slate-400 mt-2"> cards fully mastered</div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-96">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Learning Progress by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total Cards" />
            <Bar dataKey="mastered" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mastered" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

StatsView.propTypes = {
  xp: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired
}

// ==========================================
// 2. MAIN APP
// ==========================================

function App() {
  const [view, setView] = useState('about')
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  // Data
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState(['General'])
  const [activeCategory, setActiveCategory] = useState('General')

  // Gamification
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)

  // UI
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [newCard, setNewCard] = useState({ q: '', a: '' })
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Audio
  const [audioMode, setAudioMode] = useState('rain')
  const [audioVolume, setAudioVolume] = useState(0.5)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showAudioControls, setShowAudioControls] = useState(false)

  // Study Mode
  const [isStudySession, setIsStudySession] = useState(false)
  const [studyQueue, setStudyQueue] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Timer
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(30)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [isEditingTimer, setIsEditingTimer] = useState(false)

  // Settings
  const [apiKeys, setApiKeys] = useState({ openai: '', groq: '', gemini: '' })
  const [selectedProvider, setSelectedProvider] = useState('gemini')

  const fileInputRef = useRef(null)

  // --- INITIAL LOAD ---
  useEffect(() => {
    const initData = async () => {
      const savedNotes = await window.studyHelperAPI.getNotes()
      const savedData = await window.studyHelperAPI.getCards()
      const savedKeys = localStorage.getItem('study_api_keys')
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys)
        setApiKeys(parsed)
        if (parsed.provider) setSelectedProvider(parsed.provider)
      }

      setNotes(savedNotes)
      if (savedNotes.length > 0) setView('notes')

      if (savedData) {
        if (savedData.cards) setCards(savedData.cards)
        if (savedData.categories) setCategories(savedData.categories)
        if (savedData.xp) {
          setXp(savedData.xp)
          setLevel(Math.floor(Math.sqrt(savedData.xp) * 0.2) + 1)
        }
      }
    }
    initData()
  }, [])

  // --- SHORTCUTS & SEARCH ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        if (!isFocusMode && searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isFocusMode])

  const persistData = useCallback(async (newCards, newCategories, newXp) => {
    await window.studyHelperAPI.saveCards({
      cards: newCards,
      categories: newCategories,
      xp: newXp
    })
  }, [])

  const saveSettings = () => {
    localStorage.setItem(
      'study_api_keys',
      JSON.stringify({ ...apiKeys, provider: selectedProvider })
    )
    alert('Settings Saved!')
  }

  // --- AUDIO LOGIC ---
  const toggleAudio = () => {
    const newState = !isPlayingAudio
    setIsPlayingAudio(newState)
    if (newState) {
      AudioEngine.play(audioMode)
      AudioEngine.setVolume(audioVolume)
    } else {
      AudioEngine.stop()
    }
  }

  const changeAudioMode = (mode) => {
    setAudioMode(mode)
    if (isPlayingAudio) {
      AudioEngine.play(mode)
      AudioEngine.setVolume(audioVolume)
    }
  }

  const changeVolume = (val) => {
    const vol = parseFloat(val)
    setAudioVolume(vol)
    AudioEngine.setVolume(vol)
  }

  // --- EXPORT / IMPORT ---
  const handleExportData = () => {
    const dataStr = JSON.stringify({ cards, categories, xp, level })
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `study-helper-backup-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportData = (e) => {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (parsed.cards && parsed.categories) {
          setCards(parsed.cards)
          setCategories(parsed.categories)
          setXp(parsed.xp || 0)
          setLevel(parsed.level || 1)
          persistData(parsed.cards, parsed.categories, parsed.xp || 0)
          alert('Data restored successfully!')
        } else {
          alert('Invalid backup file.')
        }
      } catch (err) {
        console.error(err)
        alert('Error reading file.')
      }
    }
  }

  // --- AI LOGIC ---
  const callAI = async (text) => {
    const prompt = `Extract 5 flashcards from the text below. Return ONLY raw JSON in this format: [{"question": "...", "answer": "..."}]. Do not wrap in markdown or code blocks. Text: ${text.substring(0, 3000)}`
    try {
      let data
      if (selectedProvider === 'openai' && apiKeys.openai) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeys.openai}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
          })
        })
        data = await res.json()
        return JSON.parse(data.choices[0].message.content)
      } else if (selectedProvider === 'groq' && apiKeys.groq) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeys.groq}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }]
          })
        })
        data = await res.json()
        return JSON.parse(data.choices[0].message.content)
      } else if (selectedProvider === 'gemini' && apiKeys.gemini) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        )
        data = await res.json()
        let rawText = data.candidates[0].content.parts[0].text
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '')
        return JSON.parse(rawText)
      } else {
        throw new Error('No API Key found for selected provider')
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const handleAiExtract = async () => {
    if (!selectedNote) return
    setIsAiLoading(true)
    const plainText = selectedNote.content.replace(/<[^>]*>/g, ' ')
    const aiCards = await callAI(plainText)

    if (aiCards && Array.isArray(aiCards)) {
      const formattedCards = aiCards.map((c) => ({
        id: Date.now() + Math.random(),
        question: c.question,
        answer: c.answer,
        category: activeCategory,
        masteryLevel: 0
      }))
      const updated = [...cards, ...formattedCards]
      setCards(updated)
      const newXp = xp + 50
      setXp(newXp)
      persistData(updated, categories, newXp)
      alert(`AI Generated ${formattedCards.length} cards! (+50 XP)`)
    } else {
      alert('AI Generation failed. Please check your API Keys in Settings.')
    }
    setIsAiLoading(false)
  }

  // --- XP & LEVEL SYSTEM ---
  const addXp = useCallback(
    (amount) => {
      setXp((prevXp) => {
        const newXp = prevXp + amount
        const newLevel = Math.floor(Math.sqrt(newXp) * 0.2) + 1
        setLevel((prevLevel) => {
          if (newLevel > prevLevel) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
            return newLevel
          }
          return prevLevel
        })
        persistData(cards, categories, newXp)
        return newXp
      })
    },
    [cards, categories, persistData]
  )

  const handleCardReview = useCallback(
    (cardId, difficulty) => {
      const updatedCards = cards.map((c) => {
        if (c.id === cardId) {
          let mastery = c.masteryLevel || 0
          if (difficulty === 'easy') mastery = Math.min(mastery + 1, 5)
          if (difficulty === 'hard') mastery = Math.max(mastery - 1, 0)
          return { ...c, masteryLevel: mastery, lastReviewed: Date.now() }
        }
        return c
      })
      setCards(updatedCards)
      persistData(updatedCards, categories, xp)

      if (difficulty === 'easy') addXp(20)
      else if (difficulty === 'good') addXp(10)
      else addXp(5)

      if (isStudySession) {
        if (currentCardIndex < studyQueue.length - 1) {
          setCurrentCardIndex((prev) => prev + 1)
        } else {
          alert('Session Complete! +100 Bonus XP')
          addXp(100)
          setIsStudySession(false)
          setIsFocusMode(false)
        }
      }
    },
    [cards, categories, xp, addXp, isStudySession, studyQueue, currentCardIndex, persistData]
  )

  const startStudySession = () => {
    const sessionCards = cards.filter((c) => c.category === activeCategory)
    if (sessionCards.length === 0) return alert('No cards in this category!')
    sessionCards.sort((a, b) => (a.masteryLevel || 0) - (b.masteryLevel || 0))
    setStudyQueue(sessionCards)
    setCurrentCardIndex(0)
    setIsStudySession(true)
    setIsFocusMode(true)
  }

  useEffect(() => {
    if (!isStudySession) return
    const handleKeyDown = (e) => {
      if (['1', '2', '3'].includes(e.key)) {
        const difficulty = e.key === '1' ? 'hard' : e.key === '2' ? 'good' : 'easy'
        const currentCard = studyQueue[currentCardIndex]
        if (currentCard) handleCardReview(currentCard.id, difficulty)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isStudySession, currentCardIndex, studyQueue, handleCardReview])

  // --- TIMER ---
  useEffect(() => {
    let interval = null
    if (timerActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerActive(false)
            addXp(50)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, addXp])

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

  // --- ACTIONS ---
  const handleAddCard = async () => {
    if (!newCard.q || !newCard.a) return
    const updatedCards = [
      ...cards,
      {
        id: Date.now(),
        question: newCard.q,
        answer: newCard.a,
        category: activeCategory,
        masteryLevel: 0
      }
    ]
    setCards(updatedCards)
    await persistData(updatedCards, categories, xp)
    setNewCard({ q: '', a: '' })
    addXp(10)
  }

  const deleteCard = async (cardId) => {
    const updatedCards = cards.filter((c) => c.id !== cardId)
    setCards(updatedCards)
    await persistData(updatedCards, categories, xp)
  }

  const handleAddCategory = async () => {
    const name = prompt('Enter new category name:')
    if (name && !categories.includes(name)) {
      const updatedCats = [...categories, name]
      setCategories(updatedCats)
      setActiveCategory(name)
      await persistData(cards, updatedCats, xp)
    }
  }

  const handleDeleteCategory = async () => {
    if (categories.length === 1) return alert('Keep at least one category.')
    if (confirm(`Delete "${activeCategory}"?`)) {
      const remainingCards = cards.filter((c) => c.category !== activeCategory)
      const remainingCats = categories.filter((c) => c !== activeCategory)
      setCards(remainingCards)
      setCategories(remainingCats)
      setActiveCategory(remainingCats[0])
      await persistData(remainingCards, remainingCats, xp)
    }
  }

  const handleDeleteNote = async (note) => {
    await window.studyHelperAPI.deleteNote(note.path)
    setNotes(notes.filter((n) => n.path !== note.path))
    if (selectedNote?.path === note.path) setSelectedNote(null)
  }

  // --- RENDER ---
  const renderContent = () => {
    if (isStudySession) {
      const card = studyQueue[currentCardIndex]
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-700">Speed Review</h2>
            <p className="text-slate-400">
              Card {currentCardIndex + 1} of {studyQueue.length}
            </p>
          </div>
          <Flashcard
            key={card.id}
            card={card}
            onReview={handleCardReview}
            interactive={true}
            onDelete={() => {}}
          />
          <div className="flex gap-4 text-sm text-slate-400">
            <span>[Space] Flip</span>
            <span>[1] Hard</span>
            <span>[2] Good</span>
            <span>[3] Easy</span>
          </div>
          <button
            onClick={() => {
              setIsStudySession(false)
              setIsFocusMode(false)
            }}
            className="text-red-400 hover:text-red-600 font-bold"
          >
            Exit Session
          </button>
        </div>
      )
    }

    if (view === 'about') {
      return (
        <div className="max-w-2xl mx-auto text-center mt-10">
          <Book size={64} className="mx-auto text-blue-500 mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Study Helper™</h1>
          <p className="text-slate-500 mb-8">The ultimate distraction-free learning environment.</p>
          <div className="grid grid-cols-2 gap-4 text-left mb-10">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <Trophy className="text-amber-500 mb-2" /> Earn XP while you study.
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <Activity className="text-blue-500 mb-2" /> Track your stats over time.
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <Volume2 className="text-emerald-500 mb-2" /> Listen to your notes via TTS.
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <Cpu className="text-pink-500 mb-2" /> AI Powered Flashcard Generation.
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Cpu size={20} className="text-indigo-500" /> How to Enable AI Features
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              To use the &quot;AI Extract&quot; feature, you need an API Key. Don&apos;t worry,
              it&apos;s easy! Click a provider below to get your key, then paste it in{' '}
              <strong>Settings</strong>.
            </p>
            <div className="space-y-3">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition group decoration-0 no-underline"
              >
                <div>
                  <div className="font-bold text-slate-700 group-hover:text-blue-600">
                    Google Gemini API
                  </div>
                  <div className="text-xs text-slate-400">
                    Best for beginners. Generous free tier.
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Get Key <ExternalLink size={12} />
                </div>
              </a>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-400 transition group decoration-0 no-underline"
              >
                <div>
                  <div className="font-bold text-slate-700 group-hover:text-orange-600">
                    Groq Cloud API
                  </div>
                  <div className="text-xs text-slate-400">
                    Insanely fast. Currently offers free beta access.
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Get Key <ExternalLink size={12} />
                </div>
              </a>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-green-400 transition group decoration-0 no-underline"
              >
                <div>
                  <div className="font-bold text-slate-700 group-hover:text-green-600">
                    OpenAI API (ChatGPT)
                  </div>
                  <div className="text-xs text-slate-400">
                    Industry standard. Requires a paid credit balance.
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  Get Key <ExternalLink size={12} />
                </div>
              </a>
            </div>
          </div>
          <div className="mt-8 text-xs text-slate-400">
            Developed by{' '}
            <a
              href="https://www.mcintoshdigital.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold hover:text-blue-500 transition-colors"
            >
              McIntosh Digital Solutions
            </a>{' '}
            • Kaleb McIntosh
          </div>
        </div>
      )
    }

    if (view === 'stats')
      return <StatsView xp={xp} level={level} cards={cards} categories={categories} />

    if (view === 'settings') {
      return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="text-slate-400" /> Settings & Data
          </h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            className="hidden"
            accept=".json"
          />
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Folder size={18} /> Backup & Restore
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-bold transition"
                >
                  <Download size={16} /> Export Data
                </button>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-bold transition"
                >
                  <Upload size={16} /> Import Backup
                </button>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-800 mb-4">
                <strong>Note:</strong> Your keys are stored locally on your computer.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Active Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-slate-700"
                >
                  <option value="gemini">Google Gemini (Free Tier)</option>
                  <option value="openai">OpenAI (GPT-4o Mini)</option>
                  <option value="groq">Groq (Llama 3 / Mixtral)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                  placeholder="AIza..."
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Groq API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                  placeholder="gsk_..."
                  value={apiKeys.groq}
                  onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                />
              </div>
              <button
                onClick={saveSettings}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold w-full hover:bg-blue-700 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (view === 'quiz') {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <Folder className="text-indigo-500" />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="font-bold text-lg bg-transparent outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={startStudySession}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition"
              >
                <Play size={16} fill="currentColor" /> Start Session
              </button>
              <button
                onClick={handleAddCategory}
                className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                New Category
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <input
              value={newCard.q}
              onChange={(e) => setNewCard({ ...newCard, q: e.target.value })}
              className="flex-1 bg-slate-50 p-2 rounded-lg"
              placeholder="Question"
            />
            <input
              value={newCard.a}
              onChange={(e) => setNewCard({ ...newCard, a: e.target.value })}
              className="flex-1 bg-slate-50 p-2 rounded-lg"
              placeholder="Answer"
            />
            <button
              onClick={handleAddCard}
              className="bg-blue-600 text-white px-6 rounded-lg font-bold"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {cards
              .filter((c) => c.category === activeCategory)
              .map((card) => (
                <Flashcard
                  key={card.id}
                  card={card}
                  onDelete={() => deleteCard(card.id)}
                  onReview={handleCardReview}
                  interactive={false}
                />
              ))}
          </div>
        </div>
      )
    }

    return selectedNote ? (
      <DocumentViewer note={selectedNote} key={selectedNote.path} />
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <Search size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-600">Select a Note</h2>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-[#1E293B] overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      {!isFocusMode && (
        <aside
          className="w-72 bg-[#1E293B] text-white p-6 flex flex-col shadow-xl relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Book size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Study Helper<span className="text-xs align-top ml-0.5 opacity-70">™</span>
              </h1>
              <div className="text-xs text-blue-200 font-medium">
                Lvl {level} • {xp} XP
              </div>
            </div>
          </div>
          <nav className="space-y-1 mb-8 flex-1 relative z-10">
            <button
              onClick={() => setView('notes')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'notes' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <FileText size={18} /> Notes
            </button>
            <button
              onClick={() => setView('quiz')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'quiz' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <LayoutGrid size={18} /> Flashcards
            </button>
            <button
              onClick={() => setView('stats')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'stats' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <Activity size={18} /> Stats & Progress
            </button>
            <button
              onClick={() => setView('settings')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <Settings size={18} /> Settings
            </button>
            <button
              onClick={() => setView('about')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${view === 'about' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <Info size={18} /> About
            </button>
          </nav>
          <div className="relative mb-2 px-2">
            <Search size={14} className="absolute left-5 top-3 text-slate-400" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes... (Ctrl+F)"
              className="w-full bg-slate-800 text-sm p-2 pl-9 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>
          {view === 'notes' && (
            <div className="flex-1 overflow-y-auto space-y-1 border-t border-slate-700 pt-4 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
              <button
                onClick={async () => {
                  const n = await window.studyHelperAPI.openFilePicker()
                  if (n) setNotes([...notes, n])
                }}
                className="w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-white mb-4 transition text-xs font-bold uppercase tracking-wider"
              >
                + Import
              </button>
              {notes
                .filter((note) => note.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((note, i) => (
                  <SidebarItem
                    key={i}
                    note={note}
                    isActive={selectedNote?.name === note.name}
                    onClick={() => setSelectedNote(note)}
                    onDelete={handleDeleteNote}
                  />
                ))}
            </div>
          )}
        </aside>
      )}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!isFocusMode && (
          <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold capitalize text-slate-700">{view}</h2>
              {view === 'notes' && selectedNote && (
                <button
                  onClick={handleAiExtract}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:shadow-md transition disabled:opacity-50"
                >
                  <Sparkles size={14} /> {isAiLoading ? 'Thinking...' : 'AI Extract'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowAudioControls(!showAudioControls)}
                  className={`p-2 rounded-full transition ${isPlayingAudio ? 'bg-blue-100 text-blue-600 animate-pulse' : 'text-slate-400 hover:text-blue-500'}`}
                  title="Audio Focus Ambience"
                >
                  <Headphones size={20} />
                </button>
                {showAudioControls && (
                  <div className="absolute top-12 right-0 bg-white border border-slate-200 p-4 rounded-xl shadow-xl w-64 z-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-slate-700">Focus Sound</h4>
                      <button
                        onClick={toggleAudio}
                        className={`text-xs px-2 py-1 rounded font-bold ${isPlayingAudio ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                      >
                        {isPlayingAudio ? 'Stop' : 'Play'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => changeAudioMode('rain')}
                        className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium border ${audioMode === 'rain' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <CloudRain size={16} className="mb-1" /> Rain
                      </button>
                      <button
                        onClick={() => changeAudioMode('ocean')}
                        className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium border ${audioMode === 'ocean' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Waves size={16} className="mb-1" /> Ocean
                      </button>
                      <button
                        onClick={() => changeAudioMode('meditation')}
                        className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium border ${audioMode === 'meditation' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Zap size={16} className="mb-1" /> Drone
                      </button>
                      <button
                        onClick={() => changeAudioMode('lofi')}
                        className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium border ${audioMode === 'lofi' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Music size={16} className="mb-1" /> Lo-Fi
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume1 size={14} className="text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={audioVolume}
                        onChange={(e) => changeVolume(e.target.value)}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${timerActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                <Clock size={14} className={timerActive ? 'animate-pulse' : ''} />
                {isEditingTimer ? (
                  <input
                    type="number"
                    defaultValue={timerDuration}
                    className="w-8 bg-transparent text-center text-sm font-bold outline-none"
                    autoFocus
                    onBlur={() => setIsEditingTimer(false)}
                    onKeyDown={handleTimerEdit}
                  />
                ) : (
                  <span
                    className="text-sm font-mono font-bold cursor-pointer"
                    onClick={() => setIsEditingTimer(true)}
                  >
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                )}
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="hover:text-blue-600 ml-1"
                >
                  {timerActive ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false)
                    setTimeLeft(timerDuration * 60)
                  }}
                  className="hover:text-blue-600"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
              <button
                onClick={() => setIsFocusMode(true)}
                className="p-2 text-slate-400 hover:text-blue-600 transition"
                title="Enter Focus Mode"
              >
                <Maximize size={20} />
              </button>
            </div>
          </header>
        )}
        {isFocusMode && (
          <button
            onClick={() => {
              setIsFocusMode(false)
              setIsStudySession(false)
            }}
            className="absolute top-4 right-4 z-50 bg-slate-800/80 text-white p-2 rounded-full hover:bg-slate-700 backdrop-blur-sm transition shadow-lg"
          >
            {isStudySession ? <X size={20} /> : <Minimize size={20} />}
          </button>
        )}
        <div className="p-8 flex-1 overflow-y-auto bg-[#F8FAFC]">{renderContent()}</div>
      </main>
    </div>
  )
}

export default App
