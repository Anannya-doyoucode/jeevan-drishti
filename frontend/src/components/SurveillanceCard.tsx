import React from 'react';
import { SurveillanceSummaryResponse } from '../types/api';
import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Hospital, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';

interface SurveillanceCardProps {
  data: SurveillanceSummaryResponse | null;
  isLoading: boolean;
  onOpenAudit: () => void;
  onSelectDisease: (disease: string) => void;
  selectedDisease: string;
}

export const SurveillanceCard: React.FC<SurveillanceCardProps> = ({
  data,
  isLoading,
  onOpenAudit,
  onSelectDisease,
  selectedDisease
}) => {
  if (!data) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OUTBREAK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-risk-high text-white shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            OUTBREAK
          </span>
        );
      case 'ALERT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white shadow-sm">
            ALERT
          </span>
        );
      case 'WATCH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-risk-moderate text-govNavy-900 shadow-sm">
            WATCH
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-risk-low text-white shadow-sm">
            NORMAL
          </span>
        );
    }
  };

  const getAlertStateBadge = (st: string) => {
    switch (st) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-risk-high text-white">CONFIRMED ALERT</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white">UNDER REVIEW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-govNavy-800 text-govTeal-300">{st}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4 mb-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-govNavy-800 text-govTeal-300">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                {data.district_name} District Surveillance Summary
              </h3>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Epidemiological Week {data.week_number} (2026)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              5-Year moving endemic baseline vs observed peripheral clinic cases
            </p>
          </div>
        </div>

        {/* PHC Reporting & Alert Action */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs">
            <Hospital className="w-3.5 h-3.5 text-govTeal-600" />
            <span className="text-slate-600">PHC Reports:</span>
            <strong className="text-slate-800 font-mono">
              {data.reporting_phcs} / {data.total_phcs}
            </strong>
            <span className="text-[11px] text-govTeal-700 font-bold">({data.coverage_pct}%)</span>
          </div>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-300"
            title="Inspect / Modify Alert State"
          >
            {getAlertStateBadge(data.alert_state)}
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Disease Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {data.diseases.map((dis) => {
          const isSelected = selectedDisease.toLowerCase() === dis.disease.toLowerCase();
          const isElevated = dis.observed_cases > dis.threshold_alert;

          return (
            <div
              key={dis.disease}
              onClick={() => onSelectDisease(dis.disease)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-govNavy-800 bg-slate-50/90 shadow-md ring-2 ring-govTeal-400/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {dis.disease}
                </span>
                {getStatusBadge(dis.status)}
              </div>

              {/* Observed vs Baseline */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {dis.observed_cases}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Base: {dis.endemic_baseline_5yr}
                </span>
              </div>

              {/* Threshold indicator bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (dis.observed_cases / Math.max(1, dis.threshold_alert)) * 100)}%`,
                    backgroundColor: isElevated ? '#E76F51' : '#34A853'
                  }}
                />
              </div>

              {/* WoW Trend */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                <span className="text-slate-400">Threshold: {dis.threshold_alert}</span>
                <span
                  className={`font-mono font-bold flex items-center ${
                    dis.wow_change_pct > 0 ? 'text-risk-high' : 'text-risk-low'
                  }`}
                >
                  {dis.wow_change_pct > 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {dis.wow_change_pct > 0 ? `+${dis.wow_change_pct}` : dis.wow_change_pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
