import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  MousePointer,
  Eye,
  ShoppingBag,
  Award,
  Layers,
  BarChart2,
  PieChart,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  Activity,
  Zap,
} from 'lucide-react';
import { SimulationResult, CampaignConfig } from '../../types/campaign';
import { AreaLineChart, HorizontalBarChart, DonutChart, VelocitySparkline } from '../common/Charts';
import { EducationalNote } from '../common/EducationalNote';
import { analyzeFlightTrends, TrendDiagnosticAlert } from '../../utils/trendDiagnostics';

interface AnalyticsViewProps {
  simulationResult: SimulationResult;
  campaign: CampaignConfig;
  studentMode: boolean;
  onNavigateToOptimization?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  simulationResult,
  campaign,
  studentMode,
  onNavigateToOptimization,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<
    'spend' | 'impressions' | 'ctr' | 'conversions' | 'cpa' | 'roas'
  >('spend');
  const [sparklineMode, setSparklineMode] = useState<'combined' | 'impressions' | 'conversions'>('combined');

  const { dailyMetrics, abResults, platformBreakdown, deviceBreakdown, demographicBreakdown } =
    simulationResult;

  // Time series datasets
  const spendSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.spend }));
  const impSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.impressions }));
  const ctrSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.ctr }));
  const convSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.conversions }));
  const cpaSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.cpa }));
  const roasSeries = dailyMetrics.map((d) => ({ label: `Day ${d.day}`, value: d.roas }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
            Post-Campaign Analytics & Performance Reporting
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {campaign.name} — Performance Telemetry
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Flight: {simulationResult.totalDays} Days</span>
            <span>·</span>
            <span>Simulated on: {new Date(simulationResult.simulatedAt).toLocaleDateString()}</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">100% Budget Delivered</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Aggregate ROAS
            </span>
            <span className="text-lg font-extrabold text-cyan-400 font-mono-numbers">
              {simulationResult.roas}x
            </span>
          </div>
          <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              A/B Test Confidence
            </span>
            <span className="text-lg font-extrabold text-purple-400 font-mono-numbers">
              {abResults.confidenceScore}%
            </span>
          </div>
        </div>
      </div>

      {studentMode && (
        <EducationalNote
          title="Understanding Modern Advertising KPIs"
          explanation="Comprehensive DSP analytics evaluates campaigns across four interdependent dimensions: Media delivery (impressions, viewability), Engagement (clicks, CTR), Cost efficiency (CPM, CPC, CPA), and Business outcomes (sales, ROAS). Low CPA combined with high ROAS indicates efficient capital allocation."
          formula="ROAS = Gross Revenue ÷ Ad Spend | CPA = Ad Spend ÷ Total Conversions"
        />
      )}

      {/* 4 KPI Pillar Groups: Media, Engagement, Cost, Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MEDIA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Media Delivery
            </span>
            <span className="text-[10px] font-mono text-cyan-400">UPPER FUNNEL</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Impressions:</span>
              <span className="font-bold text-white font-mono-numbers">
                {simulationResult.impressions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Unique Reach:</span>
              <span className="font-bold text-white font-mono-numbers">
                {simulationResult.reach.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg. Frequency:</span>
              <span className="font-bold text-cyan-300 font-mono-numbers">
                {simulationResult.frequency}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Viewability Rate:</span>
              <span className="font-bold text-emerald-400 font-mono-numbers">
                {simulationResult.viewabilityPct}%
              </span>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-blue-400" />
              Engagement
            </span>
            <span className="text-[10px] font-mono text-blue-400">MID FUNNEL</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Clicks:</span>
              <span className="font-bold text-white font-mono-numbers">
                {simulationResult.clicks.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Click-Through Rate:</span>
              <span className="font-bold text-emerald-400 font-mono-numbers">
                {simulationResult.ctr}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Video Completion Rate:</span>
              <span className="font-bold text-purple-300 font-mono-numbers">
                {simulationResult.videoCompletionPct}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Click Intent Index:</span>
              <span className="font-bold text-white font-mono-numbers">1.18x</span>
            </div>
          </div>
        </div>

        {/* COST */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Cost Efficiency
            </span>
            <span className="text-[10px] font-mono text-amber-400">UNIT COSTS</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Spend:</span>
              <span className="font-bold text-white font-mono-numbers">
                ₹{simulationResult.totalSpend.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Effective CPM:</span>
              <span className="font-bold text-amber-300 font-mono-numbers">
                ₹{simulationResult.cpm}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Effective CPC:</span>
              <span className="font-bold text-white font-mono-numbers">
                ₹{simulationResult.cpc}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cost Per Acquisition:</span>
              <span className="font-bold text-cyan-400 font-mono-numbers">
                ₹{simulationResult.cpa}
              </span>
            </div>
          </div>
        </div>

        {/* BUSINESS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              Business Outcomes
            </span>
            <span className="text-[10px] font-mono text-emerald-400">BOTTOM FUNNEL</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Conversions:</span>
              <span className="font-bold text-white font-mono-numbers">
                {simulationResult.conversions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Conversion Rate (CVR):</span>
              <span className="font-bold text-emerald-400 font-mono-numbers">
                {simulationResult.conversionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Simulated Revenue:</span>
              <span className="font-bold text-white font-mono-numbers">
                ₹{simulationResult.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ROAS Multiplier:</span>
              <span className="font-bold text-cyan-400 font-mono-numbers">
                {simulationResult.roas}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends & Growth Velocity Sparkline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Velocity & Growth Telemetry
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                Plateau Detection Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Performance Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize the velocity of impressions and conversion growth over the campaign duration to identify ad fatigue and saturation plateaus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSparklineMode('combined')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  sparklineMode === 'combined'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Combined Velocity
              </button>
              <button
                onClick={() => setSparklineMode('impressions')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  sparklineMode === 'impressions'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Impressions</span>
              </button>
              <button
                onClick={() => setSparklineMode('conversions')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  sparklineMode === 'conversions'
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Conversions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Growth Velocity Sparkline Visualization & Rule-Based Diagnostics Alert Panel */}
        {(() => {
          // Prepare velocity data points
          const velocityData = dailyMetrics.map((d, i) => {
            const prev = i > 0 ? dailyMetrics[i - 1] : d;
            return {
              day: d.day,
              impressions: d.impressions,
              conversions: d.conversions,
              impressionVelocity: d.impressions - prev.impressions,
              conversionVelocity: d.conversions - prev.conversions,
            };
          });

          // Run rule-based trend diagnostic analysis
          const trendAnalysis = analyzeFlightTrends(dailyMetrics, campaign);
          const { alerts, peakDay, peakConversions, plateauInceptionDay, momentumStatus } = trendAnalysis;

          // Velocity delta computation
          const lateFlightDays = dailyMetrics.slice(plateauInceptionDay - 1);
          const avgLateConversions =
            lateFlightDays.reduce((s, d) => s + d.conversions, 0) / Math.max(1, lateFlightDays.length);
          const earlyFlightDays = dailyMetrics.slice(0, plateauInceptionDay - 1);
          const avgEarlyConversions =
            earlyFlightDays.reduce((s, d) => s + d.conversions, 0) / Math.max(1, earlyFlightDays.length);
          const velocityDeltaPct = Math.round(
            ((avgLateConversions - avgEarlyConversions) / Math.max(1, avgEarlyConversions)) * 100
          );

          return (
            <div className="space-y-4">
              {/* Sparkline Canvas */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90">
                <VelocitySparkline
                  data={velocityData}
                  plateauDay={plateauInceptionDay}
                  height={130}
                  activeMode={sparklineMode}
                />
              </div>

              {/* Plateau Milestone Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Peak Conversion Day</span>
                  <div className="text-sm font-bold text-white font-mono-numbers mt-0.5">
                    Day {peakDay} ({peakConversions.toLocaleString()} conv/day)
                  </div>
                  <span className="text-[10px] text-slate-400">Maximum daily customer velocity</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Plateau Inception Point</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers mt-0.5">
                    Day {plateauInceptionDay} of {dailyMetrics.length}
                  </div>
                  <span className="text-[10px] text-slate-400">Incremental gains began tapering</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Momentum Trajectory</span>
                  <div className={`text-sm font-bold font-mono-numbers mt-0.5 ${
                    velocityDeltaPct >= 0 ? 'text-cyan-300' : 'text-amber-300'
                  }`}>
                    {velocityDeltaPct >= 0 ? `+${velocityDeltaPct}%` : `${velocityDeltaPct}%`} · {momentumStatus}
                  </div>
                  <span className="text-[10px] text-slate-400">Post-plateau vs ramp-up phase</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Prescribed Remedy</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5 truncate">
                    {alerts[0]?.prescribedAction.split('(')[0] || 'Rotate Creative'}
                  </div>
                  <span className="text-[10px] text-slate-400">Targeting & creative refresh</span>
                </div>
              </div>

              {/* DIAGNOSTICS ALERT PANEL */}
              {alerts.length > 0 && (
                <div className="bg-slate-950 rounded-xl border border-amber-900/40 p-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wide">
                            Diagnostics Alert: Momentum Stalled & Plateau Evaluation
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            alerts[0].severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {alerts[0].severity.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Algorithmic detection of audience fatigue, volume dips, and diminishing marginal returns.
                        </span>
                      </div>
                    </div>

                    {onNavigateToOptimization && (
                      <button
                        onClick={onNavigateToOptimization}
                        className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
                      >
                        <span>Fix in Optimization Lab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Alert Details Grid */}
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800/80 space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{alert.title}</span>
                            <span className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                              Day {alert.triggerDay} Trigger
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-amber-300">
                            {alert.triggerMetric}: <strong>{alert.triggerMetricValue}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
                            <strong className="text-slate-300 block mb-0.5">
                              Why Did Momentum Stall? (Root Cause)
                            </strong>
                            <p className="text-slate-400 leading-relaxed">
                              {alert.rootCause}
                            </p>
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
                            <strong className="text-slate-300 block mb-0.5">
                              Pedagogical Advertising Concept
                            </strong>
                            <p className="text-slate-400 leading-relaxed">
                              {alert.educationalExplanation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span><strong>Actionable Remedy:</strong> {alert.prescribedAction}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            Focus: {alert.optimizationTarget}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Note on Growth Plateaus */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white">Student Learning Concept — Identifying Growth Plateaus: </strong>
                In programmatic media, impressions can continue to climb steadily (cyan curve), but conversion velocity (purple curve) often flattens out after audience frequency exceeds 3.5 exposures. When this plateau occurs, continuing to bid on the same saturated audience burns ad spend without incremental return. Digital advertisers solve this by rotating to fresher creative variants, adjusting frequency caps, or expanding geo-demographic targeting in the <strong>Optimization Lab</strong>.
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Interactive Time-Series Charts (Charts 1-6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Flight Progression Over Time</h3>
            <p className="text-xs text-slate-400">
              Analyze daily day-by-day trends, pacing stability, and conversion cycles.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'spend', label: '1. Spend (₹)', color: '#06B6D4' },
              { id: 'impressions', label: '2. Impressions', color: '#3B82F6' },
              { id: 'ctr', label: '3. CTR (%)', color: '#10B981' },
              { id: 'conversions', label: '4. Conversions', color: '#8B5CF6' },
              { id: 'cpa', label: '5. CPA (₹)', color: '#F59E0B' },
              { id: 'roas', label: '6. ROAS (x)', color: '#06B6D4' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveChartTab(m.id as any)}
                className={`px-3 py-1 text-xs rounded-lg font-mono transition-colors whitespace-nowrap ${
                  activeChartTab === m.id
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Area Chart */}
        <div className="py-2">
          {activeChartTab === 'spend' && (
            <AreaLineChart data={spendSeries} prefix="₹" height={220} color="#06B6D4" />
          )}
          {activeChartTab === 'impressions' && (
            <AreaLineChart data={impSeries} height={220} color="#3B82F6" />
          )}
          {activeChartTab === 'ctr' && (
            <AreaLineChart data={ctrSeries} unit="%" decimals={2} height={220} color="#10B981" />
          )}
          {activeChartTab === 'conversions' && (
            <AreaLineChart data={convSeries} height={220} color="#8B5CF6" />
          )}
          {activeChartTab === 'cpa' && (
            <AreaLineChart data={cpaSeries} prefix="₹" decimals={1} height={220} color="#F59E0B" />
          )}
          {activeChartTab === 'roas' && (
            <AreaLineChart data={roasSeries} unit="x" decimals={2} height={220} color="#06B6D4" />
          )}
        </div>
      </div>

      {/* Breakdowns Grids: Platform, Device, Demographic (Charts 7-9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              7. Platform Performance
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">By Spend & ROAS</span>
          </div>
          <HorizontalBarChart
            data={platformBreakdown.map((p) => ({
              name: p.name,
              value: p.spend,
              highlight: p.roas >= 2.5,
            }))}
            prefix="₹"
            color="#06B6D4"
          />
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              8. Device Hardware Split
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">By Conversions</span>
          </div>
          <HorizontalBarChart
            data={deviceBreakdown.map((d) => ({
              name: d.name,
              value: d.conversions,
              highlight: d.name === 'Mobile',
            }))}
            unit=" conv"
            color="#8B5CF6"
          />
        </div>

        {/* Demographic Age Cohort Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              9. Age Cohort Delivery
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">By Clicks</span>
          </div>
          <HorizontalBarChart
            data={demographicBreakdown.map((a) => ({
              name: a.name,
              value: a.clicks,
              highlight: a.ctr >= 1.4,
            }))}
            unit=" clicks"
            color="#10B981"
          />
        </div>
      </div>

      {/* A/B Testing Lab Detailed Analysis (Chart 10 & Metrics) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                10. A/B Testing Laboratory & Statistical Engine
              </span>
              <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                Variable: {campaign.abTestVariable}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Experimental Variant Comparison: Variant A vs Variant B
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Likely Winner
              </span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {abResults.winningVariant}
              </span>
            </div>
          </div>
        </div>

        {/* Variant Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variant A */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Variant A (Control)
                </span>
                <span className="text-xs text-white font-medium">&quot;{campaign.creativeA.headline}&quot;</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                CTA: {campaign.creativeA.cta}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Impressions</span>
                <span className="font-bold text-slate-200">{abResults.variantA.impressions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Clicks</span>
                <span className="font-bold text-slate-200">{abResults.variantA.clicks.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">CTR</span>
                <span className="font-bold text-cyan-400">{abResults.variantA.ctr}%</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">CPC</span>
                <span className="font-bold text-slate-200">₹{abResults.variantA.cpc}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Conversions</span>
                <span className="font-bold text-slate-200">{abResults.variantA.conversions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">ROAS</span>
                <span className="font-bold text-emerald-400">{abResults.variantA.roas}x</span>
              </div>
            </div>
          </div>

          {/* Variant B */}
          <div className="bg-slate-950/80 border border-purple-900/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Variant B (Challenger)
                </span>
                <span className="text-xs text-white font-medium">&quot;{campaign.creativeB.headline}&quot;</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                CTA: {campaign.creativeB.cta}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Impressions</span>
                <span className="font-bold text-slate-200">{abResults.variantB.impressions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Clicks</span>
                <span className="font-bold text-slate-200">{abResults.variantB.clicks.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">CTR</span>
                <span className="font-bold text-purple-400">{abResults.variantB.ctr}%</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">CPC</span>
                <span className="font-bold text-slate-200">₹{abResults.variantB.cpc}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Conversions</span>
                <span className="font-bold text-slate-200">{abResults.variantB.conversions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">ROAS</span>
                <span className="font-bold text-emerald-400">{abResults.variantB.roas}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Decision Rationale Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Statistical Hypothesis Decision
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">
              Confidence Level: {abResults.confidenceScore}%
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {abResults.reason}
          </p>
        </div>
      </div>
    </div>
  );
};
