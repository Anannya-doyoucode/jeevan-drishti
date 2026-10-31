import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ScrubberBar } from './components/ScrubberBar';
import { MapView } from './components/MapView';
import { DistrictCards } from './components/DistrictCard';
import { SurveillanceCard } from './components/SurveillanceCard';
import { MultiEngineConsensus } from './components/MultiEngineConsensus';
import { ForecastDrawer } from './components/ForecastDrawer';
import { ClimateLagChart } from './components/ClimateLagChart';
import { ShapDrawer } from './components/ShapDrawer';
import { WhatIfSandbox } from './components/WhatIfSandbox';
import { BroadcastModal } from './components/BroadcastModal';
import { AlertAuditModal } from './components/AlertAuditModal';
import { AuthModal, AVAILABLE_USERS } from './components/AuthModal';

import {
  DistrictMetadata,
  SurveillanceSummaryResponse,
  ClimateObservationsResponse,
  ModelPredictionResponse,
  ExplainabilityResponse,
  UserProfile
} from './types/api';

import {
  checkBackendHealth,
  getDistricts,
  getSurveillanceSummary,
  getClimateObservations,
  getModelPrediction,
  getExplainability,
  HealthStatus
} from './services/api';

import { AlertCircle, RefreshCw, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Session & User
  const [currentUser, setCurrentUser] = useState<UserProfile>(AVAILABLE_USERS[0]); // DSO Pune default

  // Health & Live Sync
  const [health, setHealth] = useState<HealthStatus>({
    online: false,
    latencyMs: 0,
    mlVersion: 'Connecting...',
    dbStatus: 'Checking...',
    fallbackActive: false
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected State
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('pune');
  const [selectedDisease, setSelectedDisease] = useState<string>('Dengue');
  const [currentWeek, setCurrentWeek] = useState<number>(44);
  const [forecastHorizon, setForecastHorizon] = useState<number>(30);

  // Data Stores
  const [districts, setDistricts] = useState<DistrictMetadata[]>([]);
  const [surveillanceData, setSurveillanceData] = useState<SurveillanceSummaryResponse | null>(null);
  const [climateData, setClimateData] = useState<ClimateObservationsResponse | null>(null);
  const [predictionData, setPredictionData] = useState<ModelPredictionResponse | null>(null);
  const [shapData, setShapData] = useState<ExplainabilityResponse | null>(null);

  // Loading States
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(true);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingPrediction, setLoadingPrediction] = useState<boolean>(true);

  // Modals & Drawers
  const [isShapOpen, setIsShapOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // 1. Initial Health Check & Districts Load
  const initApp = useCallback(async () => {
    setIsRefreshing(true);
    const h = await checkBackendHealth();
    setHealth(h);

    setLoadingDistricts(true);
    const dists = await getDistricts();
    setDistricts(dists);
    setLoadingDistricts(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    initApp();
    // Heartbeat every 15s to update live sync badge latency
    const interval = setInterval(async () => {
      const h = await checkBackendHealth();
      setHealth(h);
    }, 15000);
    return () => clearInterval(interval);
  }, [initApp]);

  // 2. Fetch Surveillance Summary when District or Week changes
  useEffect(() => {
    let isCancelled = false;
    const loadSurveillance = async () => {
      setLoadingSummary(true);
      const data = await getSurveillanceSummary(selectedDistrictId, currentWeek);
      if (!isCancelled) {
        setSurveillanceData(data);
        setLoadingSummary(false);
      }
    };
    loadSurveillance();
    return () => {
      isCancelled = true;
    };
  }, [selectedDistrictId, currentWeek]);

  // 3. Fetch Climate Observations for selected District
  useEffect(() => {
    let isCancelled = false;
    const loadClimate = async () => {
      const data = await getClimateObservations(selectedDistrictId, 21);
      if (!isCancelled) {
        setClimateData(data);
      }
    };
    loadClimate();
    return () => {
      isCancelled = true;
    };
  }, [selectedDistrictId]);

  // 4. Fetch Prediction & Consensus when District, Disease, or Horizon changes
  useEffect(() => {
    let isCancelled = false;
    const loadPrediction = async () => {
      setLoadingPrediction(true);
      const data = await getModelPrediction(selectedDistrictId, selectedDisease, forecastHorizon);
      if (!isCancelled) {
        setPredictionData(data);
        setLoadingPrediction(false);
      }
    };
    loadPrediction();
    return () => {
      isCancelled = true;
    };
  }, [selectedDistrictId, selectedDisease, forecastHorizon]);

  // 5. Fetch SHAP Explainability for "Why Flagged?" drawer
  useEffect(() => {
    let isCancelled = false;
    const loadShap = async () => {
      const data = await getExplainability(selectedDistrictId, selectedDisease);
      if (!isCancelled) {
        setShapData(data);
      }
    };
    loadShap();
    return () => {
      isCancelled = true;
    };
  }, [selectedDistrictId, selectedDisease]);

  const activeDistrict = districts.find(d => d.id === selectedDistrictId) || districts[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header Navigation with Live Sync Badge & Persona Switcher */}
      <Header
        health={health}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenSimulation={() => setIsWhatIfOpen(true)}
        onRefresh={initApp}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Fallback Notice if Offline */}
        {health.fallbackActive && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>INSUFFICIENT DATA / OFFLINE FALLBACK ACTIVE: </strong>
                Operating in resilient cached mode with synthetic epidemiological baselines. Background auto-reconnect running.
              </span>
            </div>
            <button
              onClick={initApp}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950 ml-2"
            >
              Retry Live Sync
            </button>
          </div>
        )}

        {/* 2. Epidemiological Timeline Scrubber (Weeks 1 to 52) */}
        <ScrubberBar
          currentWeek={currentWeek}
          onWeekChange={(wk) => setCurrentWeek(wk)}
          isLoading={loadingSummary}
        />

        {/* 3. Top Split: Dynamic Maharashtra Vector Map + 7 District Cockpit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Map Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <MapView
              districts={districts}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              isLoading={loadingDistricts}
            />
          </div>

          {/* District Cards Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <DistrictCards
              districts={districts}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              isLoading={loadingDistricts}
            />
          </div>
        </div>

        {/* 4. District Deep-Dive Surveillance Summary */}
        <SurveillanceCard
          data={surveillanceData}
          isLoading={loadingSummary}
          onOpenAudit={() => setIsAuditOpen(true)}
          onSelectDisease={(dis) => setSelectedDisease(dis)}
          selectedDisease={selectedDisease}
        />

        {/* 5. Triple Specialist Engines & Triangulated Consensus */}
        {predictionData && (
          <MultiEngineConsensus
            consensusScore={predictionData.consensus_score_pct}
            consensusLabel={predictionData.consensus_label}
            dominantEngine={predictionData.dominant_engine}
            engines={predictionData.engine_scores}
            isLoading={loadingPrediction}
          />
        )}

        {/* 6. Probabilistic Forecast Trajectory & 95% Uncertainty Bands */}
        {predictionData && (
          <ForecastDrawer
            districtName={activeDistrict?.name || 'District'}
            selectedDisease={selectedDisease}
            onSelectDisease={(dis) => setSelectedDisease(dis)}
            horizon={forecastHorizon}
            onSelectHorizon={(h) => setForecastHorizon(h)}
            trajectory={predictionData.forecast_trajectory}
            advisoryText={predictionData.advisory_recommendation}
            isLoading={loadingPrediction}
            onOpenShap={() => setIsShapOpen(true)}
          />
        )}

        {/* 7. Climate Observations & 21-Day Lag Matrix */}
        <ClimateLagChart
          data={climateData}
          isLoading={false}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-10 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-govTeal-600" />
            <span className="font-semibold text-slate-700">
              JEEVAN-DRISHTI (जीवन-दृष्टी) Public Health Intelligence Platform
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Government of Maharashtra • Integrated Disease Surveillance Programme (IDSP) • C-DoT / SACHET Integrated
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <ShapDrawer
        isOpen={isShapOpen}
        onClose={() => setIsShapOpen(false)}
        data={shapData}
        isLoading={false}
      />

      <WhatIfSandbox
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        districtId={selectedDistrictId}
        disease={selectedDisease}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        districtId={selectedDistrictId}
        districtName={activeDistrict?.name || 'District'}
        currentUser={currentUser}
      />

      <AlertAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        districtId={selectedDistrictId}
        districtName={activeDistrict?.name || 'District'}
        currentAlertState={surveillanceData?.alert_state || 'UNDER_REVIEW'}
        alertId={surveillanceData?.alert_id || `ALT-${selectedDistrictId.substring(0,3).toUpperCase()}-2026`}
        currentUser={currentUser}
        onStateUpdated={(newState) => {
          if (surveillanceData) {
            setSurveillanceData({ ...surveillanceData, alert_state: newState as any });
          }
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => setCurrentUser(u)}
      />
    </div>
  );
};

export default App;
