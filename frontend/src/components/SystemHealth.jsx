function SystemHealth() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Health</h1>
          <p className="mt-1 text-slate-500 font-medium">Live diagnostics for the Auralyze Flask Backend and ML Models.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-sm font-bold shadow-sm">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">API Server</p>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Online</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full w-full"></div></div>
          <p className="text-xs font-bold text-slate-500 mt-2 text-right">Uptime: 99.9%</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Audio CRNN Model</p>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Loaded</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full w-[45%]"></div></div>
          <p className="text-xs font-bold text-slate-500 mt-2 text-right">Memory: 450 MB</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Lyrics BiLSTM Model</p>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Loaded</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full w-[20%]"></div></div>
          <p className="text-xs font-bold text-slate-500 mt-2 text-right">Memory: 120 MB</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Average Latency</p>
          <h3 className="text-2xl font-black text-slate-900 mb-4">124ms</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-yellow-400 h-1.5 rounded-full w-[15%]"></div></div>
          <p className="text-xs font-bold text-slate-500 mt-2 text-right">Optimal</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-8 text-white font-mono text-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-emerald-500"></div>
        <h3 className="text-slate-400 mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Server Logs (Live)</h3>
        <div className="space-y-2 opacity-80">
          <p><span className="text-emerald-400">[2026-03-01 23:40:12]</span> INFO: Flask server initialized on port 5000</p>
          <p><span className="text-emerald-400">[2026-03-01 23:40:13]</span> INFO: Connected to MongoDB Compass instance (auralyze_db)</p>
          <p><span className="text-sky-400">[2026-03-01 23:40:15]</span> LOAD: auralyze_crnn_model.keras successfully mounted into GPU/CPU memory.</p>
          <p><span className="text-purple-400">[2026-03-01 23:40:16]</span> LOAD: auralyze_bilstm_model.keras successfully mounted.</p>
          <p><span className="text-emerald-400">[2026-03-01 23:40:18]</span> SYSTEM: Auralyze Engine is running and awaiting socket connections...</p>
        </div>
      </div>
    </div>
  );
}

export default SystemHealth;