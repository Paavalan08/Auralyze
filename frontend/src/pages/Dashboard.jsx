import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Overview from '../components/Overview';
import AIEngine from '../components/AIEngine';
import History from '../components/History';
import Analytics from '../components/Analytics';
import Profile from '../components/Profile';
import Favorites from '../components/Favorites';
import SystemHealth from '../components/SystemHealth';
import Documentation from '../components/Documentation';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [userAvatar, setUserAvatar] = useState(null);
  
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const token = localStorage.getItem('token');
  const userName = userEmail ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'Explorer';

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/history`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (err) { console.error("Failed to fetch history", err); }
  }, [token]);

  // CHANGED: Added function to toggle the star status in the database
  const toggleFavorite = async (scanId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/history/${scanId}/favorite`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchHistory(); // Instantly refresh the global state so UI updates everywhere
      }
    } catch (err) { console.error("Failed to toggle favorite", err); }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.avatar) setUserAvatar(data.avatar);
    } catch (err) { console.error("Failed to fetch profile", err); }
  }, [token]);

  useEffect(() => {
    if (!userEmail || !token) navigate('/login');
    else {
      fetchHistory();
      fetchUserProfile();
    }
  }, [userEmail, token, navigate, fetchHistory, fetchUserProfile]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <Overview history={history} userName={userName} />;
      // CHANGED: Pass toggleFavorite so both components can star/unstar items!
      case 'favorites': return <Favorites history={history} onToggleFavorite={toggleFavorite} />;
      case 'history': return <History history={history} onToggleFavorite={toggleFavorite} />;
      case 'analytics': return <Analytics history={history} />;
      case 'profile': return <Profile userEmail={userEmail} onProfileUpdate={fetchUserProfile} />;
      case 'health': return <SystemHealth />;
      case 'docs': return <Documentation />;
      case 'audio':
      case 'lyrics':
      case 'image': return <AIEngine key={activeTab} engineType={activeTab} token={token} onScanComplete={fetchHistory} />;
      default: return null;
    }
  };

  const currentTheme = (() => {
    switch(activeTab) {
      case 'lyrics': return { bgBase: 'bg-[#faf5ff]', bgGlow: 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.18),rgba(255,255,255,0))]', pill: 'from-purple-100 to-fuchsia-50/50', textActive: 'text-purple-700', textHover: 'group-hover:text-purple-500' };
      case 'image': return { bgBase: 'bg-[#f0fdf4]', bgGlow: 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))]', pill: 'from-emerald-100 to-teal-50/50', textActive: 'text-emerald-700', textHover: 'group-hover:text-emerald-500' };
      case 'favorites': return { bgBase: 'bg-[#fffbeb]', bgGlow: 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]', pill: 'from-amber-100 to-yellow-50/50', textActive: 'text-amber-700', textHover: 'group-hover:text-amber-500' };
      default: return { bgBase: 'bg-[#f8fafc]', bgGlow: 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]', pill: 'from-sky-100 to-blue-50/50', textActive: 'text-sky-700', textHover: 'group-hover:text-sky-500' };
    }
  })();

  const NavButton = ({ id, icon, label, forceTheme }) => {
    const isActive = activeTab === id;
    const hoverColor = forceTheme || currentTheme.textHover; 
    return (
      <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ease-out group relative overflow-hidden ${isActive ? currentTheme.textActive : `text-slate-500 hover:text-slate-800`}`}>
        {isActive && <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.pill} rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200`}></div>}
        {!isActive && <div className="absolute inset-0 bg-slate-100/50 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : `group-hover:scale-110 ${hoverColor}`}`}>{icon}</div>
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-700 ease-in-out ${currentTheme.bgBase} ${currentTheme.bgGlow} overflow-hidden relative font-sans`}>
      <header className="w-full bg-white/70 backdrop-blur-2xl border-b border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-40 transition-colors duration-500">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Auralyze" className="h-8 w-auto object-contain transition-transform hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150x40/0ea5e9/ffffff?text=Auralyze" }} />
              <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
              <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500">
                <span>Workspace</span>
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className={`capitalize ${currentTheme.textActive}`}>{activeTab.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-bold text-slate-600">{userEmail}</span>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentTheme.pill} border-2 border-white flex items-center justify-center ${currentTheme.textActive} text-sm font-black shadow-md cursor-pointer hover:scale-105 transition-transform overflow-hidden`}>
              {userAvatar ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : userName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>}
        <aside className={`absolute md:relative inset-y-0 left-0 z-40 w-72 transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:translate-x-0 flex flex-col p-4 md:p-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-colors duration-500">
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="pb-2 px-4"><span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Workspace</span></div>
              <NavButton id="overview" label="Overview" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
              <NavButton id="favorites" label="Saved Scans" forceTheme="group-hover:text-amber-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>} />
              <NavButton id="analytics" label="Deep Analytics" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} />
              <NavButton id="history" label="Full History" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>} />

              <div className="pt-6 pb-2 px-4"><span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">AI Engines</span></div>
              <NavButton id="audio" label="Audio Model" forceTheme="group-hover:text-sky-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>} />
              <NavButton id="lyrics" label="Lyrics Model" forceTheme="group-hover:text-purple-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>} />
              <NavButton id="image" label="Vision Model" forceTheme="group-hover:text-emerald-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} />

              <div className="pt-6 pb-2 px-4"><span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">System</span></div>
              <NavButton id="health" label="System Health" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>} />
              <NavButton id="docs" label="Documentation" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} />
              <NavButton id="profile" label="Profile Settings" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} />
              <div className="h-6"></div>
            </nav>
            <div className="p-4 bg-white/50 border-t border-slate-100/50 backdrop-blur-md">
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl font-bold text-red-600 bg-red-50/80 hover:bg-red-100 transition-all duration-300 group">
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span>Secure Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <footer className="w-full bg-white/60 backdrop-blur-md border-t border-white/50 py-3 px-6 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-bold text-slate-400">
          <p>© 2026 Auralyze AI. Master's Thesis Project.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;