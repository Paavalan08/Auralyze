import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// CHANGED: We created a Layout wrapper to control when the Navbar appears
function Layout() {
  const location = useLocation();
  
  // Check if the user is currently inside the Auralyze OS Dashboard
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* CHANGED: If they are on the Dashboard, completely hide the global Navbar! */}
      {!isDashboard && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;