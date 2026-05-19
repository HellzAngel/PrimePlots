import { Home } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <div className="absolute inset-0 rounded-full border-t-4 border-emerald-600 animate-spin"></div>
        <Home size={40} className="text-emerald-600 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-wide animate-pulse">PrimePlots</h2>
    </div>
  );
};

export default Loader;
