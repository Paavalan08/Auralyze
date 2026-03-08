function Favorites({ history, onToggleFavorite }) {
  
  // CHANGED: We now filter exclusively by the isFavorite flag from MongoDB!
  const favoriteScans = history.filter(scan => scan.isFavorite === true);

  const getTheme = (type) => {
    switch(type) {
      case 'Audio': return { bg: 'bg-sky-50/50', border: 'border-sky-200', text: 'text-sky-700', badgeBg: 'bg-sky-100', star: 'text-sky-400', hoverStar: 'hover:text-slate-300' };
      case 'Lyrics': return { bg: 'bg-purple-50/50', border: 'border-purple-200', text: 'text-purple-700', badgeBg: 'bg-purple-100', star: 'text-purple-400', hoverStar: 'hover:text-slate-300' };
      case 'Image': return { bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-700', badgeBg: 'bg-emerald-100', star: 'text-emerald-400', hoverStar: 'hover:text-slate-300' };
      default: return { bg: 'bg-slate-50/50', border: 'border-slate-200', text: 'text-slate-700', badgeBg: 'bg-slate-100', star: 'text-slate-400', hoverStar: 'hover:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved & Top Scans</h1>
          <p className="mt-1 text-slate-500 font-medium">Your manually curated list of important Auralyze scans.</p>
        </div>
      </div>

      {favoriteScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 p-8 text-center">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">No Saved Scans Yet</h2>
          <p className="text-slate-500 font-medium">Go to your Full History tab and click the Star icon to save a scan here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteScans.map((scan, i) => {
            const theme = getTheme(scan.type);
            return (
              <div key={i} className={`rounded-3xl shadow-sm border ${theme.border} ${theme.bg} p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 ${theme.badgeBg} ${theme.text} rounded-full text-xs font-bold`}>{scan.type} Engine</span>
                  {/* CHANGED: You can click the star here to remove it from favorites! */}
                  <button 
                    onClick={() => onToggleFavorite(scan._id)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    title="Remove from Saved Scans"
                  >
                    <svg className={`w-7 h-7 text-amber-400 fill-current transition-colors hover:text-slate-300 hover:fill-none`} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  </button>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1 truncate" title={scan.filename}>{scan.filename}</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">{scan.date}</p>
                <div className="flex items-end justify-between border-t border-slate-200/60 pt-4 mt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Result</p>
                    <p className={`text-xl font-black ${theme.text}`}>{scan.prediction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Match</p>
                    <p className="text-2xl font-black text-slate-800">{scan.confidence}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favorites;