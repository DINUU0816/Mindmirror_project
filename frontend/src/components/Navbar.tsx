import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LayoutDashboard, BookText, PieChart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-400">
          <BrainCircuit className="w-8 h-8" />
          <span>Mind Mirror<span className="text-white">+</span></span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/journal" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
              <BookText className="w-4 h-4" />
              <span>Journal</span>
            </Link>
            <Link to="/analytics" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
              <PieChart className="w-4 h-4" />
              <span>Analytics</span>
            </Link>
            <div className="h-4 w-px bg-white/10 ml-2" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{user.username}</span>
                <span className="text-[10px] text-white/50">Pro User</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 hover:text-primary-400 transition-colors">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-all shadow-lg shadow-primary-600/20">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
