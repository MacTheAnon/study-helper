import { Search } from 'lucide-react'

export const SearchBar = ({ value, onChange }) => (
  <div className="relative w-full max-w-xl">
    <Search className="absolute left-4 top-3 text-slate-400" size={20} />
    <input 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-100 pl-12 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent focus:bg-white transition-all shadow-inner"
      placeholder="Search through notes... (Ctrl + F)" 
    />
  </div>
)