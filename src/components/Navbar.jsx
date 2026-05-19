import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="pt-4 px-4 container max-w-7xl mx-auto z-50 relative">
      <nav className="glass rounded-full px-6 py-3 flex justify-between items-center shadow-lg">
        <Link to="/" className="text-2xl font-black text-slate-800 flex items-center gap-2 hover:text-emerald-600 transition-colors">
          <div className="bg-emerald-600 p-2 rounded-full">
            <Home size={20} className="text-white" />
          </div>
          <span className="tracking-tight">PrimePlots</span>
        </Link>
        <div className="flex gap-2 sm:gap-4">
          <Link 
            to="/" 
            className={`btn ${location.pathname === '/' ? 'bg-white/80 shadow-sm' : 'btn-glass'} px-4 py-2 text-sm sm:text-base hover:scale-105`}
          >
            Home
          </Link>
          <Link 
            to="/admin" 
            className={`btn ${location.pathname.includes('/admin') ? 'bg-white/80 shadow-sm' : 'btn-glass'} px-4 py-2 text-sm sm:text-base hover:scale-105`}
          >
            Admin Panel
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
