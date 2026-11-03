import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  TrendingUp,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CampaignConfig, SimulationResult, RtbAuctionEvent } from '../../types/campaign';
import { runFullCampaignSimulation, simulateSingleRtbAuction } from '../../utils/simulationEngine';
import { EducationalNote } from '../common/EducationalNote';

interface SimulationRunnerViewProps {
  campaign: CampaignConfig;
  simulationResult: SimulationResult | null;
  onSimulationComplete: (result: SimulationResult) => void;
  onNavigateToAnalytics: () => void;
  studentMode: boolean;
}

export const SimulationRunnerView: React.FC<SimulationRunnerViewProps> = ({
  campaign,
  simulationResult,
  onSimulationComplete,
  onNavigateToAnalytics,
  studentMode,
}) => {
  const duration = campaign.durationDays || 30;
  const [currentDay, setCurrentDay] = useState<number>(
    simulationResult?.progressDay || 0
  );
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>(
    simulationResult ? 'completed' : 'idle'
  );
  const [speed, setSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 5 = ultra, 99 = instant
  const [streamAuctions, setStreamAuctions] = useState<RtbAuctionEvent[]>(
    simulationResult?.recentAuctions || []
  );

  // Full pre-calculated deterministic dataset for smooth day-by-day playback
  const [fullSimulationData, setFullSimulationData] = useState<SimulationResult | null>(
    simulationResult
  );

  // When campaign changes or on reset
  const handleReset = () => {
    setStatus('idle');
    setCurrentDay(0);
    setStreamAuctions([]);
  };

  const handleStartOrResume = () => {
    if (status === 'completed') {
      setCurrentDay(0);
      setStreamAuctions([]);
    }

    if (!fullSimulationData || fullSimulationData.campaignId !== campaign.id) {
      const computed = runFullCampaignSimulation(campaign, undefined, Date.now());
      setFullSimulationData(computed);
    }
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleInstantComplete = () => {
    const computed = fullSimulationData || runFullCampaignSimulation(campaign, undefined, Date.now());
    setFullSimulationData(computed);
    setCurrentDay(duration);
    setStatus('completed');
    onSimulationComplete(computed);
  };

  // Day ticker effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'running') {
      const computed =
        fullSimulationData || runFullCampaignSimulation(campaign, undefined, Date.now());
      if (!fullSimulationData) setFullSimulationData(computed);

      const intervalMs = speed === 99 ? 10 : Math.max(80, 700 / speed);

      timer = setInterval(() => {
        setCurrentDay((prev) => {
          const nextDay = prev + 1;

          // Emit a live synthetic RTB auction log event for this day
          const sampleAuction = simulateSingleRtbAuction(campaign, Date.now() + nextDay);
          setStreamAuctions((curr) => [sampleAuction, ...curr.slice(0, 7)]);

          if (nextDay >= duration) {
            setStatus('completed');
            onSimulationComplete(computed);
            return duration;
          }
          return nextDay;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [status, speed, fullSimulationData, duration, campaign]);

  // Interpolated metrics for current day progress
  const progressFraction = Math.min(1.0, currentDay / Math.max(1, duration));
  const activeMetrics = fullSimulationData
    ? fullSimulationData.dailyMetrics[Math.max(0, currentDay - 1)]
    : null;

  const currentSpend = fullSimulationData
    ? fullSimulationData.dailyMetrics
        .slice(0, currentDay)
        .reduce((s, d) => s + d.spend, 0)
    : 0;
  const currentImpressions = fullSimulationData
    ? fullSimulationData.dailyMetrics
        .slice(0, currentDay)
        .reduce((s, d) => s + d.impressions, 0)
    : 0;
  const currentClicks = fullSimulationData
    ? fullSimulationData.dailyMetrics
        .slice(0, currentDay)
        .reduce((s, d) => s + d.clicks, 0)
    : 0;
  const currentConversions = fullSimulationData
    ? fullSimulationData.dailyMetrics
        .slice(0, currentDay)
        .reduce((s, d) => s + d.conversions, 0)
    : 0;
  const currentRevenue = fullSimulationData
    ? fullSimulationData.dailyMetrics
        .slice(0, currentDay)
        .reduce((s, d) => s + d.revenue, 0)
    : 0;

  const currentCtr =
    currentImpressions > 0 ? ((currentClicks / currentImpressions) * 100).toFixed(2) : '0.00';
  const currentCpc =
    currentClicks > 0 ? (currentSpend / currentClicks).toFixed(2) : '0.00';
  const currentCpa =
    currentConversions > 0 ? (currentSpend / currentConversions).toFixed(2) : '0.00';
  const currentRoas =
    currentSpend > 0 ? (currentRevenue / currentSpend).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                DSP Campaign Execution Engine
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                  status === 'running'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : status === 'completed'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {campaign.name}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Flight: {duration} Days · Total Budget: ₹{campaign.totalBudget.toLocaleString()} · Objective: {campaign.objective}
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {status === 'running' ? (
              <button
                onClick={handlePause}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartOrResume}
                className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{status === 'completed' ? 'Re-Run Campaign' : 'Start Simulation'}</span>
              </button>
            )}

            <button
              onClick={handleInstantComplete}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Fast-forward straight to Day 30"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Run</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-800 rounded-lg transition-colors"
              title="Reset flight"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Speed & Timeline Progress Bar */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                Simulation Flight Progress:
              </span>
              <span className="font-mono-numbers text-cyan-400 font-bold">
                Day {currentDay} of {duration}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 mr-1.5">Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-mono ${
                    speed === spd
                      ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 ease-linear shadow-sm shadow-cyan-500/50"
              style={{ width: `${progressFraction * 100}%` }}
            />
          </div>
        </div>
      </div>

      {studentMode && (
        <EducationalNote
          title="Flight Pacing and Real-Time Bid Evaluation"
          explanation="During flight execution, the Demand-Side Platform paces daily spend across high-intent hours and days of the week. Clicks and conversion events occur asynchronously as consumers progress from ad impression exposure to landing page action."
          formula="Daily Run-Rate Pacing = Remaining Budget ÷ Remaining Days"
        />
      )}

      {/* Live Running Metrics Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Simulated Spend
          </span>
          <div className="text-base font-bold text-white font-mono-numbers">
            ₹{currentSpend.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">
            {Math.round((currentSpend / campaign.totalBudget) * 100)}% paced
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Impressions
          </span>
          <div className="text-base font-bold text-cyan-300 font-mono-numbers">
            {currentImpressions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Ad exposures</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Clicks
          </span>
          <div className="text-base font-bold text-white font-mono-numbers">
            {currentClicks.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Direct visits</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Avg. CTR
          </span>
          <div className="text-base font-bold text-emerald-400 font-mono-numbers">
            {currentCtr}%
          </div>
          <span className="text-[10px] text-slate-400">Click rate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Conversions
          </span>
          <div className="text-base font-bold text-purple-300 font-mono-numbers">
            {currentConversions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Orders/Leads</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Avg. CPA
          </span>
          <div className="text-base font-bold text-amber-300 font-mono-numbers">
            ₹{currentCpa}
          </div>
          <span className="text-[10px] text-slate-400">Per action</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Gross Revenue
          </span>
          <div className="text-base font-bold text-emerald-300 font-mono-numbers">
            ₹{currentRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Simulated sales</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            ROAS
          </span>
          <div className="text-base font-bold text-cyan-400 font-mono-numbers">
            {currentRoas}x
          </div>
          <span className="text-[10px] text-slate-400">Return on spend</span>
        </div>
      </div>

      {/* Split Section: Live Streamed RTB Auctions & Campaign Completion Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live RTB Feed (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live OpenRTB Auction Stream</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              SSP Broadcast Log
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {streamAuctions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Click &quot;Start Simulation&quot; to begin processing incoming programmatic impression auctions.
              </div>
            ) : (
              streamAuctions.map((auc) => (
                <div
                  key={auc.id}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers text-slate-400 text-[11px]">{auc.id}</span>
                      <span className="text-slate-300 font-medium">
                        {auc.userProfile.location} · {auc.userProfile.device}
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
                        {auc.userProfile.interest}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Platform: <span className="text-slate-300">{auc.inventoryContext.platform}</span> · Format: {auc.inventoryContext.format}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {auc.studentWon ? (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Won @ ₹{auc.clearingPriceCpm} CPM
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Lost to {auc.winner.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono-numbers text-slate-500">
                      Score: {auc.bidders[0].finalAuctionScore.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completion Card & Next Steps (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Simulation Status</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              {status === 'completed'
                ? 'Flight Completed Successfully'
                : status === 'running'
                ? 'Flight in Active Execution'
                : 'Awaiting Simulation'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {status === 'completed'
                ? 'All flight days have concluded. Your campaign performance analytics, A/B testing statistical outcome, and 0–100 effectiveness score are ready to analyze.'
                : 'The simulation runs day-by-day deterministic modeling influenced by your targeting, creative quality, platform benchmarks, and RTB competition.'}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={onNavigateToAnalytics}
              disabled={status === 'idle'}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
            >
              <span>View Performance Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
