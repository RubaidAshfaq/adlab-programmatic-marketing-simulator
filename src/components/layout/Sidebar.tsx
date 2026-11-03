import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Zap,
  PlayCircle,
  BarChart3,
  Award,
  Sparkles,
  FileText,
  Trophy,
  GraduationCap,
  BookOpen,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
  studentMode: boolean;
  onToggleStudentMode: () => void;
  onLoadDemoCampaign: () => void;
  onNewExperiment: () => void;
  campaignName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  studentMode,
  onToggleStudentMode,
  onLoadDemoCampaign,
  onNewExperiment,
  campaignName,
}) => {
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'create', label: '2. Create Campaign', icon: PlusCircle },
    { id: 'rtb', label: '3. RTB Simulator', icon: Zap },
    { id: 'simulation', label: '4. Campaign Simulation', icon: PlayCircle },
    { id: 'analytics', label: '5. Performance Analytics', icon: BarChart3 },
    { id: 'effectiveness', label: '6. Campaign Effectiveness', icon: Award },
    { id: 'optimize', label: '7. Optimization Lab', icon: Sparkles },
    { id: 'report', label: '8. Campaign Report', icon: FileText },
    { id: 'challenges', label: '9. Programmatic Challenges', icon: Trophy },
    { id: 'instructor', label: '10. Instructor Mode', icon: GraduationCap },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-950/60 font-mono">
              AD
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white leading-none">
                ADLAB
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wide mt-1">
                Programmatic DSP Simulator
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded text-center">
            EDUCATIONAL SIMULATION
          </div>
        </div>

        {/* Campaign Label */}
        <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
            Active Campaign
          </span>
          <div className="text-xs font-semibold text-slate-200 truncate" title={campaignName}>
            {campaignName}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls & Mode Switchers */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/80">
        {/* Student Mode Switch */}
        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Student Notes</span>
          </div>
          <button
            onClick={onToggleStudentMode}
            className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
              studentMode ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            title="Toggle educational formulas & learning annotations"
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                studentMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Quick Campaign Action Buttons */}
        <div className="space-y-1.5">
          <button
            onClick={onLoadDemoCampaign}
            className="w-full py-2 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Load Demo Campaign</span>
          </button>

          <button
            onClick={onNewExperiment}
            className="w-full py-2 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>New Experiment</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          ADLAB v2.4 · Browser DSP Lab
        </div>
      </div>
    </aside>
  );
};
