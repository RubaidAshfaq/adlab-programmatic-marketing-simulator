import React from 'react';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Target,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SimulationResult, CampaignConfig } from '../../types/campaign';
import { ScoreGauge } from '../common/Charts';
import { EducationalNote } from '../common/EducationalNote';

interface EffectivenessViewProps {
  simulationResult: SimulationResult;
  campaign: CampaignConfig;
  onNavigateToOptimization: () => void;
  studentMode: boolean;
}

export const EffectivenessView: React.FC<EffectivenessViewProps> = ({
  simulationResult,
  campaign,
  onNavigateToOptimization,
  studentMode,
}) => {
  const { effectiveness, diagnostics } = simulationResult;

  const scorePillars = [
    {
      name: 'Media Efficiency',
      score: effectiveness.mediaEfficiency,
      max: 20,
      description: 'Viewability, delivery pacing, and optimal frequency capping (preventing ad fatigue).',
      color: 'bg-cyan-500',
    },
    {
      name: 'Audience Performance',
      score: effectiveness.audiencePerformance,
      max: 15,
      description: 'Demographic match precision, geo-market concentration, and behavioral intent alignment.',
      color: 'bg-blue-500',
    },
    {
      name: 'Creative Performance',
      score: effectiveness.creativePerformance,
      max: 15,
      description: 'Ad creative click-through rates against industry vertical benchmarks.',
      color: 'bg-purple-500',
    },
    {
      name: 'Engagement',
      score: effectiveness.engagement,
      max: 15,
      description: 'Cost per click efficiency and visitor interaction velocity.',
      color: 'bg-indigo-500',
    },
    {
      name: 'Conversion Performance',
      score: effectiveness.conversionPerformance,
      max: 20,
      description: 'Direct bottom-funnel acquisition cost (CPA) and Return on Ad Spend (ROAS).',
      color: 'bg-emerald-500',
    },
    {
      name: 'Budget Efficiency',
      score: effectiveness.budgetEfficiency,
      max: 10,
      description: 'Budget utilization and lack of premature exhaustion or underspend.',
      color: 'bg-amber-500',
    },
    {
      name: 'A/B Testing Rigor',
      score: effectiveness.abTestingPerformance,
      max: 5,
      description: 'Sample size statistical confidence and hypothesis validation.',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
            Holistic Evaluation Matrix
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Campaign Effectiveness Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic 100-point composite scoring model benchmarking delivery, efficiency, engagement, and conversion ROI.
          </p>
        </div>

        <button
          onClick={onNavigateToOptimization}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-colors self-start md:self-auto shrink-0"
        >
          <span>Launch Optimization Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {studentMode && (
        <EducationalNote
          title="How Campaign Effectiveness is Scored"
          explanation="In professional advertising analytics, success is never judged by a single vanity metric like impressions. ADLAB's multi-factor effectiveness model evaluates media health (20%), audience match (15%), creative appeal (15%), engagement (15%), conversion ROI (20%), budget utilization (10%), and testing validity (5%)."
        />
      )}

      {/* Main Scorecard Split: Gauge & Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Gauge Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Overall Effectiveness Score
          </span>

          <ScoreGauge
            score={effectiveness.totalScore}
            rating={effectiveness.rating}
            label="Campaign Composite Rating"
          />

          <div className="w-full pt-4 border-t border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between items-center text-slate-400">
              <span>90–100:</span>
              <span className="font-semibold text-emerald-400">Excellent</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>75–89:</span>
              <span className="font-semibold text-cyan-400">Effective</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>60–74:</span>
              <span className="font-semibold text-amber-400">Moderate</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>40–59:</span>
              <span className="font-semibold text-orange-400">Needs Improvement</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>0–39:</span>
              <span className="font-semibold text-red-400">Poor</span>
            </div>
          </div>
        </div>

        {/* 7 Scoring Pillars Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Scoring Dimension Breakdown</h3>
            <span className="text-xs font-mono text-cyan-400">
              {effectiveness.totalScore} / 100 Points Total
            </span>
          </div>

          <div className="space-y-3.5">
            {scorePillars.map((p, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="font-mono-numbers font-bold text-cyan-300">
                    {p.score} / {p.max} pts
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(p.score / p.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Diagnostics Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Automated Campaign Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-400">
            Rule-based algorithmic observations derived from your actual simulated campaign performance.
          </p>
        </div>

        {/* What Worked vs What Underperformed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What Worked */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-emerald-900/30">
              <CheckCircle className="w-4 h-4" />
              <span>What Worked Well</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {diagnostics.whatWorked.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Underperformed */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 pb-2 border-b border-amber-900/30">
              <AlertTriangle className="w-4 h-4" />
              <span>What Underperformed</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {diagnostics.whatUnderperformed.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4 Deep-Dive Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block font-semibold">
              Creative Insight
            </span>
            <p className="text-slate-300 leading-relaxed">{diagnostics.creativeInsight}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 block font-semibold">
              Audience Insight
            </span>
            <p className="text-slate-300 leading-relaxed">{diagnostics.audienceInsight}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block font-semibold">
              Platform Insight
            </span>
            <p className="text-slate-300 leading-relaxed">{diagnostics.platformInsight}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block font-semibold">
              Budget Optimization
            </span>
            <p className="text-slate-300 leading-relaxed">{diagnostics.budgetInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
