import { Book } from 'lucide-react'

export const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <Book size={48} className="text-blue-200" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800">Ready to Study?</h2>
    <p className="text-slate-500 max-w-xs mt-2 font-medium">
      Select a file from your library or import a new one to get to work.
    </p>
  </div>
)