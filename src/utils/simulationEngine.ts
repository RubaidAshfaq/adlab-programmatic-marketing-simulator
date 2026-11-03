/**
 * ADLAB - Deterministic Educational Simulation Engine
 * Computes realistic programmatic advertising metrics, RTB auctions,
 * A/B testing statistical outcomes, and campaign effectiveness scores.
 */

import {
  CampaignConfig,
  SimulationResult,
  RtbAuctionEvent,
  DailySimulationMetric,
  BreakdownItem,
  EffectivenessScoreBreakdown,
  CampaignDiagnostics,
  InstructorSettings,
  PlatformName,
} from '../types/campaign';

// Simple seeded PRNG (xorshift) for realistic, reproducible variation
class SeededRandom {
  private seed: number;

  constructor(seed: number = 1337) {
    this.seed = seed;
  }

  next(): number {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return (Math.abs(this.seed) % 100000) / 100000;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Average order value estimates by industry (in INR ₹)
export const INDUSTRY_AOV: Record<string, number> = {
  FMCG: 450,
  Automotive: 28000,
  Fashion: 1850,
  Technology: 14500,
  Entertainment: 650,
  'Food & Beverage': 420,
  'E-commerce': 2100,
  Travel: 8500,
  Finance: 6000,
  Education: 4800,
  Healthcare: 1950,
  Retail: 1600,
};

// Baseline platform benchmark costs & conversion traits
export const PLATFORM_BENCHMARKS: Record<
  PlatformName,
  { baseCpm: number; baseCtr: number; baseCvr: number; viewability: number; videoComp: number }
> = {
  'Google Display': { baseCpm: 42, baseCtr: 0.0075, baseCvr: 0.022, viewability: 0.68, videoComp: 0.35 },
  YouTube: { baseCpm: 175, baseCtr: 0.014, baseCvr: 0.019, viewability: 0.88, videoComp: 0.76 },
  Meta: { baseCpm: 110, baseCtr: 0.0135, baseCvr: 0.028, viewability: 0.78, videoComp: 0.42 },
  Instagram: { baseCpm: 135, baseCtr: 0.0165, baseCvr: 0.031, viewability: 0.84, videoComp: 0.58 },
  'Connected TV': { baseCpm: 340, baseCtr: 0.0045, baseCvr: 0.009, viewability: 0.94, videoComp: 0.88 },
  'Mobile Apps': { baseCpm: 55, baseCtr: 0.011, baseCvr: 0.024, viewability: 0.72, videoComp: 0.5 },
  'News Websites': { baseCpm: 68, baseCtr: 0.0065, baseCvr: 0.018, viewability: 0.74, videoComp: 0.4 },
  OTT: { baseCpm: 260, baseCtr: 0.0085, baseCvr: 0.014, viewability: 0.92, videoComp: 0.82 },
  'Programmatic Display': { baseCpm: 38, baseCtr: 0.0055, baseCvr: 0.016, viewability: 0.65, videoComp: 0.3 },
  'Programmatic Video': { baseCpm: 190, baseCtr: 0.0125, baseCvr: 0.021, viewability: 0.85, videoComp: 0.72 },
  'Native Advertising': { baseCpm: 80, baseCtr: 0.0115, baseCvr: 0.023, viewability: 0.75, videoComp: 0.45 },
};

/**
 * Calculates estimated addressable audience size based on demographic & location filters
 */
export function calculateAudienceSize(config: CampaignConfig): {
  estimatedReach: number;
  relevanceIndex: number;
  marketSharePct: number;
} {
  // Baseline reachable population in target regions (thousands)
  let baseGeoPop = 0;
  const geoMap: Record<string, number> = {
    India: 480_000_000,
    'North India': 140_000_000,
    'Delhi NCR': 28_000_000,
    Mumbai: 24_000_000,
    Bangalore: 16_000_000,
    Hyderabad: 13_000_000,
    Kolkata: 15_000_000,
    Chennai: 12_000_000,
  };

  if (config.geography.includes('India')) {
    baseGeoPop = geoMap.India;
  } else {
    config.geography.forEach((loc) => {
      baseGeoPop += geoMap[loc] || 10_000_000;
    });
  }

  // Age group factor
  const ageFactors: Record<string, number> = {
    '18–24': 0.28,
    '25–34': 0.32,
    '35–44': 0.21,
    '45–54': 0.12,
    '55+': 0.07,
  };
  let ageFraction = 0;
  config.demographics.ages.forEach((age) => {
    ageFraction += ageFactors[age] || 0.2;
  });
  if (ageFraction === 0) ageFraction = 1.0;

  // Gender factor
  const genderFraction = config.demographics.gender === 'All' ? 1.0 : 0.5;

  // Interest & behavior targeting specificity (more targeting = higher relevance, smaller reach)
  const interestCount = Math.max(1, config.interests.length);
  const behaviorCount = Math.max(1, config.behaviors.length);
  const targetingPenetration = Math.max(0.08, 0.65 - (interestCount * 0.04 + behaviorCount * 0.05));

  // Device factor
  const deviceFactor = Math.min(1.0, config.devices.length * 0.35);

  const estimatedReach = Math.round(
    baseGeoPop * ageFraction * genderFraction * targetingPenetration * deviceFactor
  );

  // Audience relevance index (0.65 to 1.35)
  const relevanceIndex = Math.min(
    1.4,
    0.75 + (interestCount * 0.06) + (behaviorCount * 0.07) + (config.devices.includes('Mobile') ? 0.08 : 0)
  );

  const marketSharePct = Math.min(100, Math.max(1, (estimatedReach / 480_000_000) * 100));

  return { estimatedReach, relevanceIndex, marketSharePct };
}

/**
 * Generates an educational Real-Time Bidding auction event
 */
export function simulateSingleRtbAuction(
  config: CampaignConfig,
  customSeed?: number
): RtbAuctionEvent {
  const rng = new SeededRandom(customSeed || Date.now() + Math.floor(Math.random() * 10000));

  const sampleUsers = [
    { age: '24', location: 'Delhi NCR', device: 'Mobile', interest: 'Technology', intent: 'High' as const },
    { age: '29', location: 'Mumbai', device: 'Mobile', interest: 'Fashion & E-comm', intent: 'High' as const },
    { age: '35', location: 'Bangalore', device: 'Desktop', interest: 'Automotive & Travel', intent: 'Medium' as const },
    { age: '21', location: 'Hyderabad', device: 'Mobile', interest: 'Gaming & Entertainment', intent: 'Medium' as const },
    { age: '42', location: 'Kolkata', device: 'Connected TV', interest: 'News & Finance', intent: 'Low' as const },
  ];
  const user = sampleUsers[Math.floor(rng.range(0, sampleUsers.length))];

  // Select platform from student config
  const activePlatforms = config.platforms.filter((p) => p.percentage > 0);
  const platform = activePlatforms.length > 0 
    ? activePlatforms[Math.floor(rng.range(0, activePlatforms.length))].platform 
    : 'Google Display';
  
  const format = config.inventoryTypes[Math.floor(rng.range(0, config.inventoryTypes.length))] || 'Banner';
  const platformBenchmark = PLATFORM_BENCHMARKS[platform] || PLATFORM_BENCHMARKS['Google Display'];

  // Calculate Student Campaign bid parameters
  const studentBidCpm = Math.max(1.5, config.maxBid || platformBenchmark.baseCpm * 1.1);
  
  // Audience Match calculation
  const matchesInterest = config.interests.some((i) =>
    user.interest.toLowerCase().includes(i.toLowerCase())
  );
  const matchesGeo = config.geography.includes('India') || config.geography.includes(user.location);
  const studentAudienceMatch = (matchesInterest ? 0.45 : 0.2) + (matchesGeo ? 0.35 : 0.15) + (user.intent === 'High' ? 0.18 : 0.08);

  const studentQualityScore = 0.72 + rng.range(0.05, 0.22);
  const studentViewability = platformBenchmark.viewability + rng.range(-0.06, 0.06);

  // Auction Scoring: Bid × Audience Match × Quality × Viewability
  const studentScore = (studentBidCpm / 100) * studentAudienceMatch * studentQualityScore * studentViewability;

  // Competing Bidders
  const competitors = [
    {
      name: 'OmniAd Exchange (Competitor A)',
      isStudent: false,
      bidCpm: Number((platformBenchmark.baseCpm * rng.range(0.85, 1.25)).toFixed(2)),
      audienceMatch: Number(rng.range(0.65, 0.9).toFixed(2)),
      qualityScore: Number(rng.range(0.7, 0.88).toFixed(2)),
      viewability: Number(rng.range(0.68, 0.85).toFixed(2)),
    },
    {
      name: 'Apex Media DSP (Competitor B)',
      isStudent: false,
      bidCpm: Number((platformBenchmark.baseCpm * rng.range(0.9, 1.4)).toFixed(2)),
      audienceMatch: Number(rng.range(0.55, 0.85).toFixed(2)),
      qualityScore: Number(rng.range(0.75, 0.92).toFixed(2)),
      viewability: Number(rng.range(0.72, 0.9).toFixed(2)),
    },
    {
      name: 'Pulse Network (Competitor C)',
      isStudent: false,
      bidCpm: Number((platformBenchmark.baseCpm * rng.range(0.75, 1.15)).toFixed(2)),
      audienceMatch: Number(rng.range(0.6, 0.82).toFixed(2)),
      qualityScore: Number(rng.range(0.68, 0.84).toFixed(2)),
      viewability: Number(rng.range(0.65, 0.82).toFixed(2)),
    },
  ];

  const allBidders = [
    {
      name: `${config.brand || 'Student Campaign'} (Your DSP Bid)`,
      isStudent: true,
      bidCpm: Number(studentBidCpm.toFixed(2)),
      audienceMatch: Number(studentAudienceMatch.toFixed(2)),
      qualityScore: Number(studentQualityScore.toFixed(2)),
      viewability: Number(studentViewability.toFixed(2)),
      finalAuctionScore: Number(studentScore.toFixed(4)),
    },
    ...competitors.map((c) => ({
      ...c,
      finalAuctionScore: Number(((c.bidCpm / 100) * c.audienceMatch * c.qualityScore * c.viewability).toFixed(4)),
    })),
  ];

  // Sort descending by finalAuctionScore
  allBidders.sort((a, b) => b.finalAuctionScore - a.finalAuctionScore);

  const winner = allBidders[0];
  const runnerUp = allBidders[1];
  
  // Second-price educational clearing price calculation:
  // Clearing CPM is approximately the minimum CPM to match runnerUp's score + 0.01 CPM
  const denominator = Math.max(0.1, winner.audienceMatch * winner.qualityScore * winner.viewability);
  const clearingPriceCpm = Number(
    Math.max(
      winner.bidCpm * 0.7,
      Math.min(winner.bidCpm, (runnerUp.finalAuctionScore / denominator) * 100 + 0.05)
    ).toFixed(2)
  );

  return {
    id: `RTB-${Math.floor(rng.range(100000, 999999))}`,
    timestamp: new Date().toLocaleTimeString(),
    userProfile: {
      age: user.age,
      location: user.location,
      device: user.device,
      interest: user.interest,
      intentLevel: user.intent,
    },
    inventoryContext: {
      platform,
      format,
      viewabilityScore: Number(platformBenchmark.viewability.toFixed(2)),
      qualityScore: Number(studentQualityScore.toFixed(2)),
    },
    bidders: allBidders,
    winner: winner.name,
    winningBidCpm: winner.bidCpm,
    clearingPriceCpm,
    studentWon: winner.isStudent,
  };
}

/**
 * Runs the deterministic full campaign simulation
 */
export function runFullCampaignSimulation(
  config: CampaignConfig,
  instructorSettings?: InstructorSettings,
  seed = 42
): SimulationResult {
  const rng = new SeededRandom(seed);
  const duration = Math.max(1, config.durationDays || 30);
  const totalBudget = Math.max(1000, config.totalBudget || 50000);
  const dailyBudget = totalBudget / duration;

  const { estimatedReach, relevanceIndex } = calculateAudienceSize(config);

  // Calculate weighted platform benchmarks based on budget allocations
  let weightedBaseCpm = 0;
  let weightedBaseCtr = 0;
  let weightedBaseCvr = 0;
  let weightedViewability = 0;
  let weightedVideoComp = 0;
  let totalAllocatedPct = 0;

  config.platforms.forEach((p) => {
    if (p.percentage > 0) {
      const bm = PLATFORM_BENCHMARKS[p.platform] || PLATFORM_BENCHMARKS['Google Display'];
      weightedBaseCpm += bm.baseCpm * (p.percentage / 100);
      weightedBaseCtr += bm.baseCtr * (p.percentage / 100);
      weightedBaseCvr += bm.baseCvr * (p.percentage / 100);
      weightedViewability += bm.viewability * (p.percentage / 100);
      weightedVideoComp += bm.videoComp * (p.percentage / 100);
      totalAllocatedPct += p.percentage;
    }
  });

  if (totalAllocatedPct === 0) {
    weightedBaseCpm = 65;
    weightedBaseCtr = 0.01;
    weightedBaseCvr = 0.02;
    weightedViewability = 0.75;
    weightedVideoComp = 0.5;
  }

  // Objective multipliers
  let objectiveCtrBoost = 1.0;
  let objectiveCvrBoost = 1.0;
  let objectiveCpmDiscount = 1.0;

  switch (config.objective) {
    case 'Brand Awareness':
    case 'Reach':
      objectiveCpmDiscount = 0.85; // Cheaper CPM reach
      objectiveCtrBoost = 0.9;
      objectiveCvrBoost = 0.75;
      break;
    case 'Traffic':
    case 'Website Visits':
      objectiveCtrBoost = 1.35;
      objectiveCvrBoost = 0.95;
      break;
    case 'Conversions':
    case 'Sales':
      objectiveCvrBoost = 1.45;
      objectiveCtrBoost = 1.15;
      objectiveCpmDiscount = 1.15; // Higher CPM for high-intent inventory
      break;
    case 'App Installation':
      objectiveCtrBoost = 1.25;
      objectiveCvrBoost = 1.3;
      break;
    case 'Video Views':
      weightedVideoComp = Math.min(0.95, weightedVideoComp * 1.35);
      objectiveCtrBoost = 1.1;
      break;
    default:
      break;
  }

  // Creative synergy
  // Variant B has slightly different effectiveness based on copy/CTA
  const creativeAQuality = 1.0 + (config.creativeA.cta === 'SHOP NOW' || config.creativeA.cta === 'DOWNLOAD' ? 0.08 : 0.03);
  const creativeBQuality = 1.12 + (config.creativeB.cta === 'SHOP NOW' || config.creativeB.cta === 'SIGN UP' ? 0.12 : 0.05);

  // Traffic split ratios
  const splitRatios: Record<string, [number, number]> = {
    '50/50': [0.5, 0.5],
    '60/40': [0.6, 0.4],
    '70/30': [0.7, 0.3],
    '80/20': [0.8, 0.2],
  };
  const [splitA, splitB] = splitRatios[config.trafficSplit] || [0.5, 0.5];

  // Industry AOV
  const aov = INDUSTRY_AOV[config.industry] || 2500;

  // Day-by-day generation
  const dailyMetrics: DailySimulationMetric[] = [];
  let cumSpend = 0;
  let cumImpressions = 0;
  let cumClicks = 0;
  let cumConversions = 0;
  let cumRevenue = 0;

  let cumVarAImpressions = 0;
  let cumVarAClicks = 0;
  let cumVarAConversions = 0;
  let cumVarASpend = 0;

  let cumVarBImpressions = 0;
  let cumVarBClicks = 0;
  let cumVarBConversions = 0;
  let cumVarBSpend = 0;

  for (let day = 1; day <= duration; day++) {
    // Pacing curve: campaigns often start slightly lower then normalize, with weekend spikes
    const dayOfWeek = (day % 7);
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.15 : 0.96;
    const rampMultiplier = day <= 3 ? 0.75 + day * 0.08 : 1.0;
    const dailyPacing = dailyBudget * weekendMultiplier * rampMultiplier * rng.range(0.94, 1.06);
    
    // Effective CPM for the day
    const effectiveCpm = Math.max(12, weightedBaseCpm * objectiveCpmDiscount * rng.range(0.95, 1.05));
    const dayImpressions = Math.round((dailyPacing / effectiveCpm) * 1000);

    // Frequency effect over time
    const cumEstimatedReach = Math.min(estimatedReach, Math.round(cumImpressions / Math.max(1, 1 + (cumImpressions / estimatedReach) * 2.5)));
    const dayFrequency = (cumImpressions + dayImpressions) / Math.max(1, cumEstimatedReach || 1000);
    const fatigueFactor = dayFrequency > 4.5 ? 0.88 : (dayFrequency > 3.0 ? 0.95 : 1.02);

    // Daily CTR & Clicks
    const baseCtr = weightedBaseCtr * relevanceIndex * fatigueFactor * objectiveCtrBoost;
    
    // Variant A & Variant B split
    const dayImpA = Math.round(dayImpressions * splitA);
    const dayImpB = Math.round(dayImpressions * splitB);

    const ctrA = baseCtr * creativeAQuality * rng.range(0.96, 1.04);
    const ctrB = baseCtr * creativeBQuality * rng.range(0.97, 1.05);

    const clicksA = Math.round(dayImpA * ctrA);
    const clicksB = Math.round(dayImpB * ctrB);
    const dayClicks = clicksA + clicksB;

    // Daily CVR & Conversions
    const baseCvr = weightedBaseCvr * relevanceIndex * objectiveCvrBoost;
    const cvrA = baseCvr * 0.95 * rng.range(0.94, 1.06);
    const cvrB = baseCvr * 1.18 * rng.range(0.95, 1.07);

    const convA = Math.round(clicksA * cvrA);
    const convB = Math.round(clicksB * cvrB);
    const dayConversions = convA + convB;

    const dayRevenue = dayConversions * aov * rng.range(0.9, 1.1);

    const spendA = dailyPacing * splitA;
    const spendB = dailyPacing * splitB;

    cumSpend += dailyPacing;
    cumImpressions += dayImpressions;
    cumClicks += dayClicks;
    cumConversions += dayConversions;
    cumRevenue += dayRevenue;

    cumVarAImpressions += dayImpA;
    cumVarAClicks += clicksA;
    cumVarAConversions += convA;
    cumVarASpend += spendA;

    cumVarBImpressions += dayImpB;
    cumVarBClicks += clicksB;
    cumVarBConversions += convB;
    cumVarBSpend += spendB;

    const dateStr = `Day ${day}`;

    dailyMetrics.push({
      day,
      date: dateStr,
      spend: Math.round(dailyPacing),
      impressions: dayImpressions,
      reach: Math.round(cumEstimatedReach * (day / duration)),
      clicks: dayClicks,
      conversions: dayConversions,
      revenue: Math.round(dayRevenue),
      ctr: Number(((dayClicks / Math.max(1, dayImpressions)) * 100).toFixed(2)),
      cpc: Number((dailyPacing / Math.max(1, dayClicks)).toFixed(2)),
      cpm: Number(((dailyPacing / Math.max(1, dayImpressions)) * 1000).toFixed(2)),
      cpa: Number((dailyPacing / Math.max(1, dayConversions)).toFixed(2)),
      roas: Number((dayRevenue / Math.max(1, dailyPacing)).toFixed(2)),
      variantA: {
        impressions: dayImpA,
        clicks: clicksA,
        conversions: convA,
        spend: Math.round(spendA),
      },
      variantB: {
        impressions: dayImpB,
        clicks: clicksB,
        conversions: convB,
        spend: Math.round(spendB),
      },
    });
  }

  // Summary Totals
  const totalImpressions = cumImpressions;
  const totalClicks = cumClicks;
  const totalConversions = cumConversions;
  const totalSpend = cumSpend;
  const totalRevenue = cumRevenue;

  const totalReach = Math.min(
    estimatedReach,
    Math.round(totalImpressions / (1 + (totalImpressions / Math.max(1, estimatedReach)) * 1.8))
  );
  const frequency = Number((totalImpressions / Math.max(1, totalReach)).toFixed(2));
  const overallCtr = Number(((totalClicks / Math.max(1, totalImpressions)) * 100).toFixed(2));
  const overallCpc = Number((totalSpend / Math.max(1, totalClicks)).toFixed(2));
  const overallCpm = Number(((totalSpend / Math.max(1, totalImpressions)) * 1000).toFixed(2));
  const overallCvr = Number(((totalConversions / Math.max(1, totalClicks)) * 100).toFixed(2));
  const overallCpa = Number((totalSpend / Math.max(1, totalConversions)).toFixed(2));
  const overallRoas = Number((totalRevenue / Math.max(1, totalSpend)).toFixed(2));

  // A/B test analysis
  const ctrVarA = (cumVarAClicks / Math.max(1, cumVarAImpressions)) * 100;
  const ctrVarB = (cumVarBClicks / Math.max(1, cumVarBImpressions)) * 100;
  const cvrVarA = (cumVarAConversions / Math.max(1, cumVarAClicks)) * 100;
  const cvrVarB = (cumVarBConversions / Math.max(1, cumVarBClicks)) * 100;
  const revVarA = cumVarAConversions * aov;
  const revVarB = cumVarBConversions * aov;
  const roasVarA = revVarA / Math.max(1, cumVarASpend);
  const roasVarB = revVarB / Math.max(1, cumVarBSpend);

  // Simplified educational statistical confidence calculation
  const totalAbSamples = cumVarAClicks + cumVarBClicks;
  const differencePct = Math.abs(ctrVarB - ctrVarA) / Math.max(0.01, ctrVarA);
  let confidenceScore = Math.min(99, Math.round(65 + differencePct * 80 + Math.min(25, totalAbSamples / 150)));
  if (totalAbSamples < 100) confidenceScore = Math.min(70, confidenceScore);

  let winningVariant: 'Variant A' | 'Variant B' | 'Inconclusive' = 'Inconclusive';
  let winningReason = 'Sample size too small to declare statistically confident difference.';

  if (confidenceScore >= 80) {
    if (roasVarB > roasVarA && ctrVarB > ctrVarA) {
      winningVariant = 'Variant B';
      winningReason = `Variant B delivered a ${(ctrVarB - ctrVarA).toFixed(2)}% higher CTR and superior ROAS (${roasVarB.toFixed(2)}x vs ${roasVarA.toFixed(2)}x), driven by more persuasive value framing and clear CTA.`;
    } else if (roasVarA > roasVarB && ctrVarA > ctrVarB) {
      winningVariant = 'Variant A';
      winningReason = `Variant A yielded higher conversion efficiency (${roasVarA.toFixed(2)}x ROAS) with lower CPA.`;
    } else {
      winningVariant = 'Variant B';
      winningReason = `Variant B outperformed on user engagement and conversion rate despite slightly higher cost per click.`;
    }
  }

  // Platform Breakdown items
  const platformBreakdown: BreakdownItem[] = config.platforms
    .filter((p) => p.percentage > 0)
    .map((p) => {
      const pShare = p.percentage / 100;
      const pSpend = Math.round(totalSpend * pShare);
      const pBenchmark = PLATFORM_BENCHMARKS[p.platform] || PLATFORM_BENCHMARKS['Google Display'];
      const pImp = Math.round((pSpend / (pBenchmark.baseCpm * objectiveCpmDiscount)) * 1000);
      const pClicks = Math.round(pImp * pBenchmark.baseCtr * objectiveCtrBoost * relevanceIndex);
      const pConv = Math.round(pClicks * pBenchmark.baseCvr * objectiveCvrBoost);
      const pRev = pConv * aov;

      return {
        name: p.platform,
        impressions: pImp,
        clicks: pClicks,
        conversions: pConv,
        spend: pSpend,
        ctr: Number(((pClicks / Math.max(1, pImp)) * 100).toFixed(2)),
        cpc: Number((pSpend / Math.max(1, pClicks)).toFixed(2)),
        cpa: Number((pSpend / Math.max(1, pConv)).toFixed(2)),
        roas: Number((pRev / Math.max(1, pSpend)).toFixed(2)),
      };
    });

  // Device Breakdown items
  const deviceBreakdown: BreakdownItem[] = config.devices.map((dev, idx) => {
    const devShares: Record<string, number> = {
      Mobile: 0.65,
      Desktop: 0.22,
      Tablet: 0.05,
      'Connected TV': 0.08,
    };
    const dShare = devShares[dev] || 1 / config.devices.length;
    const dSpend = Math.round(totalSpend * dShare);
    const dImp = Math.round(totalImpressions * dShare);
    const dCtrMultiplier = dev === 'Mobile' ? 1.15 : (dev === 'Connected TV' ? 0.65 : 0.95);
    const dClicks = Math.round(totalClicks * dShare * dCtrMultiplier);
    const dConv = Math.round(totalConversions * dShare * (dev === 'Mobile' ? 1.05 : 0.95));
    const dRev = dConv * aov;

    return {
      name: dev,
      impressions: dImp,
      clicks: dClicks,
      conversions: dConv,
      spend: dSpend,
      ctr: Number(((dClicks / Math.max(1, dImp)) * 100).toFixed(2)),
      cpc: Number((dSpend / Math.max(1, dClicks)).toFixed(2)),
      cpa: Number((dSpend / Math.max(1, dConv)).toFixed(2)),
      roas: Number((dRev / Math.max(1, dSpend)).toFixed(2)),
    };
  });

  // Demographic Breakdown
  const demographicBreakdown: BreakdownItem[] = config.demographics.ages.map((ageGroup) => {
    const ageShares: Record<string, number> = {
      '18–24': 0.35,
      '25–34': 0.38,
      '35–44': 0.18,
      '45–54': 0.06,
      '55+': 0.03,
    };
    const share = ageShares[ageGroup] || 0.2;
    const dSpend = Math.round(totalSpend * share);
    const dImp = Math.round(totalImpressions * share);
    const dClicks = Math.round(totalClicks * share * (ageGroup === '18–24' || ageGroup === '25–34' ? 1.12 : 0.88));
    const dConv = Math.round(totalConversions * share * (ageGroup === '25–34' ? 1.25 : 0.9));
    const dRev = dConv * aov;

    return {
      name: ageGroup,
      impressions: dImp,
      clicks: dClicks,
      conversions: dConv,
      spend: dSpend,
      ctr: Number(((dClicks / Math.max(1, dImp)) * 100).toFixed(2)),
      cpc: Number((dSpend / Math.max(1, dClicks)).toFixed(2)),
      cpa: Number((dSpend / Math.max(1, dConv)).toFixed(2)),
      roas: Number((dRev / Math.max(1, dSpend)).toFixed(2)),
    };
  });

  // Generate 8 sample RTB auctions for the log
  const recentAuctions: RtbAuctionEvent[] = [];
  let wonCount = 0;
  for (let i = 0; i < 8; i++) {
    const auction = simulateSingleRtbAuction(config, seed + i * 97);
    recentAuctions.push(auction);
    if (auction.studentWon) wonCount++;
  }

  // Calculate Effectiveness Score (0 to 100)
  const effectiveness = calculateEffectivenessScore({
    ctr: overallCtr,
    cpc: overallCpc,
    cpa: overallCpa,
    roas: overallRoas,
    viewabilityPct: Math.round(weightedViewability * 100),
    frequency,
    objective: config.objective,
    confidenceScore,
    budgetSpentPct: Math.min(100, Math.round((cumSpend / totalBudget) * 100)),
    relevanceIndex,
  });

  // Generate Diagnostics from actual simulated outcomes
  const diagnostics = generateDiagnostics({
    overallCtr,
    overallRoas,
    overallCpa,
    platformBreakdown,
    deviceBreakdown,
    demographicBreakdown,
    winningVariant,
    variantA: { ctr: ctrVarA, roas: roasVarA },
    variantB: { ctr: ctrVarB, roas: roasVarB },
  });

  return {
    campaignId: config.id,
    simulatedAt: new Date().toISOString(),
    status: 'completed',
    progressDay: duration,
    totalDays: duration,

    totalSpend: Math.round(totalSpend),
    totalBudget,
    budgetPacingPct: Math.round((totalSpend / totalBudget) * 100),
    impressions: totalImpressions,
    reach: totalReach,
    frequency,
    viewabilityPct: Math.round(weightedViewability * 100),
    videoCompletionPct: Math.round(weightedVideoComp * 100),
    clicks: totalClicks,
    ctr: overallCtr,
    cpc: overallCpc,
    cpm: overallCpm,
    conversions: totalConversions,
    conversionRate: overallCvr,
    cpa: overallCpa,
    revenue: Math.round(totalRevenue),
    roas: overallRoas,
    avgOrderValue: aov,

    abResults: {
      variantA: {
        impressions: cumVarAImpressions,
        clicks: cumVarAClicks,
        ctr: Number(ctrVarA.toFixed(2)),
        cpc: Number((cumVarASpend / Math.max(1, cumVarAClicks)).toFixed(2)),
        conversions: cumVarAConversions,
        cvr: Number(cvrVarA.toFixed(2)),
        cpa: Number((cumVarASpend / Math.max(1, cumVarAConversions)).toFixed(2)),
        revenue: Math.round(revVarA),
        roas: Number(roasVarA.toFixed(2)),
      },
      variantB: {
        impressions: cumVarBImpressions,
        clicks: cumVarBClicks,
        ctr: Number(ctrVarB.toFixed(2)),
        cpc: Number((cumVarBSpend / Math.max(1, cumVarBClicks)).toFixed(2)),
        conversions: cumVarBConversions,
        cvr: Number(cvrVarB.toFixed(2)),
        cpa: Number((cumVarBSpend / Math.max(1, cumVarBConversions)).toFixed(2)),
        revenue: Math.round(revVarB),
        roas: Number(roasVarB.toFixed(2)),
      },
      confidenceScore,
      winningVariant,
      reason: winningReason,
    },

    platformBreakdown,
    deviceBreakdown,
    demographicBreakdown,
    dailyMetrics,
    recentAuctions,

    auctionSummary: {
      totalBidRequests: Math.round(totalImpressions * 1.45),
      impressionsWon: totalImpressions,
      impressionsLost: Math.round(totalImpressions * 0.45),
      winRate: Number(((totalImpressions / (totalImpressions * 1.45)) * 100).toFixed(1)),
      avgClearingPriceCpm: overallCpm,
    },

    effectiveness,
    diagnostics,
  };
}

/**
 * Deterministic scoring engine evaluating 7 strategic programmatic dimensions
 */
export function calculateEffectivenessScore(params: {
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  viewabilityPct: number;
  frequency: number;
  objective: string;
  confidenceScore: number;
  budgetSpentPct: number;
  relevanceIndex: number;
}): EffectivenessScoreBreakdown {
  // 1. Media Efficiency (0 - 20)
  // Evaluated on viewability, healthy frequency capping (2.0 to 4.0 is ideal), and delivery
  let mediaScore = 0;
  if (params.viewabilityPct >= 80) mediaScore += 10;
  else if (params.viewabilityPct >= 70) mediaScore += 8;
  else mediaScore += 5;

  if (params.frequency >= 2.0 && params.frequency <= 4.0) mediaScore += 10;
  else if (params.frequency < 2.0) mediaScore += 6; // under-exposed
  else mediaScore += 5; // ad fatigue

  // 2. Audience Performance (0 - 15)
  // Evaluated on targeting relevance index
  const audienceScore = Math.min(15, Math.round(params.relevanceIndex * 11));

  // 3. Creative Performance (0 - 15)
  // Evaluated on CTR benchmarks
  let creativeScore = 0;
  if (params.ctr >= 1.8) creativeScore = 15;
  else if (params.ctr >= 1.2) creativeScore = 12;
  else if (params.ctr >= 0.8) creativeScore = 9;
  else creativeScore = 6;

  // 4. Engagement (0 - 15)
  // Evaluated on CPC efficiency and CTR strength
  let engagementScore = 0;
  if (params.cpc <= 12) engagementScore += 8;
  else if (params.cpc <= 25) engagementScore += 6;
  else engagementScore += 4;

  if (params.ctr >= 1.0) engagementScore += 7;
  else engagementScore += 4;

  // 5. Conversion Performance (0 - 20)
  // Evaluated on ROAS and CPA
  let conversionScore = 0;
  if (params.roas >= 3.5) conversionScore += 12;
  else if (params.roas >= 2.2) conversionScore += 9;
  else if (params.roas >= 1.5) conversionScore += 7;
  else conversionScore += 4;

  if (params.cpa <= 350) conversionScore += 8;
  else if (params.cpa <= 750) conversionScore += 6;
  else conversionScore += 3;

  // 6. Budget Efficiency (0 - 10)
  // Pacing completeness
  let budgetScore = 0;
  if (params.budgetSpentPct >= 95 && params.budgetSpentPct <= 102) budgetScore = 10;
  else if (params.budgetSpentPct >= 85) budgetScore = 8;
  else budgetScore = 5;

  // 7. A/B Testing Performance (0 - 5)
  const abScore = Math.min(5, Math.max(1, Math.round((params.confidenceScore / 100) * 5)));

  const totalScore = Math.min(
    100,
    mediaScore + audienceScore + creativeScore + engagementScore + conversionScore + budgetScore + abScore
  );

  let rating: EffectivenessScoreBreakdown['rating'] = 'Moderate';
  if (totalScore >= 90) rating = 'Excellent';
  else if (totalScore >= 75) rating = 'Effective';
  else if (totalScore >= 60) rating = 'Moderate';
  else if (totalScore >= 40) rating = 'Needs Improvement';
  else rating = 'Poor';

  return {
    mediaEfficiency: mediaScore,
    audiencePerformance: audienceScore,
    creativePerformance: creativeScore,
    engagement: engagementScore,
    conversionPerformance: conversionScore,
    budgetEfficiency: budgetScore,
    abTestingPerformance: abScore,
    totalScore,
    rating,
  };
}

/**
 * Generates rule-based diagnostic insights from simulated outputs
 */
export function generateDiagnostics(data: {
  overallCtr: number;
  overallRoas: number;
  overallCpa: number;
  platformBreakdown: BreakdownItem[];
  deviceBreakdown: BreakdownItem[];
  demographicBreakdown: BreakdownItem[];
  winningVariant: string;
  variantA: { ctr: number; roas: number };
  variantB: { ctr: number; roas: number };
}): CampaignDiagnostics {
  // Mobile vs desktop analysis
  const mobileDev = data.deviceBreakdown.find((d) => d.name === 'Mobile');
  const desktopDev = data.deviceBreakdown.find((d) => d.name === 'Desktop');
  const topPlatform = [...data.platformBreakdown].sort((a, b) => b.roas - a.roas)[0];
  const lowestPlatform = [...data.platformBreakdown].sort((a, b) => a.roas - b.roas)[0];
  const topDemographic = [...data.demographicBreakdown].sort((a, b) => b.conversions - a.conversions)[0];

  const whatWorked = [
    mobileDev
      ? `Mobile devices generated ${Math.round((mobileDev.conversions / Math.max(1, data.deviceBreakdown.reduce((s, i) => s + i.conversions, 0))) * 100)}% of total conversions with a strong CTR of ${mobileDev.ctr}%.`
      : 'Target demographic showed high engagement with creative assets.',
    topPlatform
      ? `${topPlatform.name} delivered the highest return on ad spend at ${topPlatform.roas}x ROAS.`
      : 'Programmatic delivery achieved consistent bid win rates across exchanges.',
    data.winningVariant !== 'Inconclusive'
      ? `${data.winningVariant} validated the A/B hypothesis with a statistically stronger click-through rate.`
      : 'Creative variants gathered valuable baseline split response data.',
  ];

  const whatUnderperformed = [
    desktopDev && mobileDev && desktopDev.cpc > mobileDev.cpc
      ? `Desktop CPC was ₹${desktopDev.cpc}, roughly ${Math.round(((desktopDev.cpc - mobileDev.cpc) / mobileDev.cpc) * 100)}% higher than mobile CPC.`
      : 'Upper-funnel inventory experienced lower direct conversion efficiency.',
    lowestPlatform && lowestPlatform.name !== topPlatform?.name
      ? `${lowestPlatform.name} recorded an elevated CPA of ₹${lowestPlatform.cpa}, underperforming campaign target thresholds.`
      : 'Frequency capping allowed slight message fatigue near campaign conclusion.',
  ];

  const creativeDiff = Math.abs(data.variantB.ctr - data.variantA.ctr).toFixed(2);
  const creativeInsight =
    data.winningVariant === 'Variant B'
      ? `Variant B generated a ${creativeDiff}% higher CTR than Variant A. The direct benefit headline and immediate action CTA drove stronger intent.`
      : data.winningVariant === 'Variant A'
      ? `Variant A sustained higher conversion value with superior ROAS (${data.variantA.roas}x).`
      : 'Creative variants performed within a close margin; test a more distinct value proposition or high-contrast visual.';

  const audienceInsight = topDemographic
    ? `Users in the ${topDemographic.name} cohort accounted for the lion's share of conversions at ₹${topDemographic.cpa} CPA, signaling optimal product-market alignment.`
    : 'Audience interest targeting yielded high engagement across primary metropolitan centers.';

  const platformInsight = topPlatform && lowestPlatform
    ? `${topPlatform.name} excelled at direct conversion capture (${topPlatform.roas}x ROAS), while ${lowestPlatform.name} functioned primarily as an awareness driver (${lowestPlatform.impressions.toLocaleString()} impressions).`
    : 'Cross-platform inventory mix balanced top-of-funnel reach with bottom-of-funnel conversion capture.';

  const budgetInsight = lowestPlatform && topPlatform && lowestPlatform.name !== topPlatform.name
    ? `Shifting 15–20% of allocation from ${lowestPlatform.name} into ${topPlatform.name} could improve simulated aggregate ROAS by an estimated 14% to 22%.`
    : 'Budget allocation is well-paced; consider scaling total investment or tightening frequency caps.';

  return {
    whatWorked,
    whatUnderperformed,
    creativeInsight,
    audienceInsight,
    platformInsight,
    budgetInsight,
  };
}
