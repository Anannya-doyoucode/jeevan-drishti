import React from 'react';
import { ShieldAlert, Activity, Radio, UserCheck, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { HealthStatus } from '../services/api';
import { UserProfile } from '../types/api';

interface HeaderProps {
  health: HealthStatus;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenBroadcast: () => void;
  onOpenAudit: () => void;
  onOpenSimulation: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  currentUser,
  onOpenAuth,
  onOpenBroadcast,
  onOpenAudit,
  onOpenSimulation,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="bg-govNavy-800 text-white shadow-xl border-b border-govNavy-700 sticky top-0 z-40">
      {/* Top micro-bar for Government Department header */}
      <div className="bg-govNavy-900 px-4 py-1.5 border-b border-govNavy-700/60 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-govTeal-400"></span>
            सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन
          </span>
          <span className="text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">
            Public Health Department, Government of Maharashtra
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="hidden lg:inline text-govTeal-300 font-mono">
            Integrated Disease Surveillance Programme (IDSP)
          </span>
        </div>

        {/* Live Sync Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-govNavy-800 border border-govNavy-600/70 text-xs">
            {health.online ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-emerald-400">REST API Connected</span>
                <span className="text-slate-400 font-mono text-[11px]">({health.latencyMs}ms)</span>
                <span className="text-slate-500">•</span>
                <span className="text-govTeal-400 font-medium hidden sm:inline">ML Engine Synced</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-medium text-amber-300">Local Fallback Mode</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">(INSUFFICIENT DATA CACHE)</span>
              </>
            )}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Force refresh live sync"
            className="text-slate-400 hover:text-govTeal-300 transition-colors p-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-govTeal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Command Header */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-govTeal-500 to-govNavy-900 border border-govTeal-400/40 flex items-center justify-center shadow-lg shadow-govTeal-500/10">
            <Activity className="w-6 h-6 text-govTeal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                JEEVAN-DRISHTI
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-govTeal-400/10 text-govTeal-300 border border-govTeal-400/30">
                  जीवन-दृष्टी v2.4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-normal">
              Multi-Hazard Climate-Health Disease Surveillance & Predictive Outbreak Decision Support Platform
            </p>
          </div>
        </div>

        {/* Global Action Tools & User Profile */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* What-If Sandbox Button */}
          <button
            onClick={onOpenSimulation}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-govNavy-700 hover:bg-govNavy-600 text-slate-200 border border-slate-600/60 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-govTeal-400" />
            <span>What-If Sandbox</span>
          </button>

          {/* Audit Trail Button */}
          <button
            onClick={onOpenAudit}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-govNavy-700 hover:bg-govNavy-600 text-slate-200 border border-slate-600/60 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Alert Governance</span>
          </button>

          {/* C-DoT / SACHET Broadcast Button */}
          <button
            onClick={onOpenBroadcast}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-risk-high hover:bg-opacity-90 text-white flex items-center gap-1.5 transition-all shadow-md shadow-risk-high/30 animate-pulse"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>C-DoT Broadcast</span>
          </button>

          {/* Persona Switcher Pill */}
          <div
            onClick={onOpenAuth}
            className="flex items-center space-x-2 pl-3 pr-2.5 py-1 rounded-lg bg-govNavy-900/90 border border-govNavy-600 hover:border-govTeal-400/60 cursor-pointer transition-all ml-1"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-govNavy-900"
              style={{ backgroundColor: currentUser.avatar_color }}
            >
              {currentUser.role.substring(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-white leading-tight">
                {currentUser.full_name.split(' ')[0]} ({currentUser.role})
              </div>
              <div className="text-[10px] text-govTeal-300 leading-tight">
                {currentUser.jurisdiction.split('(')[0]}
              </div>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
