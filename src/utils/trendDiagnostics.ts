/**
 * Rule-based trend diagnostics helper for ADLAB
 * Evaluates simulated daily flight telemetry to detect conversion plateaus,
 * sudden performance dips, ad fatigue inflection points, and pacing constraints.
 */

import { DailySimulationMetric, CampaignConfig } from '../types/campaign';

export interface TrendDiagnosticAlert {
  id: string;
  type: 'plateau' | 'dip' | 'ad_fatigue' | 'pacing_constraint' | 'healthy_momentum';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  triggerDay: number;
  triggerMetric: string;
  triggerMetricValue: string;
  rootCause: string;
  educationalExplanation: string;
  prescribedAction: string;
  optimizationTarget: 'frequencyCap' | 'budget' | 'creative' | 'targeting' | 'bidding';
}

/**
 * Analyzes daily metrics to identify growth plateaus, volume dips, and saturation
 */
export function analyzeFlightTrends(
  dailyMetrics: DailySimulationMetric[],
  campaign: CampaignConfig
): {
  alerts: TrendDiagnosticAlert[];
  peakDay: number;
  peakConversions: number;
  plateauInceptionDay: number;
  momentumScore: number; // 0-100
  momentumStatus: 'Strong Acceleration' | 'Stabilized Plateau' | 'Velocity Deceleration' | 'Severe Drop';
} {
  if (!dailyMetrics || dailyMetrics.length === 0) {
    return {
      alerts: [],
      peakDay: 1,
      peakConversions: 0,
      plateauInceptionDay: 1,
      momentumScore: 50,
      momentumStatus: 'Stabilized Plateau',
    };
  }

  const alerts: TrendDiagnosticAlert[] = [];

  // 1. Identify Peak Day & Conversion Volumes
  let peakDay = 1;
  let peakConversions = 0;
  dailyMetrics.forEach((d) => {
    if (d.conversions > peakConversions) {
      peakConversions = d.conversions;
      peakDay = d.day;
    }
  });

  // 2. Identify Plateau Inception Day
  // A plateau is defined when day-over-day conversion growth drops below 4% for 3+ consecutive days after the peak
  let plateauInceptionDay = Math.min(
    dailyMetrics.length,
    Math.max(peakDay + 2, Math.round(dailyMetrics.length * 0.6))
  );

  for (let i = peakDay; i < dailyMetrics.length - 2; i++) {
    const cur = dailyMetrics[i].conversions;
    const next1 = dailyMetrics[i + 1].conversions;
    const next2 = dailyMetrics[i + 2].conversions;

    const delta1 = Math.abs((next1 - cur) / Math.max(1, cur));
    const delta2 = Math.abs((next2 - next1) / Math.max(1, next1));

    if (delta1 < 0.08 && delta2 < 0.08) {
      plateauInceptionDay = dailyMetrics[i].day;
      break;
    }
  }

  // 3. Detect Significant Conversion Dips (>= 20% decline day-over-day)
  let maxDipDay: number | null = null;
  let maxDipPercentage = 0;

  for (let i = 1; i < dailyMetrics.length; i++) {
    const prevConv = dailyMetrics[i - 1].conversions;
    const curConv = dailyMetrics[i].conversions;
    if (prevConv > 0) {
      const dropPct = ((prevConv - curConv) / prevConv) * 100;
      if (dropPct >= 20 && dropPct > maxDipPercentage) {
        maxDipPercentage = Math.round(dropPct);
        maxDipDay = dailyMetrics[i].day;
      }
    }
  }

  if (maxDipDay !== null && maxDipPercentage >= 20) {
    const isWeekend = maxDipDay % 7 === 0 || maxDipDay % 7 === 6;
    alerts.push({
      id: `dip-${maxDipDay}`,
      type: 'dip',
      severity: maxDipPercentage >= 30 ? 'critical' : 'warning',
      title: `Significant Conversion Velocity Dip on Day ${maxDipDay}`,
      triggerDay: maxDipDay,
      triggerMetric: 'Day-over-Day Conversions',
      triggerMetricValue: `-${maxDipPercentage}% drop`,
      rootCause: isWeekend
        ? 'Cyclical weekend consumer purchase dip and inventory supply re-allocation across ad exchanges.'
        : 'Auction clearing price spike or momentary CTR drop resulting in fewer landing page arrivals for fixed daily spend.',
      educationalExplanation:
        'In digital advertising, sudden dips are commonly caused by exchange auction volatility, weekend behavioral shifts, or sudden spikes in competitor bid density.',
      prescribedAction:
        'Enable Dayparting / Weekend bidding adjustments or smooth daily pacing with automated Target CPA rules.',
      optimizationTarget: 'bidding',
    });
  }

  // 4. Detect Audience Ad Fatigue / Saturation Plateau
  const totalDays = dailyMetrics.length;
  const lateFlightDays = dailyMetrics.slice(plateauInceptionDay - 1);
  const avgLateConversions =
    lateFlightDays.reduce((s, d) => s + d.conversions, 0) / Math.max(1, lateFlightDays.length);
  const earlyFlightDays = dailyMetrics.slice(0, plateauInceptionDay - 1);
  const avgEarlyConversions =
    earlyFlightDays.reduce((s, d) => s + d.conversions, 0) / Math.max(1, earlyFlightDays.length);

  const lateFlightDelta = Math.round(
    ((avgLateConversions - avgEarlyConversions) / Math.max(1, avgEarlyConversions)) * 100
  );

  if (plateauInceptionDay < totalDays) {
    alerts.push({
      id: `plateau-${plateauInceptionDay}`,
      type: 'ad_fatigue',
      severity: 'warning',
      title: `Growth Plateau & Ad Fatigue Detected from Day ${plateauInceptionDay}`,
      triggerDay: plateauInceptionDay,
      triggerMetric: 'Marginal Conversion Momentum',
      triggerMetricValue: `${lateFlightDelta >= 0 ? '+' : ''}${lateFlightDelta}% growth`,
      rootCause: `Audience frequency surpassed optimal saturation threshold (estimated 3.5x+ exposures), causing creative banner blindness among targeted ${campaign.geography.join('/')} cohorts.`,
      educationalExplanation:
        'The Law of Diminishing Returns: As campaign flights continue without creative rotation, the most responsive consumers convert early. Subsequent impressions re-expose the same users repeatedly, causing CTR to stagnate and CPA to rise.',
      prescribedAction:
        'Implement Creative Rotation (switch primary traffic to Variant B), broaden demographic/geo filters, or lower the frequency cap from 3 to 2.',
      optimizationTarget: 'creative',
    });
  }

  // 5. Detect Pacing Constraints (Budget Exhaustion Risk or Underspend)
  const totalSpend = dailyMetrics.reduce((s, d) => s + d.spend, 0);
  const pacingRatio = totalSpend / Math.max(1, campaign.totalBudget);

  if (pacingRatio >= 1.02) {
    alerts.push({
      id: 'pacing-fast',
      type: 'pacing_constraint',
      severity: 'info',
      title: 'Aggressive Delivery Pacing (Budget Depletion)',
      triggerDay: Math.round(totalDays * 0.9),
      triggerMetric: 'Budget Pacing',
      triggerMetricValue: `${Math.round(pacingRatio * 100)}% consumed`,
      rootCause:
        'High win-rate in programmatic RTB auctions accelerated impression delivery faster than standard linear pacing.',
      educationalExplanation:
        'When bid caps are set high relative to market clearing CPM, DSP algorithms consume daily budget early in the morning/flight, leaving no capital for high-converting evening hours.',
      prescribedAction:
        'Apply dayparting constraints or lower the Max Bid Cap by 15–20% in the Bidding Strategy panel.',
      optimizationTarget: 'bidding',
    });
  }

  // 6. Overall Momentum Evaluation
  let momentumScore = 75;
  if (lateFlightDelta < -15) momentumScore = 48;
  else if (lateFlightDelta < -5) momentumScore = 62;
  else if (lateFlightDelta > 15) momentumScore = 90;

  let momentumStatus: 'Strong Acceleration' | 'Stabilized Plateau' | 'Velocity Deceleration' | 'Severe Drop' =
    'Stabilized Plateau';
  if (momentumScore >= 85) momentumStatus = 'Strong Acceleration';
  else if (momentumScore >= 65) momentumStatus = 'Stabilized Plateau';
  else if (momentumScore >= 50) momentumStatus = 'Velocity Deceleration';
  else momentumStatus = 'Severe Drop';

  return {
    alerts,
    peakDay,
    peakConversions,
    plateauInceptionDay,
    momentumScore,
    momentumStatus,
  };
}
