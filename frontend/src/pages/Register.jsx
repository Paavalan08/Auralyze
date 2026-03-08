import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [strength, setStrength] = useState(0); 
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // THE UPGRADE: The Front Door Bouncer
  useEffect(() => {
    // If they are already logged in, kick them to the dashboard instantly
    if (localStorage.getItem('token') && localStorage.getItem('userEmail')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 7) score += 1; 
    if (/[A-Z]/.test(pass)) score += 1; 
    if (/[0-9]/.test(pass)) score += 1; 
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; 
    return score;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      setStrength(checkPasswordStrength(e.target.value));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!acceptedTerms) {
      setError("You must agree to the Terms of Service.");
      setLoading(false);
      return;
    }

    if (strength < 3) {
      setError("Your password is too weak. Please use a stronger password.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = {
    0: 'w-0 bg-slate-200',
    1: 'w-1/4 bg-red-500',
    2: 'w-2/4 bg-yellow-500',
    3: 'w-3/4 bg-sky-500',
    4: 'w-full bg-emerald-500'
  };

  const strengthLabels = {
    0: 'Enter a password',
    1: 'Weak: Add numbers & symbols',
    2: 'Fair: Add uppercase & symbols',
    3: 'Good: Add more characters',
    4: 'Strong: Ready to go!'
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-sky-200 via-blue-200 to-sky-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-md w-full bg-white/85 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 p-8 m-4">
        
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Auralyze Logo" className="h-14 w-auto drop-shadow-sm object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x60/0ea5e9/ffffff?text=Auralyze+Logo" }} />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">Join the Auralyze platform today</p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center shadow-inner">
            <h3 className="text-lg font-bold text-green-800 mb-2">Registration Successful!</h3>
            <p className="text-sm text-green-600">Redirecting you to login...</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                <input type="text" name="firstName" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                <input type="text" name="lastName" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
              <input type="tel" name="mobile" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="+94 77 123 4567" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-sky-500 transition-colors">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              
              <div className="mt-2 h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden flex">
                <div className={`h-full transition-all duration-300 ease-out ${strengthColors[strength]}`}></div>
              </div>
              <p className={`text-xs mt-1 font-bold ${strength === 4 ? 'text-emerald-600' : 'text-slate-500'}`}>
                {strengthLabels[strength]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} name="confirmPassword" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-sky-400 transition-all bg-white/90" placeholder="••••••••" />
            </div>

            <div className="flex items-start mt-4">
              <input type="checkbox" id="terms" required checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 text-sky-500 focus:ring-sky-500 border-slate-300 rounded cursor-pointer" />
              <label htmlFor="terms" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
                I agree to the <span className="font-bold text-sky-600 hover:underline">Terms of Service</span> and <span className="font-bold text-sky-600 hover:underline">Privacy Policy</span>.
              </label>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-bold text-red-600 text-center">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-sky-500/30 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          Already have an account? <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;