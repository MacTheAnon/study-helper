import { FileText, ChevronRight, Trash2 } from 'lucide-react'

export const SidebarItem = ({ note, isActive, onClick, onDelete }) => (
  <div 
    onClick={onClick}
    className={`group p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
      isActive 
      ? 'bg-blue-600 shadow-lg scale-[1.02] text-white' 
      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
    }`}
  >
    <FileText size={18} className={isActive ? 'text-white' : 'text-blue-400'} />
    <span className="text-sm truncate flex-1 font-medium">{note.name}</span>
    
    {/* Delete Button - only visible on hover */}
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Prevents selecting the note when clicking delete
        onDelete(note);
      }}
      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all"
    >
      <Trash2 size={14} />
    </button>
  </div>
)