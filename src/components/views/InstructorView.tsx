import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Sliders,
  CheckCircle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { CampaignConfig, SimulationResult, InstructorSettings } from '../../types/campaign';
import { ScoreGauge } from '../common/Charts';

interface InstructorViewProps {
  campaign: CampaignConfig;
  simulationResult: SimulationResult | null;
  instructorSettings: InstructorSettings;
  onUpdateInstructorSettings: (settings: InstructorSettings) => void;
  studentMode: boolean;
}

export const InstructorView: React.FC<InstructorViewProps> = ({
  campaign,
  simulationResult,
  instructorSettings,
  onUpdateInstructorSettings,
}) => {
  const [settings, setSettings] = useState<InstructorSettings>(instructorSettings);

  const handleSettingChange = (key: keyof InstructorSettings, val: number) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    onUpdateInstructorSettings(updated);
  };

  // Grade calculation out of 100 points
  const computeStudentGrade = () => {
    if (!simulationResult) {
      return {
        strategyScore: 0,
        audienceScore: 0,
        mediaScore: 0,
        biddingScore: 0,
        abScore: 0,
        performanceScore: 0,
        optimizationScore: 0,
        totalGrade: 0,
        letter: 'Incomplete',
        feedback: 'Campaign simulation must be completed before grading.',
      };
    }

    // 1. Campaign Strategy (0 - 20)
    let strategyScore = 14;
    if (campaign.secondaryKpis.length >= 2) strategyScore += 3;
    if (campaign.name && campaign.name.length > 5) strategyScore += 3;

    // 2. Audience Strategy (0 - 15)
    let audienceScore = 10;
    if (campaign.demographics.ages.length >= 1 && campaign.geography.length >= 1) audienceScore += 3;
    if (campaign.interests.length >= 2) audienceScore += 2;

    // 3. Media Planning (0 - 15)
    let mediaScore = 10;
    const activePlatCount = campaign.platforms.filter((p) => p.percentage > 0).length;
    if (activePlatCount >= 3) mediaScore += 5;
    else if (activePlatCount >= 2) mediaScore += 3;

    // 4. Bidding Strategy (0 - 15)
    let biddingScore = 10;
    if (campaign.frequencyCap >= 2 && campaign.frequencyCap <= 4) biddingScore += 3;
    if (campaign.maxBid && campaign.maxBid >= 30) biddingScore += 2;

    // 5. A/B Testing (0 - 10)
    let abScore = 6;
    if (simulationResult.abResults.confidenceScore >= 80) abScore += 4;
    else if (simulationResult.abResults.confidenceScore >= 65) abScore += 2;

    // 6. Performance Analysis (0 - 15)
    let performanceScore = 0;
    if (simulationResult.ctr >= settings.targetMinCtr) performanceScore += 5;
    else performanceScore += 2;

    if (simulationResult.cpa <= settings.targetMaxCpa) performanceScore += 5;
    else performanceScore += 2;

    if (simulationResult.roas >= settings.targetMinRoas) performanceScore += 5;
    else performanceScore += 2;

    // 7. Optimization (0 - 10)
    let optimizationScore = 7;
    if (campaign.isOptimizedVersion) optimizationScore = 10;

    const totalGrade = Math.min(
      100,
      strategyScore + audienceScore + mediaScore + biddingScore + abScore + performanceScore + optimizationScore
    );

    let letter = 'B';
    if (totalGrade >= 90) letter = 'A+ (Distinction)';
    else if (totalGrade >= 80) letter = 'A (Excellent)';
    else if (totalGrade >= 70) letter = 'B+ (Proficient)';
    else if (totalGrade >= 60) letter = 'B (Satisfactory)';
    else letter = 'C (Needs Work)';

    let feedback = 'Strong grasp of programmatic inventory allocation and RTB mechanics.';
    if (totalGrade >= 88) {
      feedback = 'Outstanding strategic media execution! Cohesive audience targeting, high CTR, and exemplary ROAS efficiency.';
    } else if (totalGrade < 70) {
      feedback = 'Consider revising your platform budget distribution and tightening frequency caps to improve overall yield.';
    }

    return {
      strategyScore,
      audienceScore,
      mediaScore,
      biddingScore,
      abScore,
      performanceScore,
      optimizationScore,
      totalGrade,
      letter,
      feedback,
    };
  };

  const grade = computeStudentGrade();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Instructor & Faculty Grading Console
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Academic Campaign Assessment & Benchmarks
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Configure grading rubrics, set target KPI bars, and review automatically generated pedagogical scores based on student strategic decisions and simulated market results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Benchmark Threshold Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Target KPI Benchmarks</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Grading Criteria</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Min CTR */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Minimum Required CTR:</span>
                <span className="font-mono-numbers text-cyan-400 font-bold">
                  {settings.targetMinCtr}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.targetMinCtr}
                onChange={(e) => handleSettingChange('targetMinCtr', Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Max Target CPA */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Maximum Allowable CPA:</span>
                <span className="font-mono-numbers text-amber-400 font-bold">
                  ₹{settings.targetMaxCpa}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={settings.targetMaxCpa}
                onChange={(e) => handleSettingChange('targetMaxCpa', Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Min Target ROAS */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Minimum Target ROAS:</span>
                <span className="font-mono-numbers text-emerald-400 font-bold">
                  {settings.targetMinRoas}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.2"
                value={settings.targetMinRoas}
                onChange={(e) => handleSettingChange('targetMinRoas', Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 Adjusting these benchmarks dynamically recomputes the student performance assessment rubric.
          </div>
        </div>

        {/* Right: Student Grade & Rubric Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Evaluated Campaign
              </span>
              <h3 className="text-base font-bold text-white">{campaign.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono-numbers">
                {grade.totalGrade}
              </span>
              <span className="text-xs text-slate-400 font-mono-numbers"> / 100</span>
              <div className="text-xs font-bold text-emerald-400">{grade.letter}</div>
            </div>
          </div>

          {/* Rubric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Campaign Strategy</span>
              <span className="font-bold text-white font-mono-numbers">
                {grade.strategyScore} / 20 pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Audience Strategy</span>
              <span className="font-bold text-white font-mono-numbers">
                {grade.audienceScore} / 15 pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Media Planning</span>
              <span className="font-bold text-white font-mono-numbers">
                {grade.mediaScore} / 15 pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Bidding Strategy</span>
              <span className="font-bold text-white font-mono-numbers">
                {grade.biddingScore} / 15 pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">A/B Testing Rigor</span>
              <span className="font-bold text-white font-mono-numbers">
                {grade.abScore} / 10 pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">KPI Target Results</span>
              <span className="font-bold text-cyan-300 font-mono-numbers">
                {grade.performanceScore} / 15 pts
              </span>
            </div>
          </div>

          {/* Instructor Feedback Note */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Faculty Feedback</span>
            </span>
            <p className="text-slate-300 leading-relaxed">{grade.feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
