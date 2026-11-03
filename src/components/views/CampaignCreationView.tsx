import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Layers,
  DollarSign,
  Palette,
  Split,
  ChevronRight,
  Check,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Monitor,
  Tv,
} from 'lucide-react';
import {
  CampaignConfig,
  CampaignObjective,
  SecondaryKpi,
  AgeGroup,
  Gender,
  DeviceType,
  PlatformName,
  InventoryType,
  BidStrategy,
  ABTestVariable,
  TrafficSplit,
  Industry,
} from '../../types/campaign';
import { PRESET_BRANDS } from '../../utils/presets';
import { calculateAudienceSize } from '../../utils/simulationEngine';
import { EducationalNote } from '../common/EducationalNote';
import { DonutChart } from '../common/Charts';

interface CampaignCreationViewProps {
  campaign: CampaignConfig;
  onSaveCampaign: (updated: CampaignConfig) => void;
  onRunSimulation: (updated: CampaignConfig) => void;
  studentMode: boolean;
}

const OBJECTIVE_RECOMMENDATIONS: Record<CampaignObjective, SecondaryKpi[]> = {
  'Brand Awareness': ['Reach', 'Impressions', 'CPM', 'Frequency'],
  Reach: ['Reach', 'Impressions', 'CPM', 'Frequency'],
  'Video Views': ['Video Completion Rate', 'Impressions', 'CPM'],
  Traffic: ['Clicks', 'CTR', 'CPC'],
  'Website Visits': ['Clicks', 'CTR', 'CPC'],
  Engagement: ['CTR', 'Clicks', 'Video Completion Rate'],
  'Lead Generation': ['Conversions', 'CPA', 'CVR'],
  'App Installation': ['Conversions', 'CPA', 'CTR'],
  Conversions: ['Conversions', 'CVR', 'CPA'],
  Sales: ['Revenue', 'ROAS', 'CPA'],
};

const ALL_INDUSTRIES: Industry[] = [
  'FMCG',
  'Automotive',
  'Fashion',
  'Technology',
  'Entertainment',
  'Food & Beverage',
  'E-commerce',
  'Travel',
  'Finance',
  'Education',
  'Healthcare',
  'Retail',
];

const ALL_PLATFORMS: PlatformName[] = [
  'Google Display',
  'YouTube',
  'Meta',
  'Instagram',
  'Connected TV',
  'Mobile Apps',
  'News Websites',
  'OTT',
  'Programmatic Display',
  'Programmatic Video',
  'Native Advertising',
];

const ALL_INVENTORY_TYPES: InventoryType[] = [
  'Banner',
  'Native',
  'In-stream Video',
  'Out-stream Video',
  'Connected TV',
  'Rich Media',
];

const ALL_INTERESTS = [
  'Technology',
  'Fashion',
  'Sports',
  'Gaming',
  'Movies',
  'Music',
  'Travel',
  'Food',
  'Finance',
  'Education',
  'Automobiles',
];

const ALL_BEHAVIORS = [
  'Frequent online shoppers',
  'Mobile-first users',
  'High-intent users',
  'Frequent travellers',
  'Entertainment consumers',
  'Premium consumers',
];

const ALL_GEOS = [
  'India',
  'North India',
  'Delhi NCR',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
  'Chennai',
];

export const CampaignCreationView: React.FC<CampaignCreationViewProps> = ({
  campaign,
  onSaveCampaign,
  onRunSimulation,
  studentMode,
}) => {
  const [formData, setFormData] = useState<CampaignConfig>({ ...campaign });
  const [activeTab, setActiveTab] = useState<'basics' | 'objective' | 'audience' | 'media' | 'bidding' | 'creatives' | 'ab'>('basics');

  // Dynamic calculations
  const audienceEstimate = calculateAudienceSize(formData);
  const totalAllocated = formData.platforms.reduce((s, p) => s + p.percentage, 0);
  const dailyBudget = Math.round(formData.totalBudget / Math.max(1, formData.durationDays));

  const handleBrandSelect = (brandName: string) => {
    if (brandName === 'Custom') {
      setFormData({
        ...formData,
        isCustomBrand: true,
        brand: '',
        product: '',
      });
    } else {
      const preset = PRESET_BRANDS.find((b) => b.name === brandName);
      if (preset) {
        setFormData({
          ...formData,
          isCustomBrand: false,
          brand: preset.name,
          product: preset.product,
          industry: preset.industry,
        });
      }
    }
  };

  const handleObjectiveSelect = (obj: CampaignObjective) => {
    const recommended = OBJECTIVE_RECOMMENDATIONS[obj] || ['CTR', 'Clicks'];
    setFormData({
      ...formData,
      objective: obj,
      secondaryKpis: recommended.slice(0, 3),
    });
  };

  const toggleAge = (age: AgeGroup) => {
    const current = formData.demographics.ages;
    const exists = current.includes(age);
    const updated = exists ? current.filter((a) => a !== age) : [...current, age];
    if (updated.length > 0) {
      setFormData({
        ...formData,
        demographics: { ...formData.demographics, ages: updated },
      });
    }
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests;
    const exists = current.includes(interest);
    setFormData({
      ...formData,
      interests: exists ? current.filter((i) => i !== interest) : [...current, interest],
    });
  };

  const toggleBehavior = (behavior: string) => {
    const current = formData.behaviors;
    const exists = current.includes(behavior);
    setFormData({
      ...formData,
      behaviors: exists ? current.filter((b) => b !== behavior) : [...current, behavior],
    });
  };

  const toggleGeo = (geo: string) => {
    const current = formData.geography;
    const exists = current.includes(geo);
    const updated = exists ? current.filter((g) => g !== geo) : [...current, geo];
    if (updated.length > 0) {
      setFormData({ ...formData, geography: updated });
    }
  };

  const toggleDevice = (dev: DeviceType) => {
    const current = formData.devices;
    const exists = current.includes(dev);
    const updated = exists ? current.filter((d) => d !== dev) : [...current, dev];
    if (updated.length > 0) {
      setFormData({ ...formData, devices: updated });
    }
  };

  const updatePlatformAllocation = (platformName: PlatformName, value: number) => {
    const existing = formData.platforms.map((p) =>
      p.platform === platformName ? { ...p, percentage: value } : p
    );
    if (!existing.some((p) => p.platform === platformName)) {
      existing.push({ platform: platformName, percentage: value });
    }
    setFormData({ ...formData, platforms: existing });
  };

  const handleRun = () => {
    onSaveCampaign(formData);
    onRunSimulation(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stepper Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
              Campaign Configuration Lab
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {formData.name || 'Untitled Campaign'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{formData.brand || 'Custom Brand'}</span>
              <span>·</span>
              <span>{formData.industry}</span>
              <span>·</span>
              <span className="text-cyan-300 font-mono">₹{formData.totalBudget.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSaveCampaign(formData)}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              onClick={handleRun}
              className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>Launch Simulation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pt-4 no-scrollbar">
          {[
            { id: 'basics', label: '1. Brand & Product' },
            { id: 'objective', label: '2. Objective & KPIs' },
            { id: 'audience', label: '3. Audience Targeting' },
            { id: 'media', label: '4. Media & Inventory' },
            { id: 'bidding', label: '5. Budget & Bidding' },
            { id: 'creatives', label: '6. Creative Builder' },
            { id: 'ab', label: '7. A/B Testing Lab' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Brand & Product */}
      {activeTab === 'basics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Brand & Campaign Identity</h3>
            <p className="text-xs text-slate-400">
              Select from curated educational brand presets or define your own custom brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smartphone Launch — Gen Z Campaign"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Brand Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_BRANDS.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => handleBrandSelect(b.name)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        !formData.isCustomBrand && formData.brand === b.name
                          ? 'border-cyan-500 bg-cyan-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.industry}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleBrandSelect('Custom')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      formData.isCustomBrand
                        ? 'border-cyan-500 bg-cyan-950/30 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-cyan-400">Custom Brand</div>
                    <div className="text-[10px] text-slate-400">Define your own</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Enter brand name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Promoted Product or Service
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="e.g. Galaxy S25 Ultra"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Industry Vertical
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {ALL_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Campaign Objective & KPIs */}
      {activeTab === 'objective' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Campaign Objective & KPIs</h3>
            <p className="text-xs text-slate-400">
              Selecting your primary business objective guides the RTB bidding algorithms and media recommendations.
            </p>
          </div>

          {studentMode && (
            <EducationalNote
              title="Aligning Objectives with Metrics"
              explanation="In programmatic marketing, your objective informs your bidding strategy. Upper-funnel awareness campaigns prioritize Reach, Impressions, and CPM efficiency. Mid-funnel campaigns optimize for Traffic, CTR, and CPC. Lower-funnel performance campaigns focus strictly on Conversions, CPA, and ROAS."
            />
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Primary Objective
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {(
                [
                  'Brand Awareness',
                  'Reach',
                  'Video Views',
                  'Traffic',
                  'Engagement',
                  'Lead Generation',
                  'App Installation',
                  'Sales',
                  'Conversions',
                  'Website Visits',
                ] as CampaignObjective[]
              ).map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => handleObjectiveSelect(obj)}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    formData.objective === obj
                      ? 'border-cyan-500 bg-cyan-950/30 text-white font-semibold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Recommended Secondary KPIs for {formData.objective}
              </label>
              <span className="text-[10px] text-cyan-400">Auto-Recommended</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {OBJECTIVE_RECOMMENDATIONS[formData.objective]?.map((kpi) => {
                const isSelected = formData.secondaryKpis.includes(kpi);
                return (
                  <button
                    key={kpi}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? formData.secondaryKpis.filter((k) => k !== kpi)
                        : [...formData.secondaryKpis, kpi];
                      setFormData({ ...formData, secondaryKpis: updated });
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {kpi}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audience & Targeting */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Targeting & Audience Builder</h3>
                <p className="text-xs text-slate-400">
                  Configure demographic cohorts, geo-locations, intent segments, and device criteria.
                </p>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Age Cohorts
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['18–24', '25–34', '35–44', '45–54', '55+'] as AgeGroup[]).map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => toggleAge(age)}
                        className={`px-3 py-1 text-xs rounded-md border font-mono transition-colors ${
                          formData.demographics.ages.includes(age)
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {(['All', 'Male', 'Female'] as Gender[]).map((gen) => (
                      <button
                        key={gen}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            demographics: { ...formData.demographics, gender: gen },
                          })
                        }
                        className={`px-3.5 py-1 text-xs rounded-md border transition-colors ${
                          formData.demographics.gender === gen
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Geography */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Geographic Markets
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GEOS.map((geo) => (
                    <button
                      key={geo}
                      type="button"
                      onClick={() => toggleGeo(geo)}
                      className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                        formData.geography.includes(geo)
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {geo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests & Behaviors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Interest Segments
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                          formData.interests.includes(interest)
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Behavior & Intent Signals
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_BEHAVIORS.map((beh) => (
                      <button
                        key={beh}
                        type="button"
                        onClick={() => toggleBehavior(beh)}
                        className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                          formData.behaviors.includes(beh)
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {beh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Devices & Frequency Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Target Hardware Devices
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Mobile', 'Desktop', 'Tablet', 'Connected TV'] as DeviceType[]).map((dev) => (
                      <button
                        key={dev}
                        type="button"
                        onClick={() => toggleDevice(dev)}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1.5 ${
                          formData.devices.includes(dev)
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {dev === 'Mobile' && <Smartphone className="w-3.5 h-3.5" />}
                        {dev === 'Desktop' && <Monitor className="w-3.5 h-3.5" />}
                        {dev === 'Connected TV' && <Tv className="w-3.5 h-3.5" />}
                        <span>{dev}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Frequency Cap
                    </label>
                    <span className="text-xs font-mono-numbers text-cyan-400">
                      {formData.frequencyCap} imp / 24 hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={formData.frequencyCap}
                    onChange={(e) => setFormData({ ...formData, frequencyCap: Number(e.target.value) })}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 (Strict)</span>
                    <span>3 (Balanced)</span>
                    <span>8 (Aggressive)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Reach Gauge (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                  DSP Forecasting Engine
                </span>
                <h4 className="text-base font-bold text-white mb-2">Estimated Addressable Audience</h4>
                <p className="text-xs text-slate-400 mb-6">
                  Real-time reach calculation based on combined geo-demographics and intent signals.
                </p>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Total Addressable Pool
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono-numbers">
                    {audienceEstimate.estimatedReach.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    ~{audienceEstimate.marketSharePct.toFixed(1)}% of Regional Universe
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Relevance Multiplier:</span>
                    <span className="font-mono text-cyan-400">{audienceEstimate.relevanceIndex.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Active Filters:</span>
                    <span className="font-mono text-slate-200">
                      {formData.geography.length} Geos · {formData.demographics.ages.length} Ages · {formData.interests.length} Interests
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                💡 Narrow targeting increases ad relevance and CTR, but restricts maximum scalable impression volume.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Media Platforms & Inventory */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Allocation Sliders (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Platform Mix & Budget Split</h3>
                  <p className="text-xs text-slate-400">
                    Allocate your media budget across programmatic and walled-garden channels.
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    totalAllocated === 100
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  Total: {totalAllocated}%
                </div>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {ALL_PLATFORMS.map((platform) => {
                  const currentAlloc =
                    formData.platforms.find((p) => p.platform === platform)?.percentage || 0;
                  return (
                    <div key={platform} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-200">{platform}</span>
                        <span className="font-mono-numbers text-cyan-400 font-bold">
                          {currentAlloc}% (₹{Math.round((formData.totalBudget * currentAlloc) / 100).toLocaleString()})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentAlloc}
                        onChange={(e) => updatePlatformAllocation(platform, Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {totalAllocated !== 100 && (
                <div className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Total platform allocation must equal 100% for realistic delivery pacing.</span>
                </div>
              )}
            </div>

            {/* Inventory Types & Donut Visualization (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Donut Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Media Budget Distribution
                </h4>
                <DonutChart
                  size={160}
                  centerText={`₹${(formData.totalBudget / 1000).toFixed(0)}k`}
                  centerSubtext="Total Budget"
                  data={formData.platforms
                    .filter((p) => p.percentage > 0)
                    .map((p, i) => {
                      const colors = ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
                      return {
                        name: p.platform,
                        value: p.percentage,
                        color: colors[i % colors.length],
                      };
                    })}
                />
              </div>

              {/* Inventory Types Checklist */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Allowed Ad Inventory Formats
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_INVENTORY_TYPES.map((inv) => {
                    const isChecked = formData.inventoryTypes.includes(inv);
                    return (
                      <button
                        key={inv}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? formData.inventoryTypes.filter((i) => i !== inv)
                            : [...formData.inventoryTypes, inv];
                          if (updated.length > 0) {
                            setFormData({ ...formData, inventoryTypes: updated });
                          }
                        }}
                        className={`p-2 rounded text-xs border text-left flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'border-cyan-500/60 bg-cyan-950/30 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{inv}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Budget & Bidding */}
      {activeTab === 'bidding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Budget Allocation & Bidding Strategy</h3>
            <p className="text-xs text-slate-400">
              Control pacing, daily cap, programmatic bidding protocol, and max clearing price.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Total Campaign Budget (₹ INR)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[10000, 25000, 50000, 100000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData({ ...formData, totalBudget: amt })}
                    className={`py-2 px-3 text-xs rounded-lg border font-mono transition-colors ${
                      formData.totalBudget === amt
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-cyan-500"
                placeholder="Custom Amount"
              />
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Campaign Flight Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[7, 14, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setFormData({ ...formData, durationDays: days })}
                    className={`py-2 px-3 text-xs rounded-lg border font-mono transition-colors ${
                      formData.durationDays === days
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Daily Run-rate:</span>
                  <span className="font-mono-numbers text-white font-semibold">
                    ₹{dailyBudget.toLocaleString()} / day
                  </span>
                </div>
              </div>
            </div>

            {/* Bidding Strategy */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Bid Strategy
              </label>
              <select
                value={formData.bidStrategy}
                onChange={(e) => setFormData({ ...formData, bidStrategy: e.target.value as BidStrategy })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {(
                  [
                    'CPM',
                    'CPC',
                    'CPA',
                    'vCPM',
                    'Maximize Clicks',
                    'Maximize Conversions',
                    'Target CPA',
                  ] as BidStrategy[]
                ).map((strat) => (
                  <option key={strat} value={strat}>
                    {strat}
                  </option>
                ))}
              </select>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Max Bid Cap (CPM):</span>
                  <span className="font-mono-numbers text-cyan-400 font-bold">
                    ₹{formData.maxBid || 85}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="300"
                  step="5"
                  value={formData.maxBid || 85}
                  onChange={(e) => setFormData({ ...formData, maxBid: Number(e.target.value) })}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Creative Builder */}
      {activeTab === 'creatives' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Creative Builder & Live Ad Previews</h3>
            <p className="text-xs text-slate-400 mb-6">
              Design both Creative A and Creative B variants. These will compete directly in your A/B test experiments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Creative A */}
              <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Variant A (Control)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Format: {formData.creativeA.format}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Headline</label>
                    <input
                      type="text"
                      value={formData.creativeA.headline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeA: { ...formData.creativeA, headline: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.creativeA.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeA: { ...formData.creativeA, description: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Call to Action (CTA)</label>
                    <select
                      value={formData.creativeA.cta}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeA: { ...formData.creativeA, cta: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      {['SHOP NOW', 'LEARN MORE', 'WATCH NOW', 'SIGN UP', 'DOWNLOAD', 'BOOK NOW'].map(
                        (cta) => (
                          <option key={cta} value={cta}>
                            {cta}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* Live Ad Mockup Preview A */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">
                    Live Display Mockup A
                  </span>
                  <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-4 relative overflow-hidden shadow-md">
                    <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                      {formData.brand || 'Brand'}
                    </div>
                    <div className="text-sm font-bold text-white mb-1.5">
                      {formData.creativeA.headline || 'Headline A'}
                    </div>
                    <div className="text-xs text-slate-300 leading-snug mb-3">
                      {formData.creativeA.description || 'Description A'}
                    </div>
                    <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold tracking-wider uppercase">
                      {formData.creativeA.cta}
                    </button>
                  </div>
                </div>
              </div>

              {/* Creative B */}
              <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Variant B (Challenger)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Format: {formData.creativeB.format}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Headline</label>
                    <input
                      type="text"
                      value={formData.creativeB.headline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeB: { ...formData.creativeB, headline: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.creativeB.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeB: { ...formData.creativeB, description: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Call to Action (CTA)</label>
                    <select
                      value={formData.creativeB.cta}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creativeB: { ...formData.creativeB, cta: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      {['SHOP NOW', 'LEARN MORE', 'WATCH NOW', 'SIGN UP', 'DOWNLOAD', 'BOOK NOW'].map(
                        (cta) => (
                          <option key={cta} value={cta}>
                            {cta}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* Live Ad Mockup Preview B */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">
                    Live Display Mockup B
                  </span>
                  <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-4 relative overflow-hidden shadow-md">
                    <div className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-1">
                      {formData.brand || 'Brand'}
                    </div>
                    <div className="text-sm font-bold text-white mb-1.5">
                      {formData.creativeB.headline || 'Headline B'}
                    </div>
                    <div className="text-xs text-slate-300 leading-snug mb-3">
                      {formData.creativeB.description || 'Description B'}
                    </div>
                    <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold tracking-wider uppercase">
                      {formData.creativeB.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: A/B Testing Lab */}
      {activeTab === 'ab' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">A/B Testing Configuration</h3>
            <p className="text-xs text-slate-400">
              Isolate your testing hypothesis. Choose which variable to test and set the traffic split ratio.
            </p>
          </div>

          {studentMode && (
            <EducationalNote
              title="A/B Testing Methodology"
              explanation="To establish true causality in marketing experiments, test exactly ONE variable at a time (e.g. Headline alone or CTA alone). Splitting traffic 50/50 achieves statistical power fastest, while 80/20 minimizes downside risk on unproven creative concepts."
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Primary Testing Variable
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    'Headline',
                    'Image',
                    'CTA',
                    'Offer',
                    'Landing Page',
                    'Audience',
                    'Ad Format',
                  ] as ABTestVariable[]
                ).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData({ ...formData, abTestVariable: v })}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      formData.abTestVariable === v
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Traffic Split Allocation
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['50/50', '60/40', '70/30', '80/20'] as TrafficSplit[]).map((split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setFormData({ ...formData, trafficSplit: split })}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono transition-colors ${
                      formData.trafficSplit === split
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {split} (Var A / Var B)
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-200">Experimental Setup:</span>
                <div>Testing: <span className="text-cyan-400">{formData.abTestVariable}</span></div>
                <div>Split: <span className="text-cyan-400">{formData.trafficSplit}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
