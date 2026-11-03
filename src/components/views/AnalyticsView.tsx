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
} from 'lucide-react';
import { SimulationResult, CampaignConfig } from '../../types/campaign';
import { AreaLineChart, HorizontalBarChart, DonutChart, VelocitySparkline } from '../common/Charts';
import { EducationalNote } from '../common/EducationalNote';

interface AnalyticsViewProps {
  simulationResult: SimulationResult;
  campaign: CampaignConfig;
  studentMode: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  simulationResult,
  campaign,
  studentMode,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<
    'spend' | 'impressions' | 'ctr' | 'conversions' | 'cpa' | 'roas'
  >('spend');

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

      {/* NEW: Performance Trends & Growth Velocity Sparkline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Pacing Velocity & Saturation Diagnostics
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                Plateau Detection Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Performance Trends — Growth Velocity & Plateau Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track day-by-day velocity of impression delivery and conversion scale to identify ad fatigue and saturation plateaus.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-medium">Impression Velocity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-300 font-medium">Conversion Velocity</span>
            </div>
          </div>
        </div>

        {/* Growth Velocity Sparkline Visualization */}
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

          // Detect conversion velocity peak and subsequent plateau
          let peakConv = 0;
          let peakDay = 1;
          dailyMetrics.forEach((d) => {
            if (d.conversions > peakConv) {
              peakConv = d.conversions;
              peakDay = d.day;
            }
          });

          // Plateau begins when conversion momentum levels off (typically after 60-70% flight)
          const plateauDay = Math.min(
            dailyMetrics.length,
            Math.max(Math.round(dailyMetrics.length * 0.65), peakDay + 3)
          );

          const peakImp = Math.max(...dailyMetrics.map((d) => d.impressions));
          const lateConvAvg =
            dailyMetrics
              .slice(plateauDay - 1)
              .reduce((s, d) => s + d.conversions, 0) /
            Math.max(1, dailyMetrics.length - plateauDay + 1);

          const earlyConvAvg =
            dailyMetrics.slice(0, plateauDay - 1).reduce((s, d) => s + d.conversions, 0) /
            Math.max(1, plateauDay - 1);

          const velocityDeltaPct = Math.round(
            ((lateConvAvg - earlyConvAvg) / Math.max(1, earlyConvAvg)) * 100
          );

          return (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90">
                <VelocitySparkline
                  data={velocityData}
                  plateauDay={plateauDay}
                  height={130}
                />
              </div>

              {/* Plateau Diagnostic Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Peak Conversion Day</span>
                  <div className="text-sm font-bold text-white font-mono-numbers mt-0.5">
                    Day {peakDay} ({peakConv.toLocaleString()} conv/day)
                  </div>
                  <span className="text-[10px] text-slate-400">Maximum daily customer velocity</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Plateau Inception Point</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers mt-0.5">
                    Day {plateauDay} of {dailyMetrics.length}
                  </div>
                  <span className="text-[10px] text-slate-400">Marginal gains began tapering</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Saturation Velocity Delta</span>
                  <div className="text-sm font-bold text-cyan-300 font-mono-numbers mt-0.5">
                    {velocityDeltaPct >= 0 ? `+${velocityDeltaPct}%` : `${velocityDeltaPct}%`} Trajectory
                  </div>
                  <span className="text-[10px] text-slate-400">Late-flight vs initial flight pace</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">Recommended Action</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    Creative Refresh & Cap
                  </div>
                  <span className="text-[10px] text-slate-400">Rotate Variant B to reset fatigue</span>
                </div>
              </div>

              {/* Student Note on Growth Plateaus */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white">Student Learning Concept — The Growth Plateau: </strong>
                In digital advertising, impressions can continue to climb steadily (cyan curve), but conversion velocity (purple curve) often levels off or declines after frequency exceeds 3.5 exposures. When students notice this plateau (highlighted in amber), it signals <em>audience ad fatigue</em> and <em>diminishing marginal returns</em>. The remedy is to rotate creative variants or expand audience targeting in the <strong>Optimization Lab</strong>.
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
