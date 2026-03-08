import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

function Overview({ history, userName }) {
  
  // --- MATHEMATICAL DATA PROCESSING ---
  // We use useMemo so React only calculates these stats when the history actually changes.
  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return { total: 0, avgConfidence: 0, topResult: 'None', recentData: [] };
    }

    const total = history.length;
    
    // Calculate Average Confidence
    const totalConf = history.reduce((sum, scan) => sum + parseFloat(scan.confidence || 0), 0);
    const avgConfidence = (totalConf / total).toFixed(1);

    // Find the most frequent prediction (Mode)
    const frequency = {};
    let maxFreq = 0;
    let topResult = 'None';
    history.forEach(scan => {
      const pred = scan.prediction;
      frequency[pred] = (frequency[pred] || 0) + 1;
      if (frequency[pred] > maxFreq) {
        maxFreq = frequency[pred];
        topResult = pred;
      }
    });

    // Prepare data for the Area Chart (take the 10 most recent scans, reverse so left-to-right is chronological)
    const recentData = history.slice(0, 10).reverse().map((scan, index) => ({
      name: `Scan ${index + 1}`,
      confidence: parseFloat(scan.confidence),
      engine: scan.type,
      result: scan.prediction
    }));

    return { total, avgConfidence, topResult, recentData };
  }, [history]);

  // Custom Tooltip for the Recharts graph
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl">
          <p className="text-white font-black mb-1">{data.result}</p>
          <p className="text-sky-400 text-sm font-bold">{data.engine} Engine</p>
          <p className="text-slate-300 text-xs mt-2">Confidence: <span className="text-white font-bold">{data.confidence}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 ease-out">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {userName}.</h1>
          <p className="mt-1 text-slate-500 font-medium">Here is the current status of your Auralyze workspace.</p>
        </div>
        {stats.total > 0 && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-sm font-bold shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            System Active
          </div>
        )}
      </div>

      {stats.total === 0 ? (
        // EMPTY STATE (If they just created an account)
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
           <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 mb-6">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Ready for Intelligence</h2>
           <p className="text-slate-500 font-medium max-w-md">Your workspace is empty. Navigate to the AI Engines on the left to run your first audio, lyric, or image analysis.</p>
        </div>
      ) : (
        <>
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total AI Scans</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Confidence</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.avgConfidence}%</h3>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Prediction</p>
                <h3 className="text-3xl font-black text-slate-900 truncate" title={stats.topResult}>{stats.topResult}</h3>
              </div>
            </div>
          </div>

          {/* MAIN CHART */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Recent Model Performance</h3>
                <p className="text-sm font-medium text-slate-500">Confidence scores over your last 10 scans.</p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.recentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="confidence" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorConfidence)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Overview;