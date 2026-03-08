import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // THE UPGRADE: The Front Door Bouncer
  useEffect(() => {
    // 1. If they are already logged in, kick them to the dashboard instantly
    if (localStorage.getItem('token') && localStorage.getItem('userEmail')) {
      navigate('/dashboard');
    }

    // 2. Otherwise, check if we need to remember their email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('token', data.token); 
      
      if (rememberMe) localStorage.setItem('rememberedEmail', data.email);
      else localStorage.removeItem('rememberedEmail');

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-sky-200 via-blue-200 to-sky-300">
      <div className="relative z-10 max-w-md w-full bg-white/85 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 p-8 m-4">
        
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Auralyze Logo" className="h-16 w-auto drop-shadow-sm object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x60/0ea5e9/ffffff?text=Auralyze+Logo" }} />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to access the AI Engine</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-sky-500 transition-colors">
                  {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-slate-300 rounded cursor-pointer" />
            <label htmlFor="rememberMe" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">Remember my email</label>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-bold text-red-600 text-center">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-sky-500/30 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          Don't have an account? <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;