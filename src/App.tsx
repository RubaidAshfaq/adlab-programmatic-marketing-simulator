/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CampaignConfig, SimulationResult, InstructorSettings, Challenge } from './types/campaign';
import { DEMO_CAMPAIGN } from './utils/presets';
import { runFullCampaignSimulation } from './utils/simulationEngine';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { CampaignCreationView } from './components/views/CampaignCreationView';
import { RtbSimulatorView } from './components/views/RtbSimulatorView';
import { SimulationRunnerView } from './components/views/SimulationRunnerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { EffectivenessView } from './components/views/EffectivenessView';
import { OptimizationLabView } from './components/views/OptimizationLabView';
import { CampaignReportView } from './components/views/CampaignReportView';
import { ChallengesView } from './components/views/ChallengesView';
import { InstructorView } from './components/views/InstructorView';

export default function App() {
  // State initialization with preloaded demo campaign
  const [campaign, setCampaign] = useState<CampaignConfig>(DEMO_CAMPAIGN);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() => {
    // Generate initial sample simulation data immediately for instant student exploration
    return runFullCampaignSimulation(DEMO_CAMPAIGN, undefined, 42);
  });

  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [studentMode, setStudentMode] = useState<boolean>(true);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const [instructorSettings, setInstructorSettings] = useState<InstructorSettings>({
    targetMinCtr: 1.2,
    targetMaxCpa: 450,
    targetMinRoas: 2.5,
    targetMinReach: 200000,
    competitionMultiplier: 1.0,
    currencySymbol: '₹',
  });

  // Action handlers
  const handleLoadDemoCampaign = () => {
    setCampaign(DEMO_CAMPAIGN);
    const sim = runFullCampaignSimulation(DEMO_CAMPAIGN, instructorSettings, 42);
    setSimulationResult(sim);
    setActiveChallengeId(null);
    setCurrentSection('dashboard');
  };

  const handleNewExperiment = () => {
    const blankCampaign: CampaignConfig = {
      id: `exp-${Date.now()}`,
      name: 'New Programmatic Campaign',
      brand: '',
      product: '',
      industry: 'E-commerce',
      isCustomBrand: true,
      objective: 'Conversions',
      secondaryKpis: ['ROAS', 'CTR', 'CPA'],
      demographics: {
        ages: ['18–24', '25–34'],
        gender: 'All',
      },
      geography: ['India'],
      interests: ['Technology', 'E-commerce'],
      behaviors: ['Mobile-first users'],
      devices: ['Mobile', 'Desktop'],
      frequencyCap: 3,
      platforms: [
        { platform: 'Google Display', percentage: 40 },
        { platform: 'Instagram', percentage: 35 },
        { platform: 'Programmatic Display', percentage: 25 },
      ],
      inventoryTypes: ['Banner', 'In-stream Video'],
      totalBudget: 50000,
      durationDays: 14,
      bidStrategy: 'Maximize Conversions',
      maxBid: 80,
      creativeA: {
        id: 'cr-a',
        headline: 'Discover The Difference',
        description: 'Shop premier essentials engineered for exceptional performance.',
        cta: 'SHOP NOW',
        format: 'Banner',
        visualTheme: 'Modern Minimalist',
        accentColor: '#06B6D4',
      },
      creativeB: {
        id: 'cr-b',
        headline: 'Elevate Every Moment',
        description: 'Claim your exclusive introductory discount today.',
        cta: 'SHOP NOW',
        format: 'Banner',
        visualTheme: 'Vibrant Dynamic',
        accentColor: '#8B5CF6',
      },
      abTestVariable: 'Headline',
      trafficSplit: '50/50',
      createdAt: new Date().toISOString(),
    };

    setCampaign(blankCampaign);
    setSimulationResult(null);
    setActiveChallengeId(null);
    setCurrentSection('create');
  };

  const handleSaveCampaign = (updated: CampaignConfig) => {
    setCampaign(updated);
  };

  const handleRunSimulation = (campaignToRun?: CampaignConfig) => {
    const targetCampaign = campaignToRun || campaign;
    setCampaign(targetCampaign);
    setCurrentSection('simulation');
  };

  const handleSimulationComplete = (result: SimulationResult) => {
    setSimulationResult(result);
  };

  const handleApplyOptimization = (optimizedConfig: CampaignConfig, optimizedResult: SimulationResult) => {
    setCampaign(optimizedConfig);
    setSimulationResult(optimizedResult);
    setCurrentSection('dashboard');
  };

  const handleAcceptChallenge = (challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    const mergedCampaign: CampaignConfig = {
      ...campaign,
      ...challenge.presetCampaign,
      id: `challenge-${challenge.id}-${Date.now()}`,
      name: challenge.presetCampaign.name || challenge.title,
      totalBudget: challenge.budget,
      durationDays: challenge.recommendedDuration,
    };
    setCampaign(mergedCampaign);
    setCurrentSection('create');
  };

  const sectionTitles: Record<string, string> = {
    dashboard: 'Campaign Dashboard',
    create: 'Campaign Builder & Media Plan',
    rtb: 'Real-Time Bidding Simulator',
    simulation: 'Live Campaign Execution',
    analytics: 'Performance Analytics',
    effectiveness: 'Campaign Effectiveness Score',
    optimize: 'Optimization Laboratory',
    report: 'Executive Campaign Report',
    challenges: 'Programmatic Challenges',
    instructor: 'Instructor Assessment Console',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row font-sans selection:bg-cyan-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        studentMode={studentMode}
        onToggleStudentMode={() => setStudentMode(!studentMode)}
        onLoadDemoCampaign={handleLoadDemoCampaign}
        onNewExperiment={handleNewExperiment}
        campaignName={campaign.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          currentSectionTitle={sectionTitles[currentSection] || 'ADLAB'}
          onQuickSimulate={() => handleRunSimulation()}
          simulationStatus={simulationResult ? 'Simulated' : 'Ready'}
          studentMode={studentMode}
          onToggleStudentMode={() => setStudentMode(!studentMode)}
          brandName={campaign.brand}
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {currentSection === 'dashboard' && simulationResult && (
            <DashboardView
              campaign={campaign}
              simulationResult={simulationResult}
              onNavigate={(sec) => setCurrentSection(sec)}
              onRunSimulation={() => handleRunSimulation()}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'create' && (
            <CampaignCreationView
              campaign={campaign}
              onSaveCampaign={handleSaveCampaign}
              onRunSimulation={(c) => handleRunSimulation(c)}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'rtb' && (
            <RtbSimulatorView
              campaign={campaign}
              studentMode={studentMode}
              onUpdateBid={(newBid) => setCampaign({ ...campaign, maxBid: newBid })}
            />
          )}

          {currentSection === 'simulation' && (
            <SimulationRunnerView
              campaign={campaign}
              simulationResult={simulationResult}
              onSimulationComplete={handleSimulationComplete}
              onNavigateToAnalytics={() => setCurrentSection('analytics')}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'analytics' && simulationResult && (
            <AnalyticsView
              campaign={campaign}
              simulationResult={simulationResult}
              studentMode={studentMode}
              onNavigateToOptimization={() => setCurrentSection('optimize')}
            />
          )}

          {currentSection === 'effectiveness' && simulationResult && (
            <EffectivenessView
              campaign={campaign}
              simulationResult={simulationResult}
              onNavigateToOptimization={() => setCurrentSection('optimize')}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'optimize' && simulationResult && (
            <OptimizationLabView
              baseCampaign={campaign}
              initialResult={simulationResult}
              studentMode={studentMode}
              onApplyOptimization={handleApplyOptimization}
            />
          )}

          {currentSection === 'report' && simulationResult && (
            <CampaignReportView
              campaign={campaign}
              simulationResult={simulationResult}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'challenges' && (
            <ChallengesView
              activeChallengeId={activeChallengeId}
              onAcceptChallenge={handleAcceptChallenge}
              simulationResult={simulationResult}
              studentMode={studentMode}
            />
          )}

          {currentSection === 'instructor' && (
            <InstructorView
              campaign={campaign}
              simulationResult={simulationResult}
              instructorSettings={instructorSettings}
              onUpdateInstructorSettings={setInstructorSettings}
              studentMode={studentMode}
            />
          )}

          {/* Academic Disclosure & Data Transparency Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-800/80 text-xs text-slate-500 space-y-1 text-center no-print">
            <div className="font-semibold text-slate-400">
              SIMULATED / EDUCATIONAL DATA DISCLOSURE
            </div>
            <p className="max-w-3xl mx-auto leading-relaxed">
              This platform is an educational simulation designed for university and professional instruction. Campaign metrics, RTB auctions, audience behaviour, bidding results and performance outcomes are synthetically generated for teaching and experimentation. They do not represent real advertising exchange results.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
