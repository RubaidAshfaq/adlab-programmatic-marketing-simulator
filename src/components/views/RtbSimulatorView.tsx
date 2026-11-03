import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CampaignConfig, RtbAuctionEvent } from '../../types/campaign';
import { simulateSingleRtbAuction } from '../../utils/simulationEngine';
import { EducationalNote } from '../common/EducationalNote';

interface RtbSimulatorViewProps {
  campaign: CampaignConfig;
  studentMode: boolean;
  onUpdateBid?: (newBid: number) => void;
}

export const RtbSimulatorView: React.FC<RtbSimulatorViewProps> = ({
  campaign,
  studentMode,
  onUpdateBid,
}) => {
  const [currentAuction, setCurrentAuction] = useState<RtbAuctionEvent | null>(null);
  const [auctionStage, setAuctionStage] = useState<'idle' | 'broadcast' | 'bidding' | 'clearing' | 'complete'>('idle');
  const [autoRun, setAutoRun] = useState(false);
  const [history, setHistory] = useState<RtbAuctionEvent[]>([]);
  const [customBidCpm, setCustomBidCpm] = useState<number>(campaign.maxBid || 85);

  // Initialize with a sample auction
  useEffect(() => {
    const first = simulateSingleRtbAuction(campaign, 101);
    setCurrentAuction(first);
    setHistory([first]);
    setAuctionStage('complete');
  }, [campaign.id]);

  const runStepByStepAuction = () => {
    const fresh = simulateSingleRtbAuction(
      { ...campaign, maxBid: customBidCpm },
      Date.now() + Math.floor(Math.random() * 5000)
    );
    setCurrentAuction(fresh);
    setAuctionStage('broadcast');

    setTimeout(() => {
      setAuctionStage('bidding');
      setTimeout(() => {
        setAuctionStage('clearing');
        setTimeout(() => {
          setAuctionStage('complete');
          setHistory((prev) => [fresh, ...prev.slice(0, 19)]);
        }, 600);
      }, 700);
    }, 600);
  };

  // Continuous live auction loop when autoRun is true
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRun) {
      timer = setInterval(() => {
        const next = simulateSingleRtbAuction(
          { ...campaign, maxBid: customBidCpm },
          Date.now() + Math.floor(Math.random() * 5000)
        );
        setCurrentAuction(next);
        setAuctionStage('complete');
        setHistory((prev) => [next, ...prev.slice(0, 24)]);
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [autoRun, campaign, customBidCpm]);

  // Aggregate stats from history
  const totalAuctions = history.length;
  const wonAuctions = history.filter((h) => h.studentWon).length;
  const winRate = totalAuctions > 0 ? ((wonAuctions / totalAuctions) * 100).toFixed(1) : '0.0';
  const avgClearing = totalAuctions > 0
    ? (history.reduce((s, h) => s + h.clearingPriceCpm, 0) / totalAuctions).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Interactive SSP / Ad Exchange Module
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              SIMULATED RTB PROTOCOL
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Real-Time Bidding (RTB) Auction Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Watch ad impressions trade in sub-100 millisecond simulated auctions. Observe how modern DSPs balance bid price against targeting match, creative quality, and viewability.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              autoRun
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {autoRun ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Pause Live Stream
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Live Stream Auctions
              </>
            )}
          </button>

          <button
            onClick={runStepByStepAuction}
            disabled={autoRun}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            Trigger Single Auction
          </button>
        </div>
      </div>

      {studentMode && (
        <EducationalNote
          title="How Programmatic RTB Auctions Work"
          explanation="When a user loads a webpage or mobile app, an ad space calls the Supply-Side Platform (SSP). The SSP broadcasts an OpenRTB Bid Request containing the user's demographic, geo, and intent signals. Competing DSPs submit bid CPMs alongside their creative quality scores. In a second-price auction, the highest auction score wins, but clears at the second-highest bidder's equivalent price!"
          formula="Auction Score = Bid (CPM) × Audience Match × Quality Score × Viewability"
        />
      )}

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Impression Context & Student Bid Control (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ad Impression Available Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Ad Impression Available
                </span>
              </div>
              <span className="text-[11px] font-mono-numbers text-cyan-400">
                {currentAuction ? currentAuction.id : 'READY'}
              </span>
            </div>

            {currentAuction ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Incoming User Profile</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Demographic:</span>
                      <span className="font-semibold text-slate-200">{currentAuction.userProfile.age} yrs · All</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Geography:</span>
                      <span className="font-semibold text-slate-200">{currentAuction.userProfile.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Device Hardware:</span>
                      <span className="font-semibold text-slate-200">{currentAuction.userProfile.device}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Interest:</span>
                      <span className="font-semibold text-cyan-300">{currentAuction.userProfile.interest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchase Intent:</span>
                      <span className={`font-semibold ${
                        currentAuction.userProfile.intentLevel === 'High' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {currentAuction.userProfile.intentLevel} Intent
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Publisher Inventory Context</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform:</span>
                      <span className="font-semibold text-slate-200">{currentAuction.inventoryContext.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slot Format:</span>
                      <span className="font-semibold text-slate-200">{currentAuction.inventoryContext.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Historical Viewability:</span>
                      <span className="font-mono-numbers text-slate-200">
                        {Math.round(currentAuction.inventoryContext.viewabilityScore * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Awaiting auction initiation...
              </div>
            )}
          </div>

          {/* Real-time Bid Adjustment Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>Your DSP Bid Configuration</span>
              <span className="text-[10px] text-cyan-400 font-normal">Active Campaign</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Max Bid CPM:</span>
                  <span className="font-bold font-mono-numbers text-cyan-400 text-sm">
                    ₹{customBidCpm.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={customBidCpm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomBidCpm(val);
                    if (onUpdateBid) onUpdateBid(val);
                  }}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono-numbers">
                  <span>₹20 (Low)</span>
                  <span>₹120 (Standard)</span>
                  <span>₹250 (Aggressive)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>
                  💡 <strong className="text-slate-200">Bidding Principle:</strong> Higher bids raise your win probability, but in a <em>second-price auction</em>, your actual cost is determined by competitor strength!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Auction Bidding Table & Outcome (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Auction Stages & Bidders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Bidding Floor</h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Auction Protocol:</span>
                <span className="text-cyan-300 font-mono">Second-Price Vickrey</span>
              </div>
            </div>

            {/* Bidders Ranking Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2.5 font-medium">Rank & Bidder</th>
                    <th className="pb-2.5 font-medium text-right">Bid (CPM)</th>
                    <th className="pb-2.5 font-medium text-right">Audience Match</th>
                    <th className="pb-2.5 font-medium text-right">Quality Score</th>
                    <th className="pb-2.5 font-medium text-right">Viewability</th>
                    <th className="pb-2.5 font-medium text-right">Auction Score</th>
                    <th className="pb-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  {currentAuction?.bidders.map((bidder, idx) => {
                    const isWinner = bidder.name === currentAuction.winner;
                    const isStudent = bidder.isStudent;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isWinner
                            ? 'bg-emerald-950/20 text-white font-medium'
                            : isStudent
                            ? 'bg-cyan-950/20 text-slate-200'
                            : 'text-slate-300 hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isWinner
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[170px] font-sans font-medium">
                              {bidder.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-slate-200">
                          ₹{bidder.bidCpm.toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {(bidder.audienceMatch * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {(bidder.qualityScore * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {(bidder.viewability * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 text-right font-bold text-cyan-300">
                          {bidder.finalAuctionScore.toFixed(4)}
                        </td>
                        <td className="py-3 text-right">
                          {isWinner ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              WON
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              OUTBID
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Auction Outcome Card */}
            {currentAuction && (
              <div className="mt-5 pt-4 border-t border-slate-800 bg-slate-950/60 p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
                      Winning Ad Clearing Result
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {currentAuction.winner}
                      </span>
                      {currentAuction.studentWon ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
                          Your Campaign Won!
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          Competitor Won
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Winning Bid</span>
                      <span className="text-sm font-bold text-slate-300 font-mono-numbers">
                        ₹{currentAuction.winningBidCpm.toFixed(2)} CPM
                      </span>
                    </div>

                    <div className="border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-emerald-400 block font-medium">Actual Clearing Price</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono-numbers">
                        ₹{currentAuction.clearingPriceCpm.toFixed(2)} CPM
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-200">Why did this advertiser win? </strong>
                  The winning bidder achieved the highest composite Auction Score (
                  <span className="font-mono-numbers text-cyan-300">
                    {currentAuction.bidders[0].finalAuctionScore.toFixed(4)}
                  </span>
                  ). Note that in modern programmatic exchanges, a bidder with a slightly lower bid can still win if their <em>Audience Match</em> or <em>Creative Quality</em> is superior!
                </div>
              </div>
            )}
          </div>

          {/* Historical RTB Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Auctions Logged</span>
              <span className="text-lg font-bold text-white font-mono-numbers">{totalAuctions}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Your DSP Wins</span>
              <span className="text-lg font-bold text-emerald-400 font-mono-numbers">{wonAuctions}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Win Rate</span>
              <span className="text-lg font-bold text-cyan-400 font-mono-numbers">{winRate}%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Avg Clearing Price</span>
              <span className="text-lg font-bold text-amber-400 font-mono-numbers">₹{avgClearing}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
