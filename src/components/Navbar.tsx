import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="p-2 bg-indigo-50/50 rounded-xl group-hover:bg-indigo-100 group-hover:scale-105 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-indigo-500" />
              </div>
              <span className="font-serif font-bold text-2xl text-slate-800 tracking-tight">QuizX</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-800 leading-none">
                {user?.display_name}
              </span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1 bg-indigo-50 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200/50 hidden sm:block mx-1"></div>

            <Link
              to="/profile"
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group"
              title="Profile"
            >
              <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all group"
              title="Logout"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
