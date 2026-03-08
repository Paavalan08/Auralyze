import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  // Check if the user is logged in by looking for the JWT token
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Auralyze" 
              className="h-8 w-auto object-contain transition-transform hover:scale-105" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150x40/0ea5e9/ffffff?text=Auralyze" }} 
            />
          </Link>
          
          {/* CHANGED: Clean, dynamic navigation links */}
          <div className="flex items-center gap-4">
            {!token ? (
              // What visitors see
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm">
                  Sign Up
                </Link>
              </>
            ) : (
              // What logged-in users see if they navigate back to the home page
              <>
                <Link to="/dashboard" className="text-sm font-bold text-sky-600 bg-sky-50 px-5 py-2.5 rounded-xl border border-sky-100 hover:bg-sky-100 transition-all">
                  Open Auralyze OS
                </Link>
                <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;