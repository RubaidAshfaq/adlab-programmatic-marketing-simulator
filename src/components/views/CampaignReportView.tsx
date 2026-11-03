import React from 'react';
import {
  Printer,
  Download,
  FileText,
  Award,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { CampaignConfig, SimulationResult } from '../../types/campaign';

interface CampaignReportViewProps {
  campaign: CampaignConfig;
  simulationResult: SimulationResult;
  studentMode: boolean;
}

export const CampaignReportView: React.FC<CampaignReportViewProps> = ({
  campaign,
  simulationResult,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Generate CSV data from daily metrics and platform breakdowns
    const headers = [
      'Day',
      'Spend (INR)',
      'Impressions',
      'Clicks',
      'CTR (%)',
      'Conversions',
      'CPA (INR)',
      'Revenue (INR)',
      'ROAS (x)',
      'Variant A Clicks',
      'Variant B Clicks',
    ];

    const rows = simulationResult.dailyMetrics.map((d) => [
      d.day,
      d.spend,
      d.impressions,
      d.clicks,
      d.ctr,
      d.conversions,
      d.cpa,
      d.revenue,
      d.roas,
      d.variantA.clicks,
      d.variantB.clicks,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${campaign.brand.replace(/\s+/g, '_')}_Campaign_Simulation_Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Header (hidden in print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
            Executive Deliverable & Academic Evaluation
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Campaign Performance Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard comprehensive client and classroom presentation document. Ready for export and evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl space-y-8 font-sans max-w-5xl mx-auto border border-slate-200">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-1">
              ADLAB — Data-Driven Advertising & Programmatic Marketing Simulation Lab
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              {campaign.name}
            </h1>
            <div className="text-sm text-slate-600 mt-1">
              Client Brand: <strong className="text-slate-900">{campaign.brand}</strong> · Product: {campaign.product} · Vertical: {campaign.industry}
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-500">
            <div>Flight Duration: {simulationResult.totalDays} Days</div>
            <div>Date: {new Date(simulationResult.simulatedAt).toLocaleDateString()}</div>
            <div className="text-[10px] uppercase font-bold text-cyan-700 mt-1">
              SIMULATED / EDUCATIONAL DATA
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-200 pb-1 uppercase tracking-wide">
            1. Executive Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            This programmatic advertising simulation evaluated the launch of <strong>{campaign.product}</strong> for <strong>{campaign.brand}</strong>. Over a simulated flight of <strong>{simulationResult.totalDays} days</strong>, the campaign deployed a total capital investment of <strong>₹{simulationResult.totalSpend.toLocaleString()}</strong> across programmatic display, video, social, and connected inventory. The primary objective was <strong>{campaign.objective}</strong>, yielding an overall <strong>ROAS of {simulationResult.roas}x</strong>, delivering <strong>{simulationResult.impressions.toLocaleString()} impressions</strong>, <strong>{simulationResult.clicks.toLocaleString()} qualified clicks (CTR: {simulationResult.ctr}%)</strong>, and <strong>{simulationResult.conversions.toLocaleString()} conversions</strong> at an average acquisition cost of <strong>₹{simulationResult.cpa}</strong>.
          </p>
        </div>

        {/* Section 2: Strategy & Media Plan Overview */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-200 pb-1 uppercase tracking-wide">
            2. Strategic Media Plan & Targeting
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Total Budget</span>
              <span className="font-bold font-mono text-slate-900 text-sm">₹{campaign.totalBudget.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Bidding Strategy</span>
              <span className="font-bold text-slate-900 text-sm">{campaign.bidStrategy}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Frequency Cap</span>
              <span className="font-bold text-slate-900 text-sm">{campaign.frequencyCap} imp / 24 hrs</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Target Universe</span>
              <span className="font-bold font-mono text-slate-900 text-sm">{simulationResult.reach.toLocaleString()} Reach</span>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-1">
            <div><strong>Geographic Markets:</strong> {campaign.geography.join(', ')}</div>
            <div><strong>Demographics:</strong> {campaign.demographics.ages.join(', ')} · Gender: {campaign.demographics.gender}</div>
            <div><strong>Interests & Behaviors:</strong> {campaign.interests.concat(campaign.behaviors).join(', ')}</div>
          </div>
        </div>

        {/* Section 3: Platform Mix Performance Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-200 pb-1 uppercase tracking-wide">
            3. Platform & Inventory Distribution
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 border-b">Platform Channel</th>
                  <th className="p-2 border-b text-right">Spend (₹)</th>
                  <th className="p-2 border-b text-right">Impressions</th>
                  <th className="p-2 border-b text-right">Clicks</th>
                  <th className="p-2 border-b text-right">CTR (%)</th>
                  <th className="p-2 border-b text-right">CPC (₹)</th>
                  <th className="p-2 border-b text-right">Conversions</th>
                  <th className="p-2 border-b text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                {simulationResult.platformBreakdown.map((p, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 font-sans font-medium">{p.name}</td>
                    <td className="p-2 text-right">₹{p.spend.toLocaleString()}</td>
                    <td className="p-2 text-right">{p.impressions.toLocaleString()}</td>
                    <td className="p-2 text-right">{p.clicks.toLocaleString()}</td>
                    <td className="p-2 text-right">{p.ctr}%</td>
                    <td className="p-2 text-right">₹{p.cpc}</td>
                    <td className="p-2 text-right">{p.conversions}</td>
                    <td className="p-2 text-right font-bold text-emerald-700">{p.roas}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: A/B Testing Experimental Outcomes */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-200 pb-1 uppercase tracking-wide">
            4. Creative A/B Test Findings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded p-4 bg-slate-50 space-y-1">
              <div className="font-bold text-slate-900">Variant A (Control): &quot;{campaign.creativeA.headline}&quot;</div>
              <div className="text-slate-600">CTA: {campaign.creativeA.cta}</div>
              <div className="font-mono pt-2 text-[11px] space-y-0.5">
                <div>CTR: <strong>{simulationResult.abResults.variantA.ctr}%</strong> · CPC: ₹{simulationResult.abResults.variantA.cpc}</div>
                <div>Conversions: <strong>{simulationResult.abResults.variantA.conversions}</strong> · ROAS: <strong>{simulationResult.abResults.variantA.roas}x</strong></div>
              </div>
            </div>

            <div className="border border-purple-300 rounded p-4 bg-purple-50/50 space-y-1">
              <div className="font-bold text-purple-900">Variant B (Challenger): &quot;{campaign.creativeB.headline}&quot;</div>
              <div className="text-purple-700">CTA: {campaign.creativeB.cta}</div>
              <div className="font-mono pt-2 text-[11px] space-y-0.5">
                <div>CTR: <strong>{simulationResult.abResults.variantB.ctr}%</strong> · CPC: ₹{simulationResult.abResults.variantB.cpc}</div>
                <div>Conversions: <strong>{simulationResult.abResults.variantB.conversions}</strong> · ROAS: <strong>{simulationResult.abResults.variantB.roas}x</strong></div>
              </div>
            </div>
          </div>
          <div className="text-xs bg-slate-100 p-3 rounded text-slate-800">
            <strong>Decision Rationale ({simulationResult.abResults.confidenceScore}% Confidence):</strong> {simulationResult.abResults.reason}
          </div>
        </div>

        {/* Section 5: Campaign Effectiveness Score */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-200 pb-1 uppercase tracking-wide">
            5. Campaign Effectiveness Score & Diagnostics
          </h2>
          <div className="flex items-center gap-6 bg-slate-100 p-4 rounded-lg">
            <div className="text-3xl font-extrabold font-mono text-cyan-800">
              {simulationResult.effectiveness.totalScore} / 100
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Rating: {simulationResult.effectiveness.rating.toUpperCase()}
              </div>
              <div className="text-xs text-slate-600">
                Media: {simulationResult.effectiveness.mediaEfficiency}/20 · Audience: {simulationResult.effectiveness.audiencePerformance}/15 · Creative: {simulationResult.effectiveness.creativePerformance}/15 · Conversion: {simulationResult.effectiveness.conversionPerformance}/20
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <strong className="text-emerald-800 block mb-1">Key Success Drivers:</strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {simulationResult.diagnostics.whatWorked.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-amber-800 block mb-1">Identified Areas of Friction:</strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {simulationResult.diagnostics.whatUnderperformed.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6: Learning Outcomes & Next Steps */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <h2 className="text-base font-bold text-slate-950 uppercase tracking-wide">
            6. Pedagogical Learning Outcomes
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            Through this exercise, students demonstrated practical competence in audience segmentation, programmatic RTB auction mechanics, frequency capping governance, and controlled A/B testing methodologies. Reallocating budget to top-performing programmatic channels will yield higher aggregate ROAS in subsequent flights.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          ADLAB EDUCATIONAL SIMULATION ENGINE · NOT REAL MARKET DATA · GENERATED FOR ACADEMIC INSTRUCTION
        </div>
      </div>
    </div>
  );
};
