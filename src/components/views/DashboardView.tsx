import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  ShoppingBag,
  Award,
  Layers,
  Zap,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { CampaignConfig, SimulationResult } from '../../types/campaign';
import { AreaLineChart, ScoreGauge, DonutChart } from '../common/Charts';
import { EducationalNote } from '../common/EducationalNote';

interface DashboardViewProps {
  campaign: CampaignConfig;
  simulationResult: SimulationResult;
  onNavigate: (section: string) => void;
  onRunSimulation: () => void;
  studentMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  campaign,
  simulationResult,
  onNavigate,
  onRunSimulation,
  studentMode,
}) => {
  const [activeSparkChart, setActiveSparkChart] = useState<'spend' | 'impressions' | 'ctr' | 'conversions' | 'roas'>('spend');

  const {
    totalSpend,
    impressions,
    reach,
    frequency,
    clicks,
    ctr,
    cpc,
    cpm,
    conversions,
    conversionRate,
    cpa,
    revenue,
    roas,
    abResults,
    effectiveness,
    dailyMetrics,
  } = simulationResult;

  // Chart data
  const spendData = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.spend }));
  const impData = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.impressions }));
  const ctrData = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.ctr }));
  const convData = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.conversions }));
  const roasData = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.roas }));

  return (
    <div className="space-y-6">
      {/* Top Welcome / Campaign Status Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-semibold">
                ACTIVE EXPERIMENT
              </span>
              <span className="text-xs text-slate-400">
                {campaign.brand} · {campaign.product} ({campaign.industry})
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {campaign.name}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Programmatic campaign flight deployed across {campaign.platforms.length} platforms. Targeting {campaign.geography.join(', ')} with {campaign.bidStrategy} strategy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('rtb')}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>RTB Simulator</span>
            </button>

            <button
              onClick={() => onNavigate('optimize')}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Optimize Flight</span>
            </button>

            <button
              onClick={() => onNavigate('simulation')}
              className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {studentMode && (
        <EducationalNote
          title="The Programmatic Media Command Center"
          explanation="This dashboard synthesizes multi-channel advertising performance into actionable intelligence. Digital marketers track pacing (total spend vs budget), delivery efficiency (CPM, reach, frequency), and economic return (CPA and ROAS) to maximize marketing productivity."
          formula="ROAS = Gross Revenue ÷ Spend | Frequency = Impressions ÷ Unique Reach"
        />
      )}

      {/* Primary KPI Grid (15 Key Metrics Requested by User Brief) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Total Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Total Spend</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            ₹{totalSpend.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            of ₹{campaign.totalBudget.toLocaleString()} budget
          </div>
        </div>

        {/* Impressions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Impressions</span>
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {impressions.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Ad view opportunities</div>
        </div>

        {/* Clicks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Clicks</span>
            <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {clicks.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Engaged visits</div>
        </div>

        {/* CTR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">CTR</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono-numbers">
            {ctr}%
          </div>
          <div className="text-[10px] text-slate-400">Click-through rate</div>
        </div>

        {/* Conversions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Conversions</span>
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {conversions.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Orders & actions</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Conversion Rate</span>
            <span className="text-[10px] font-mono text-cyan-400">CVR</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {conversionRate}%
          </div>
          <div className="text-[10px] text-slate-400">Clicks to customers</div>
        </div>

        {/* CPC */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">CPC</span>
            <span className="text-[10px] font-mono text-slate-400">UNIT</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            ₹{cpc}
          </div>
          <div className="text-[10px] text-slate-400">Cost per click</div>
        </div>

        {/* CPM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">CPM</span>
            <span className="text-[10px] font-mono text-slate-400">MILLE</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            ₹{cpm}
          </div>
          <div className="text-[10px] text-slate-400">Cost per 1k views</div>
        </div>

        {/* CPA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">CPA</span>
            <span className="text-[10px] font-mono text-amber-400">ACTION</span>
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono-numbers">
            ₹{cpa}
          </div>
          <div className="text-[10px] text-slate-400">Cost per acquisition</div>
        </div>

        {/* ROAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">ROAS</span>
            <span className="text-[10px] font-mono text-cyan-400">RETURN</span>
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono-numbers">
            {roas}x
          </div>
          <div className="text-[10px] text-slate-400">₹{revenue.toLocaleString()} revenue</div>
        </div>

        {/* Reach */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Reach</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {reach.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Unique consumers</div>
        </div>

        {/* Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Frequency</span>
            <span className="text-[10px] font-mono text-slate-400">EXPOSURE</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers">
            {frequency}x
          </div>
          <div className="text-[10px] text-slate-400">Views per person</div>
        </div>

        {/* Winning A/B Variant */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Winning Variant</span>
            <Award className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-300 font-mono truncate">
            {abResults.winningVariant}
          </div>
          <div className="text-[10px] text-slate-400 font-mono-numbers">
            {abResults.confidenceScore}% confidence
          </div>
        </div>

        {/* Campaign Effectiveness Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 col-span-2 sm:col-span-1 md:col-span-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider">Effectiveness Score</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              {effectiveness.rating}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-cyan-400 font-mono-numbers">
              {effectiveness.totalScore}
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Comprehensive diagnostic grade
          </div>
        </div>
      </div>

      {/* Main Charts & Side Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Campaign Dynamics</h3>
              <p className="text-xs text-slate-400">
                Track how key metrics developed day by day over the {simulationResult.totalDays}-day flight.
              </p>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'spend', label: 'Spend (₹)' },
                { id: 'impressions', label: 'Impressions' },
                { id: 'ctr', label: 'CTR (%)' },
                { id: 'conversions', label: 'Conversions' },
                { id: 'roas', label: 'ROAS (x)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSparkChart(tab.id as any)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                    activeSparkChart === tab.id
                      ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-2">
            {activeSparkChart === 'spend' && (
              <AreaLineChart data={spendData} prefix="₹" height={210} color="#06B6D4" />
            )}
            {activeSparkChart === 'impressions' && (
              <AreaLineChart data={impData} height={210} color="#3B82F6" />
            )}
            {activeSparkChart === 'ctr' && (
              <AreaLineChart data={ctrData} unit="%" decimals={2} height={210} color="#10B981" />
            )}
            {activeSparkChart === 'conversions' && (
              <AreaLineChart data={convData} height={210} color="#8B5CF6" />
            )}
            {activeSparkChart === 'roas' && (
              <AreaLineChart data={roasData} unit="x" decimals={2} height={210} color="#06B6D4" />
            )}
          </div>
        </div>

        {/* Effectiveness Gauge & Quick Diagnostics (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Effectiveness Synthesis
            </h3>
            <button
              onClick={() => onNavigate('effectiveness')}
              className="text-[11px] text-cyan-400 hover:underline font-mono"
            >
              Full Diagnostics →
            </button>
          </div>

          <div className="flex justify-center py-2">
            <ScoreGauge
              score={effectiveness.totalScore}
              rating={effectiveness.rating}
              label="Overall Campaign Score"
            />
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-200">Key Automated Finding:</div>
            <p className="text-slate-400 leading-snug">
              {simulationResult.diagnostics.creativeInsight}
            </p>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="w-full py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore Deep Analytics (10 Charts)</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
