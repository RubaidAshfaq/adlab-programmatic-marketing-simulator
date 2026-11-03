import React from 'react';
import {
  Trophy,
  Target,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Challenge, CampaignConfig, SimulationResult } from '../../types/campaign';
import { PROGRAMMATIC_CHALLENGES } from '../../utils/presets';
import { EducationalNote } from '../common/EducationalNote';

interface ChallengesViewProps {
  activeChallengeId: string | null;
  onAcceptChallenge: (challenge: Challenge) => void;
  simulationResult: SimulationResult | null;
  studentMode: boolean;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  activeChallengeId,
  onAcceptChallenge,
  simulationResult,
  studentMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Strategic Marketing Competitions
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Programmatic Advertising Challenges
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Apply data-driven programmatic strategies to solve real-world industry marketing briefs. Meet specific objective benchmarks under strict budget and targeting constraints.
        </p>
      </div>

      {studentMode && (
        <EducationalNote
          title="Applying Theory to Programmatic Briefs"
          explanation="Each programmatic challenge mirrors a distinct industry scenario: from upper-funnel mass-reach campaigns requiring low-CPM programmatic display, to high-urgency conversion blitzes where bidding on high-intent mobile inventory is paramount."
        />
      )}

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROGRAMMATIC_CHALLENGES.map((challenge, idx) => {
          const isActive = activeChallengeId === challenge.id;

          // Check if current simulation meets challenge criteria
          let isPassed = false;
          let currentVal = 0;
          if (simulationResult && isActive) {
            currentVal = simulationResult[challenge.targetMetricKey] as number;
            isPassed = currentVal >= challenge.targetThreshold;
          }

          return (
            <div
              key={challenge.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                isActive
                  ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-mono text-cyan-400 font-bold">
                    CHALLENGE 0{idx + 1}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {challenge.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 mb-1">
                  {challenge.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {challenge.description}
                </p>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget Cap:</span>
                    <span className="font-mono-numbers text-white font-bold">
                      ₹{challenge.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Benchmark:</span>
                    <span className="font-mono text-amber-300 font-semibold">
                      {challenge.targetKpiDescription}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Flight:</span>
                    <span className="font-mono text-slate-300">
                      {challenge.recommendedDuration} Days
                    </span>
                  </div>
                </div>

                {/* Status indicator if active */}
                {isActive && simulationResult && (
                  <div
                    className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${
                      isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">
                        {isPassed ? 'Target Achieved!' : 'Benchmark Not Yet Met'}
                      </span>
                      <div className="text-[11px] font-mono-numbers">
                        Current result: {currentVal.toLocaleString()}{' '}
                        {challenge.targetMetricKey === 'roas'
                          ? 'x'
                          : challenge.targetMetricKey === 'ctr' ||
                            challenge.targetMetricKey === 'videoCompletionPct'
                          ? '%'
                          : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onAcceptChallenge(challenge)}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{isActive ? 'Active Challenge' : 'Accept Challenge'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
