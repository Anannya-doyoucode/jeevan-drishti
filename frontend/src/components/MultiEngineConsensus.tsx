import React from 'react';
import { EngineRiskScore } from '../types/api';
import { Cpu, CheckCircle2, AlertTriangle, Flame, Droplets, Bug, Zap } from 'lucide-react';

interface MultiEngineProps {
  consensusScore: number;
  consensusLabel: string;
  dominantEngine: string;
  engines: EngineRiskScore[];
  isLoading: boolean;
}

export const MultiEngineConsensus: React.FC<MultiEngineProps> = ({
  consensusScore,
  consensusLabel,
  dominantEngine,
  engines,
  isLoading
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-risk-high bg-risk-high/10 border-risk-high/30';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 40) return 'text-govTeal-600 bg-govTeal-50 border-govTeal-200';
    return 'text-risk-low bg-risk-low/10 border-risk-low/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return '#E76F51';
    if (score >= 60) return '#E9B949';
    if (score >= 40) return '#2DD4BF';
    return '#34A853';
  };

  const getEngineIcon = (name: string) => {
    if (name.includes('Vector')) return <Bug className="w-4 h-4 text-orange-600" />;
    if (name.includes('Water')) return <Droplets className="w-4 h-4 text-blue-600" />;
    return <Flame className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4 mb-5">
      {/* Top Banner: Consensus Triangulation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-govNavy-800 text-govTeal-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                Multi-Engine Predictive Triangulation
              </h3>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-govTeal-50 text-govTeal-700 border border-govTeal-200">
                Triple Specialist Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Asynchronous ensemble cross-validating vector breeding, runoff inundation, and thermal fatigue
            </p>
          </div>
        </div>

        {/* Consensus Meter */}
        <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">
              Engine Agreement Consensus
            </div>
            <div className="text-[11px] text-govTeal-600 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {consensusLabel}
            </div>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-govNavy-800 flex items-center justify-center bg-white shadow-inner font-mono font-extrabold text-base text-govNavy-900">
            {consensusScore}%
          </div>
        </div>
      </div>

      {/* 3 Specialist Engines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {engines.map((eng) => {
          const isDominant = eng.engine_name === dominantEngine;
          return (
            <div
              key={eng.engine_name}
              className={`p-3.5 rounded-xl border transition-all ${
                isDominant
                  ? 'border-govNavy-800 bg-gradient-to-b from-slate-50 to-white shadow-md ring-1 ring-govNavy-800/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Title + Dominant badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-slate-100">
                    {getEngineIcon(eng.engine_name)}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {eng.engine_name}
                  </span>
                </div>
                {isDominant && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-govNavy-800 text-govTeal-300">
                    Lead Hazard
                  </span>
                )}
              </div>

              {/* Score Display + Bar */}
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-slate-500">Hazard Risk Index:</span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {eng.risk_score}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${eng.risk_score}%`,
                    backgroundColor: getBarColor(eng.risk_score)
                  }}
                />
              </div>

              {/* Status and Trigger context */}
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Classification:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${getScoreColor(eng.risk_score)}`}>
                    {eng.risk_category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {eng.confidence_pct}% CI
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 leading-snug">
                  <strong className="text-slate-600">Key Driver: </strong>
                  {eng.key_trigger}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
