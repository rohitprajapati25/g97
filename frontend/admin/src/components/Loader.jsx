import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="absolute h-full w-full inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f18]/80 backdrop-blur-md">
      {/* Container for Animation */}
      <div className="relative flex items-center justify-center">
        
        {/* Outer Pulsing Ring */}
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-red-600/20"></div>
        
        {/* Rotating Gradient Border */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-800 border-t-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
        
        {/* Center Icon */}
        <div className="absolute text-white">
          <Loader2 className="h-8 w-8 animate-spin-slow" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
          AutoHub <span className="text-red-600">Detailing</span>
        </h2>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 animate-pulse">
          Syncing Application Data...
        </p>
      </div>
    </div>
  );
};

export default Loader;