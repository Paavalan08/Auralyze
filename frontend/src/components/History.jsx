import { useState } from 'react';

function History({ history, onToggleFavorite }) {
  // NEW: State for our search and filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // NEW: The filtering logic. This runs instantly whenever you type or change a dropdown.
  const filteredHistory = history.filter(scan => {
    const matchesSearch = 
      scan.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || scan.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getBadgeStyle = (type) => {
    switch(type) {
      case 'Audio': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Lyrics': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Image': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Full History</h1>
          <p className="mt-1 text-slate-500 font-medium">A complete log of every file analyzed by the Auralyze engines.</p>
        </div>
        <div className="text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          Total Scans: <span className="text-sky-600">{history.length}</span>
        </div>
      </div>

      {/* NEW: THE SEARCH & FILTER CONTROL BAR */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search files or predictions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest hidden md:block">Filter Engine:</label>
          <div className="relative w-full md:w-48">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 transition-all font-bold text-slate-700 cursor-pointer"
            >
              <option value="All">All Engines</option>
              <option value="Audio">Audio Intelligence</option>
              <option value="Lyrics">NLP Lyrics</option>
              <option value="Image">Vision Classifier</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

      </div>

      {/* THE DATA TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-16">Star</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Engine</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">File Name</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Prediction</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Confidence</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* Loop through our FILTERED history, not the raw history */}
              {filteredHistory.map((scan, index) => (
                <tr key={scan._id || index} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleFavorite(scan._id)} 
                      className="p-2 rounded-full hover:bg-slate-100 transition-transform hover:scale-110 focus:outline-none"
                      title={scan.isFavorite ? "Remove from Saved Scans" : "Add to Saved Scans"}
                    >
                      <svg 
                        className={`w-6 h-6 transition-colors ${scan.isFavorite ? 'text-amber-400 fill-current' : 'text-slate-300 group-hover:text-amber-200'}`} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={scan.isFavorite ? "0" : "2"} 
                        fill={scan.isFavorite ? "currentColor" : "none"}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-full border ${getBadgeStyle(scan.type)}`}>
                      {scan.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 max-w-[250px] truncate" title={scan.filename}>
                    {scan.filename}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 text-lg">
                    {scan.prediction}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-500 text-right text-lg">
                    {scan.confidence}%
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-400 text-right">
                    {scan.date}
                  </td>
                </tr>
              ))}
              
              {/* Empty State 1: The database is entirely empty */}
              {history.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                       <p className="text-slate-500 font-bold text-lg">No history found.</p>
                       <p className="text-slate-400 font-medium text-sm mt-1">Run an analysis in the AI Engines to populate this table.</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty State 2: Database has items, but search/filter yields 0 results */}
              {history.length > 0 && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                     <div className="flex flex-col items-center justify-center">
                       <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                       <p className="text-slate-500 font-bold text-lg">No matching scans found.</p>
                       <p className="text-slate-400 font-medium text-sm mt-1">Try adjusting your search or engine filter.</p>
                       <button 
                         onClick={() => { setSearchTerm(''); setFilterType('All'); }}
                         className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                       >
                         Clear Filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default History;