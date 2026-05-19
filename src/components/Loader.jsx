import { Home } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-700"></div>
        <Home size={40} className="text-emerald-500 animate-pulse" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide animate-pulse">PrimePlots</h2>
      <p className="text-slate-400 dark:text-slate-500 mt-2 text-sm">Finding the best properties for you...</p>
    </div>
  );
};

export default Loader;
