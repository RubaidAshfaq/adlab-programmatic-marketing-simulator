/**
 * Core type definitions for ADLAB - Data-Driven Advertising & Programmatic Marketing Simulator
 */

export type Industry =
  | 'FMCG'
  | 'Automotive'
  | 'Fashion'
  | 'Technology'
  | 'Entertainment'
  | 'Food & Beverage'
  | 'E-commerce'
  | 'Travel'
  | 'Finance'
  | 'Education'
  | 'Healthcare'
  | 'Retail';

export type CampaignObjective =
  | 'Brand Awareness'
  | 'Reach'
  | 'Video Views'
  | 'Traffic'
  | 'Engagement'
  | 'Lead Generation'
  | 'App Installation'
  | 'Sales'
  | 'Conversions'
  | 'Website Visits';

export type SecondaryKpi =
  | 'Reach'
  | 'Impressions'
  | 'CPM'
  | 'Frequency'
  | 'Clicks'
  | 'CTR'
  | 'CPC'
  | 'Conversions'
  | 'CVR'
  | 'CPA'
  | 'Revenue'
  | 'ROAS'
  | 'Video Completion Rate';

export type AgeGroup = '18–24' | '25–34' | '35–44' | '45–54' | '55+';
export type Gender = 'All' | 'Male' | 'Female';
export type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Connected TV';

export type PlatformName =
  | 'Google Display'
  | 'YouTube'
  | 'Meta'
  | 'Instagram'
  | 'Connected TV'
  | 'Mobile Apps'
  | 'News Websites'
  | 'OTT'
  | 'Programmatic Display'
  | 'Programmatic Video'
  | 'Native Advertising';

export type InventoryType =
  | 'Banner'
  | 'Native'
  | 'In-stream Video'
  | 'Out-stream Video'
  | 'Connected TV'
  | 'Rich Media';

export type BidStrategy =
  | 'CPM'
  | 'CPC'
  | 'CPA'
  | 'vCPM'
  | 'Maximize Clicks'
  | 'Maximize Conversions'
  | 'Target CPA';

export type CreativeFormat = 'Banner' | 'Video' | 'Native' | 'Social' | 'CTV';

export type ABTestVariable =
  | 'Headline'
  | 'Image'
  | 'CTA'
  | 'Offer'
  | 'Landing Page'
  | 'Audience'
  | 'Ad Format';

export type TrafficSplit = '50/50' | '60/40' | '70/30' | '80/20';

export interface AdCreative {
  id: string;
  headline: string;
  description: string;
  cta: string;
  format: CreativeFormat;
  visualTheme: string; // e.g., 'Modern Minimalist', 'Vibrant Dynamic', 'Bold Tech'
  imageUrl?: string;
  accentColor: string;
}

export interface PlatformAllocation {
  platform: PlatformName;
  percentage: number;
}

export interface CampaignConfig {
  id: string;
  name: string;
  brand: string;
  product: string;
  industry: Industry;
  isCustomBrand: boolean;
  
  objective: CampaignObjective;
  secondaryKpis: SecondaryKpi[];

  // Audience & Targeting
  demographics: {
    ages: AgeGroup[];
    gender: Gender;
  };
  geography: string[];
  interests: string[];
  behaviors: string[];
  devices: DeviceType[];
  frequencyCap: number; // e.g. 3 impressions per 24 hours

  // Media & Platforms
  platforms: PlatformAllocation[];
  inventoryTypes: InventoryType[];

  // Budget & Bidding
  totalBudget: number; // in INR ₹
  durationDays: number;
  bidStrategy: BidStrategy;
  maxBid: number; // in INR ₹

  // Creative & A/B testing
  creativeA: AdCreative;
  creativeB: AdCreative;
  abTestVariable: ABTestVariable;
  trafficSplit: TrafficSplit;
  
  // Creation metadata
  createdAt: string;
  isOptimizedVersion?: boolean;
  baseCampaignId?: string;
}

export interface DailySimulationMetric {
  day: number;
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
  variantA: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
  variantB: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

export interface BreakdownItem {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface RtbAuctionEvent {
  id: string;
  timestamp: string;
  userProfile: {
    age: string;
    location: string;
    device: string;
    interest: string;
    intentLevel: 'High' | 'Medium' | 'Low';
  };
  inventoryContext: {
    platform: PlatformName;
    format: InventoryType;
    viewabilityScore: number; // 0-1
    qualityScore: number; // 0-1
  };
  bidders: {
    name: string;
    isStudent: boolean;
    bidCpm: number;
    audienceMatch: number; // 0-1
    qualityScore: number; // 0-1
    viewability: number; // 0-1
    finalAuctionScore: number;
  }[];
  winner: string;
  winningBidCpm: number;
  clearingPriceCpm: number; // second price
  studentWon: boolean;
}

export interface EffectivenessScoreBreakdown {
  mediaEfficiency: number; // 0-20
  audiencePerformance: number; // 0-15
  creativePerformance: number; // 0-15
  engagement: number; // 0-15
  conversionPerformance: number; // 0-20
  budgetEfficiency: number; // 0-10
  abTestingPerformance: number; // 0-5
  totalScore: number; // 0-100
  rating: 'Poor' | 'Needs Improvement' | 'Moderate' | 'Effective' | 'Excellent';
}

export interface CampaignDiagnostics {
  whatWorked: string[];
  whatUnderperformed: string[];
  creativeInsight: string;
  audienceInsight: string;
  platformInsight: string;
  budgetInsight: string;
}

export interface SimulationResult {
  campaignId: string;
  simulatedAt: string;
  status: 'completed' | 'paused' | 'running' | 'idle';
  progressDay: number;
  totalDays: number;
  
  // Core Totals
  totalSpend: number;
  totalBudget: number;
  budgetPacingPct: number;
  impressions: number;
  reach: number;
  frequency: number;
  viewabilityPct: number;
  videoCompletionPct: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  conversionRate: number;
  cpa: number;
  revenue: number;
  roas: number;
  avgOrderValue: number;

  // A/B test totals
  abResults: {
    variantA: {
      impressions: number;
      clicks: number;
      ctr: number;
      cpc: number;
      conversions: number;
      cvr: number;
      cpa: number;
      revenue: number;
      roas: number;
    };
    variantB: {
      impressions: number;
      clicks: number;
      ctr: number;
      cpc: number;
      conversions: number;
      cvr: number;
      cpa: number;
      revenue: number;
      roas: number;
    };
    confidenceScore: number; // 0-100
    winningVariant: 'Variant A' | 'Variant B' | 'Inconclusive';
    reason: string;
  };

  // Breakdowns
  platformBreakdown: BreakdownItem[];
  deviceBreakdown: BreakdownItem[];
  demographicBreakdown: BreakdownItem[];

  // Time series
  dailyMetrics: DailySimulationMetric[];

  // RTB sample events
  recentAuctions: RtbAuctionEvent[];
  auctionSummary: {
    totalBidRequests: number;
    impressionsWon: number;
    impressionsLost: number;
    winRate: number;
    avgClearingPriceCpm: number;
  };

  // Effectiveness evaluation
  effectiveness: EffectivenessScoreBreakdown;
  diagnostics: CampaignDiagnostics;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  targetKpiDescription: string;
  targetMetricKey: 'reach' | 'roas' | 'ctr' | 'conversions' | 'videoCompletionPct';
  targetThreshold: number;
  recommendedDuration: number;
  presetCampaign: Partial<CampaignConfig>;
}

export interface InstructorSettings {
  targetMinCtr: number;
  targetMaxCpa: number;
  targetMinRoas: number;
  targetMinReach: number;
  competitionMultiplier: number; // 0.8 - 1.5
  currencySymbol: string;
}
