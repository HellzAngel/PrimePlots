import { Home } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 transition-colors duration-300 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Floating Logo Icon */}
        <div className="relative animate-float">
          <div className="animate-pulse-glow w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
            <Home size={44} className="text-white drop-shadow" />
          </div>
          {/* Orbiting dot */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-400 shadow-lg border-2 border-white dark:border-slate-900 animate-ping" />
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-400 bg-[length:200%_auto] animate-text-shimmer tracking-tight mb-2">
            PrimePlots
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium tracking-widest uppercase">
            Finding your dream property...
          </p>
        </div>

        {/* Animated bars */}
        <div className="flex items-end gap-1.5 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-bar-grow"
              style={{ animationDelay: `${i * 0.15}s`, height: '100%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
