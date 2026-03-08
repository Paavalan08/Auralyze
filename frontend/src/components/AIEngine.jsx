import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

function AIEngine({ engineType, token, onScanComplete }) {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Awaiting Input...');
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socket.on('ai_status', (data) => setStatusMessage(data.message));
    return () => socket.off('ai_status'); 
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setAudioUrl('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (engineType === 'audio' && !file && !audioUrl) { setError("Please drop a file OR paste a URL."); return; }
    if (engineType !== 'audio' && !file) { setError("Please drop a file first!"); return; }
    
    setLoading(true); setError(null); setResult(null); setStatusMessage("Connecting to AI Engine...");
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (audioUrl && engineType === 'audio') formData.append('url', audioUrl);

    let endpoint = `/predict_${engineType}`;

    try {
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI engine error");
      setResult(data);
      setAudioUrl('');
      onScanComplete(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatusMessage("Analysis Complete");
    }
  };

  const titles = { audio: 'Audio Intelligence', lyrics: 'NLP Lyrics Engine', image: 'Vision Classifier' };
  const descriptions = { 
    audio: 'Upload WAV or MP3 files (Max 10MB) to analyze acoustic patterns.', 
    lyrics: 'Upload raw TXT files to map psychological language patterns.', 
    image: 'Upload JPG or PNG files (Max 5MB) for zero-shot music classification.' 
  };

  // --- DYNAMIC ENGINE THEMING ---
  const engineTheme = {
    audio: {
      lightBg: 'bg-sky-50',
      borderActive: 'border-sky-500',
      text: 'text-sky-600',
      btnBg: 'bg-sky-600',
      btnHover: 'hover:bg-sky-700',
      shadow: 'shadow-sky-500/20'
    },
    lyrics: {
      lightBg: 'bg-purple-50',
      borderActive: 'border-purple-500',
      text: 'text-purple-600',
      btnBg: 'bg-purple-600',
      btnHover: 'hover:bg-purple-700',
      shadow: 'shadow-purple-500/20'
    },
    image: {
      lightBg: 'bg-emerald-50',
      borderActive: 'border-emerald-500',
      text: 'text-emerald-600',
      btnBg: 'bg-emerald-600',
      btnHover: 'hover:bg-emerald-700',
      shadow: 'shadow-emerald-500/20'
    }
  }[engineType];

  // THE VISUAL MASTERPIECE: Enhanced to convert everything to points and make links clickable
  const renderFormattedText = (text) => {
    return text.split('\n').map((paragraph, idx) => {
      // Clean up markdown bolding (**) for standard display
      let cleanText = paragraph.replace(/\*\*(.*?)\*\*/g, '$1');
      
      if (!cleanText.trim()) return <div key={idx} className="h-2"></div>;
      
      // Step 1: Detect and handle plain bullet points
      const isListItem = cleanText.trim().startsWith('*') || cleanText.trim().startsWith('-');
      const listContent = isListItem ? cleanText.replace(/^[*-\s]+/, '') : cleanText;
      
      // Step 2: DETECT AND RENDER CLICKABLE LINKS
      // Scans for anything starting with http
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const parts = listContent.split(linkRegex);
      
      const contentWithLinks = parts.map((part, i) => {
        if (part.match(linkRegex)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`font-bold underline ${engineTheme.text} hover:opacity-80 transition-opacity`}
            >
              {` `}
            </a>
          );
        }
        return part;
      });

      // Render as a point if prefaced by * or if the prompt failed and gave standard text
      // Force everything into point form
      return (
        <li key={idx} className="ml-6 mb-3 text-slate-700 flex items-start gap-2 text-lg">
          <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${engineTheme.btnBg}`}></span>
          <span className="leading-relaxed">{contentWithLinks}</span>
        </li>
      );
    });
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* TOP ROW: Split layout for Input (Left) and Quick Score (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* THE UPLOAD COMMAND CENTER */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 transition-colors duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-3 rounded-2xl ${engineTheme.lightBg} ${engineTheme.text}`}>
              {engineType === 'audio' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>}
              {engineType === 'lyrics' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
              {engineType === 'image' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{titles[engineType]}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{descriptions[engineType]}</p>
            </div>
          </div>
          
          <div 
            className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300 ease-out cursor-pointer flex flex-col items-center justify-center min-h-[250px] ${isDragging ? `${engineTheme.borderActive} ${engineTheme.lightBg} scale-[1.02]` : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept={engineType === 'audio' ? 'audio/*' : engineType === 'lyrics' ? '.txt' : 'image/*'} onChange={(e) => { setFile(e.target.files[0]); setAudioUrl(''); setResult(null); setError(null); }} />
            {!file ? (
              <>
                <div className={`p-4 bg-white rounded-full shadow-sm mb-4 transition-colors duration-500 ${engineTheme.text}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <p className="text-lg font-bold text-slate-700 mb-1">Click or drag {engineType} file here</p>
              </>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className={`p-4 bg-white rounded-full shadow-sm mb-3 ${engineTheme.text}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-xl font-bold text-slate-900">{file.name}</p>
                <p className={`text-sm font-bold mt-1 ${engineTheme.text}`}>Ready for analysis</p>
              </div>
            )}
          </div>

          {engineType === 'audio' && (
            <div className="mt-8 animate-in fade-in duration-500">
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-extrabold uppercase tracking-widest">OR PASTE URL</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <input type="url" placeholder="YouTube, TikTok, or Spotify Link..." value={audioUrl} onChange={(e) => { setAudioUrl(e.target.value); setFile(null); setResult(null); setError(null); }} className={`w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 transition-all font-medium text-slate-700 bg-white/50 focus:bg-white`} />
            </div>
          )}
          
          <button 
            onClick={handleUpload} 
            disabled={(!file && !audioUrl) || loading} 
            className={`mt-8 w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'bg-slate-400 shadow-none' : `${engineTheme.btnBg} ${engineTheme.btnHover} ${engineTheme.shadow} hover:-translate-y-1`}`}
          >
            {loading ? 'Processing Data...' : 'Run Analysis Engine'}
            {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
          </button>
          {error && <p className="mt-4 text-sm font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-center animate-in fade-in">{error}</p>}
        </div>

        {/* THE QUICK SCORE PANEL */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 flex flex-col transition-colors duration-500">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Primary Match</h2>
          <div className="flex-grow flex flex-col justify-center items-center rounded-3xl border-2 border-slate-100/50 bg-slate-50/50 p-6 text-center">
            
            {loading && (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-end justify-center h-16 gap-1.5 mb-6">
                  <div className={`w-2 rounded-full animate-[pulse_1s_ease-in-out_infinite] h-8 ${engineTheme.btnBg}`}></div>
                  <div className={`w-2 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-16 ${engineTheme.btnBg} opacity-80`}></div>
                  <div className={`w-2 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-10 ${engineTheme.btnBg} opacity-60`}></div>
                  <div className={`w-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] h-12 ${engineTheme.btnBg} opacity-90`}></div>
                  <div className={`w-2 rounded-full animate-[pulse_1.1s_ease-in-out_infinite] h-6 ${engineTheme.btnBg} opacity-70`}></div>
                </div>
                <p className={`text-sm font-bold animate-pulse ${engineTheme.text}`}>{statusMessage}</p>
              </div>
            )}

            {!loading && !result && (
              <div className="text-slate-400 flex flex-col items-center py-10">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <p className="font-bold text-slate-500">Awaiting input.</p>
              </div>
            )}

            {!loading && result && (
              <div className="w-full flex flex-col items-center py-8">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${engineTheme.lightBg} ${engineTheme.text}`}>Successful</span>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{result.mood_genre}</h3>
                <div className="w-full h-2.5 bg-slate-200 rounded-full mt-6 mb-2 overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ease-out ${engineTheme.btnBg}`} style={{ width: `${result.confidence}%` }}></div>
                </div>
                <p className="text-lg font-bold text-slate-500">{result.confidence}% Confidence</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: The Expert Report Document */}
      {!loading && result && result.analysis && (
        <div className="w-full bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-white/80 p-8 lg:p-12 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
            <div className={`p-3 rounded-full ${engineTheme.lightBg} ${engineTheme.text}`}>
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Auralyze Expert Report</h3>
              <p className="text-slate-500 font-medium">Inch-by-Inch Analysis & Discoverability Pipeline</p>
            </div>
          </div>
          
          <div className="max-w-none">
            <ul className="list-none space-y-2">
              {renderFormattedText(result.analysis)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIEngine;