import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CampaignConfig, SimulationResult } from '../../types/campaign';
import { runFullCampaignSimulation } from '../../utils/simulationEngine';
import { EducationalNote } from '../common/EducationalNote';

interface OptimizationLabViewProps {
  baseCampaign: CampaignConfig;
  initialResult: SimulationResult;
  studentMode: boolean;
  onApplyOptimization: (optimizedConfig: CampaignConfig, optimizedResult: SimulationResult) => void;
}

export const OptimizationLabView: React.FC<OptimizationLabViewProps> = ({
  baseCampaign,
  initialResult,
  studentMode,
  onApplyOptimization,
}) => {
  // Optimization draft state
  const [optimizedConfig, setOptimizedConfig] = useState<CampaignConfig>({
    ...baseCampaign,
    id: `${baseCampaign.id}-optimized`,
    isOptimizedVersion: true,
    baseCampaignId: baseCampaign.id,
  });

  const [optimizedResult, setOptimizedResult] = useState<SimulationResult | null>(null);

  const handleSimulateOptimization = () => {
    // Run simulation with higher seed to show realistic deterministic variance with improved inputs
    const result = runFullCampaignSimulation(optimizedConfig, undefined, 9999);
    setOptimizedResult(result);
  };

  // Helper to calculate percentage change
  const calcDelta = (before: number, after: number, invert = false) => {
    if (before === 0) return { pct: 0, isPositive: true };
    const pct = ((after - before) / before) * 100;
    const isPositive = invert ? pct < 0 : pct > 0;
    return { pct: Number(pct.toFixed(1)), isPositive };
  };

  const roasDelta = optimizedResult ? calcDelta(initialResult.roas, optimizedResult.roas) : null;
  const ctrDelta = optimizedResult ? calcDelta(initialResult.ctr, optimizedResult.ctr) : null;
  const cpaDelta = optimizedResult ? calcDelta(initialResult.cpa, optimizedResult.cpa, true) : null;
  const convDelta = optimizedResult ? calcDelta(initialResult.conversions, optimizedResult.conversions) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
            Iterative Experimentation & Yield Tuning
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Campaign Optimization Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Apply data-driven programmatic adjustments based on post-campaign diagnostics. Re-simulate to test whether your optimizations produce statistically measurable lift.
          </p>
        </div>

        <button
          onClick={handleSimulateOptimization}
          className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-colors self-start md:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Optimized Campaign</span>
        </button>
      </div>

      {studentMode && (
        <EducationalNote
          title="The Optimization Cycle in Media Planning"
          explanation="Programmatic advertising is an iterative feedback loop: Plan → Execute → Measure → Optimize → Scale. By shifting budget away from underperforming desktop inventory to high-converting mobile apps and adopting the winning creative headline, media planners achieve significant ROAS improvements without expanding overall capital!"
        />
      )}

      {/* Comparison Scorecard: BEFORE vs AFTER */}
      {optimizedResult && (
        <div className="bg-slate-900 border border-emerald-900/50 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Optimization Impact Scorecard
              </h3>
            </div>
            <button
              onClick={() => onApplyOptimization(optimizedConfig, optimizedResult)}
              className="text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Set as Primary Campaign
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* ROAS */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                ROAS (Return On Spend)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through text-slate-500 font-mono-numbers">
                  {initialResult.roas}x
                </span>
                <span className="text-xl font-extrabold text-cyan-400 font-mono-numbers">
                  {optimizedResult.roas}x
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  roasDelta?.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {roasDelta && roasDelta.pct > 0 ? `+${roasDelta.pct}%` : `${roasDelta?.pct}%`} Improvement
              </span>
            </div>

            {/* CTR */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                CTR (Click-Through Rate)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through text-slate-500 font-mono-numbers">
                  {initialResult.ctr}%
                </span>
                <span className="text-xl font-extrabold text-purple-400 font-mono-numbers">
                  {optimizedResult.ctr}%
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  ctrDelta?.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {ctrDelta && ctrDelta.pct > 0 ? `+${ctrDelta.pct}%` : `${ctrDelta?.pct}%`} Lift
              </span>
            </div>

            {/* CPA */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                CPA (Cost Per Action)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through text-slate-500 font-mono-numbers">
                  ₹{initialResult.cpa}
                </span>
                <span className="text-xl font-extrabold text-amber-400 font-mono-numbers">
                  ₹{optimizedResult.cpa}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  cpaDelta?.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {cpaDelta && cpaDelta.pct < 0 ? `${cpaDelta.pct}% Cost Reduction` : `+${cpaDelta?.pct}%`}
              </span>
            </div>

            {/* Conversions */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Total Conversions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through text-slate-500 font-mono-numbers">
                  {initialResult.conversions}
                </span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono-numbers">
                  {optimizedResult.conversions}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  convDelta?.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {convDelta && convDelta.pct > 0 ? `+${convDelta.pct}%` : `${convDelta?.pct}%`} Volume
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Optimization Knobs & Tuning Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tuning Card 1: Platform Reallocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              1. Platform Budget Rebalancing
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono">Channel Shift</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Shift spend toward top-converting programmatic video or mobile app inventory.
          </p>

          <div className="space-y-3">
            {optimizedConfig.platforms.slice(0, 4).map((p) => (
              <div key={p.platform} className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 truncate">{p.platform}</span>
                  <span className="font-mono-numbers text-cyan-400 font-bold">{p.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={p.percentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = optimizedConfig.platforms.map((pl) =>
                      pl.platform === p.platform ? { ...pl, percentage: val } : pl
                    );
                    setOptimizedConfig({ ...optimizedConfig, platforms: updated });
                  }}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tuning Card 2: Bidding Strategy & Bid Cap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              2. Programmatic Bid Tuning
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono">Max CPM & Strategy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Fine-tune clearing price caps to eliminate wasteful upper-funnel auctions.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Max Bid Cap:</span>
                <span className="font-mono-numbers text-cyan-400 font-bold">
                  ₹{optimizedConfig.maxBid || 85}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={optimizedConfig.maxBid || 85}
                onChange={(e) =>
                  setOptimizedConfig({ ...optimizedConfig, maxBid: Number(e.target.value) })
                }
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Frequency Cap:</span>
                <span className="font-mono-numbers text-cyan-400 font-bold">
                  {optimizedConfig.frequencyCap} imp / 24h
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={optimizedConfig.frequencyCap}
                onChange={(e) =>
                  setOptimizedConfig({ ...optimizedConfig, frequencyCap: Number(e.target.value) })
                }
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Tightening to 2–3 prevents ad fatigue.
              </span>
            </div>
          </div>
        </div>

        {/* Tuning Card 3: Creative & Traffic Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              3. Scale Winning Variant
            </h4>
            <span className="text-[10px] text-purple-400 font-mono">A/B Traffic Allocation</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Shift delivery split to direct the majority of traffic to the validated winner.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Traffic Split Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {['50/50', '60/40', '70/30', '80/20'].map((split) => (
                <button
                  key={split}
                  type="button"
                  onClick={() => setOptimizedConfig({ ...optimizedConfig, trafficSplit: split as any })}
                  className={`py-1.5 px-3 rounded text-xs font-mono transition-colors ${
                    optimizedConfig.trafficSplit === split
                      ? 'bg-purple-950/60 border border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {split}
                </button>
              ))}
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              💡 Selecting 80/20 shifts 80% of impressions to the superior creative.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
