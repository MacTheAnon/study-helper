export const DocumentViewer = ({ note }) => {
  if (!note) return null;

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{note.name}</h2>
        <div className="h-1 w-24 bg-blue-500 rounded-full"></div>
      </div>

      <div className="bg-white shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex-1 relative">
        {note.type === 'pdf' ? (
          <iframe 
            src={`file://${note.path}#toolbar=0`} 
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
        ) : (
          <div 
            className="p-12 prose prose-slate max-w-none h-full overflow-y-auto selection:bg-blue-100" 
            dangerouslySetInnerHTML={{ __html: note.content }} 
          />
        )}
      </div>
    </div>
  )
}