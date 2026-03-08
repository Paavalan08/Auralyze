import { useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Analytics({ history }) {
  
  // 1. DATA PREPARATION: Transform history into chart data
  const { genreData, engineData, confidenceData } = useMemo(() => {
    if (!history || history.length === 0) return { genreData: [], engineData: [], confidenceData: [] };

    // Group by Prediction (Genre/Mood)
    const genres = {};
    const engines = {};
    const confs = [];

    // Reverse history so chronological order is left-to-right on the Line Chart
    const chronologicalHistory = [...history].reverse();

    chronologicalHistory.forEach((item, index) => {
      // Tally Genres
      genres[item.prediction] = (genres[item.prediction] || 0) + 1;
      // Tally Engines
      engines[item.type] = (engines[item.type] || 0) + 1;
      // Track Confidence over time
      confs.push({ name: `Scan ${index + 1}`, confidence: item.confidence, engine: item.type });
    });

    return {
      genreData: Object.keys(genres).map(key => ({ name: key, value: genres[key] })).sort((a, b) => b.value - a.value),
      engineData: Object.keys(engines).map(key => ({ name: key, value: engines[key] })),
      confidenceData: confs
    };
  }, [history]);

  // Color Palettes
  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];
  const ENGINE_COLORS = { 'Audio': '#0ea5e9', 'Lyrics': '#8b5cf6', 'Image': '#10b981' };

  // Empty State UI
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-slate-100 p-8 text-center animate-in fade-in duration-300">
        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">No Analytics Available</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Run a few AI scans using the Audio, Lyrics, or Vision engines to generate your data visualizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deep Analytics</h1>
          <p className="mt-1 text-slate-500 font-medium">Visualizing your AI model's performance and usage distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Prediction Distribution (Pie Chart) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6 w-full text-left">Detection Frequency</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {genreData.slice(0, 4).map((entry, index) => (
              <div key={index} className="flex items-center text-sm font-bold text-slate-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Engine Usage (Bar Chart) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6 w-full text-left">Engine Utilization</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#64748b' }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {engineData.map((entry, index) => <Cell key={`cell-${index}`} fill={ENGINE_COLORS[entry.name] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Confidence Trend (Line Chart) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-2 text-left">Confidence Trend</h3>
          <p className="text-sm font-medium text-slate-500 mb-6 text-left">AI accuracy across your historical timeline.</p>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Confidence']}
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 8, fill: '#0ea5e9', strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;