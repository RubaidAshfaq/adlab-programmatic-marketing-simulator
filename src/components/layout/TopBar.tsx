import React from 'react';
import { Play, Sparkles, BookOpen, Layers } from 'lucide-react';

interface TopBarProps {
  currentSectionTitle: string;
  onQuickSimulate: () => void;
  simulationStatus: string;
  studentMode: boolean;
  onToggleStudentMode: () => void;
  brandName: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentSectionTitle,
  onQuickSimulate,
  simulationStatus,
  studentMode,
  onToggleStudentMode,
  brandName,
}) => {
  return (
    <header className="h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between gap-8 sticky top-0 z-30 select-none">
      {/* Zone 1: Context Breadcrumb / Brand */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <span className="text-sm font-bold text-white tracking-tight">
          ADLAB
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-slate-300 font-medium">
          {brandName || 'Demo'}
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-cyan-400 font-semibold truncate max-w-[200px]">
          {currentSectionTitle}
        </span>
      </div>

      {/* Zone 2: Prominent Educational Data Transparency Badge */}
      <div className="hidden sm:flex items-center gap-2 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 font-bold">SIMULATION MODE</span>
          <span className="text-slate-500">—</span>
          <span className="text-slate-400">EDUCATIONAL DATA</span>
        </div>
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onQuickSimulate}
          className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-950/50 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Simulation</span>
        </button>
      </div>
    </header>
  );
};
