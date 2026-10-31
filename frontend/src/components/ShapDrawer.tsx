import React from 'react';
import { ExplainabilityResponse } from '../types/api';
import { X, HelpCircle, ArrowUpRight, CloudRain, Droplets, Thermometer, Home, Stethoscope, Download } from 'lucide-react';

interface ShapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExplainabilityResponse | null;
  isLoading: boolean;
}

export const ShapDrawer: React.FC<ShapDrawerProps> = ({
  isOpen,
  onClose,
  data,
  isLoading
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CLIMATE_LAG':
        return <CloudRain className="w-3.5 h-3.5 text-blue-500" />;
      case 'DEMOGRAPHIC':
        return <Home className="w-3.5 h-3.5 text-amber-500" />;
      case 'HEALTHCARE_SYSTEM':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Thermometer className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  const getBarGradient = (pct: number) => {
    if (pct >= 35) return 'bg-gradient-to-r from-risk-high to-red-600';
    if (pct >= 20) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    if (pct >= 10) return 'bg-gradient-to-r from-govTeal-400 to-govTeal-500';
    return 'bg-gradient-to-r from-slate-400 to-slate-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300">
        {/* Drawer Header */}
        <div className="bg-govNavy-800 text-white px-5 py-4 flex items-center justify-between border-b border-govNavy-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-govTeal-500/20 text-govTeal-300 border border-govTeal-400/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Why Flagged? Evidence Drawer
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-govTeal-400/20 text-govTeal-300 border border-govTeal-400/30">
                  SHAP XAI
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {data?.district_name || 'District'} • {data?.disease || 'Disease'} Outbreak Driver Attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-govNavy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Risk Attribution Synthesis
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Base Risk:</span>
                <span className="font-mono font-bold text-slate-700">{data?.base_risk_value}%</span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-500">Predicted Risk:</span>
                <span className="font-mono font-bold text-risk-high">{data?.predicted_risk_score}/100</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {data?.why_flagged_summary}
            </p>
          </div>

          {/* Top SHAP Features List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                SHAP Feature Importance Breakdown (100% Attribution)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Shapley Additive Values
              </span>
            </div>

            <div className="space-y-3">
              {data?.top_features.map((feat, idx) => (
                <div
                  key={feat.feature_name}
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-govTeal-300 bg-white transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {feat.display_label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-extrabold font-mono text-risk-high flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{feat.percentage_contribution}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${getBarGradient(feat.percentage_contribution)}`}
                      style={{ width: `${feat.percentage_contribution}%` }}
                    />
                  </div>

                  {/* Context and Category */}
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <div className="mt-0.5 flex-shrink-0">
                      {getCategoryIcon(feat.category)}
                    </div>
                    <p className="leading-snug">
                      {feat.context_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Protocol Guidance */}
          <div className="p-3.5 rounded-xl bg-govTeal-50/70 border border-govTeal-200 text-xs text-govTeal-900">
            <span className="font-bold block mb-1">Surveillance Protocol Recommendation:</span>
            <p className="text-[11px] text-govTeal-800 leading-relaxed">
              When 21-day rainfall lag and humidity exceed the 75th percentile, field officers must dispatch Asha workers for container source reduction within 48 hours to abort the adult vector amplification window.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Model: GradientBoostedSHAP v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-govNavy-800 hover:bg-govNavy-700 text-white transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
