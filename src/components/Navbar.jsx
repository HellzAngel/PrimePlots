import { Link, useLocation } from 'react-router-dom';
import { Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="pt-4 px-4 container max-w-7xl mx-auto z-50 relative">
      <nav className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-full px-4 sm:px-6 py-3 flex flex-row justify-between items-center gap-2 transition-colors duration-300">
        <Link to="/" className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0">
          <div className="bg-emerald-600 p-2 rounded-full">
            <Home size={18} className="text-white sm:w-[20px] sm:h-[20px]" />
          </div>
          <span className="tracking-tight hidden sm:block">PrimePlots</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <Link 
            to="/" 
            className={`btn px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base hover:scale-105 font-semibold transition-all
              ${location.pathname === '/' 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
          >
            Home
          </Link>
          <Link 
            to="/admin" 
            className={`btn px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base hover:scale-105 font-semibold transition-all
              ${location.pathname.includes('/admin') || location.pathname.includes('/login')
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
          >
            Admin
          </Link>

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-300 hover:scale-110 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} className="sm:w-[20px] sm:h-[20px]" /> : <Moon size={18} className="sm:w-[20px] sm:h-[20px]" />}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
