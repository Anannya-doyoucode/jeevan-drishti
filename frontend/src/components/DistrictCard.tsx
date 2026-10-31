import React, { useState } from 'react';
import { DistrictMetadata } from '../types/api';
import { Bug, Droplets, Flame, Activity, Building, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface DistrictListProps {
  districts: DistrictMetadata[];
  selectedDistrictId: string;
  onSelectDistrict: (id: string) => void;
  isLoading: boolean;
}

export const DistrictCards: React.FC<DistrictListProps> = ({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  isLoading
}) => {
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');

  const filteredDistricts = districts.filter(d => {
    if (filter === 'ALL') return true;
    return d.current_risk_level === filter;
  });

  const getHazardBadge = (hazard: string) => {
    switch (hazard) {
      case 'Vector-Borne':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Bug className="w-3 h-3 text-orange-600" />
            Vector-Borne
          </span>
        );
      case 'Water-Borne':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Droplets className="w-3 h-3 text-blue-600" />
            Water-Borne
          </span>
        );
      case 'Thermal Stress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-3 h-3 text-amber-600" />
            Thermal Stress
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-risk-high text-white shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            High Alert
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-risk-moderate text-govNavy-900 shadow-sm">
            Moderate
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-risk-low text-white shadow-sm">
            Low Risk
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4">
      {/* Header and Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-govTeal-600" />
            Target Surveillance Districts ({districts.length})
          </h2>
          <p className="text-xs text-slate-500">
            High-density PHC reporting networks across Maharashtra
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === lvl
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl === 'ALL' ? 'All (7)' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of District Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredDistricts.map((d) => {
          const isSelected = d.id === selectedDistrictId;
          return (
            <div
              key={d.id}
              onClick={() => onSelectDistrict(d.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-govNavy-800 bg-slate-50/80 shadow-md ring-2 ring-govTeal-400/40'
                  : 'border-slate-200 hover:border-govTeal-300 hover:bg-slate-50/50 hover:shadow-sm'
              }`}
            >
              {/* Top Row: Name + Risk Badge */}
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {d.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {d.marathi_name} • {d.division}
                    </span>
                  </div>
                  {getRiskBadge(d.current_risk_level)}
                </div>

                {/* Dominant Hazard Tag */}
                <div className="mt-2 mb-2.5">
                  {getHazardBadge(d.dominant_hazard)}
                </div>

                {/* Hotspot ward */}
                <div className="text-[11px] text-slate-600 mb-2 truncate">
                  <span className="font-semibold text-slate-700">Cluster: </span>
                  {d.active_hotspot_ward}
                </div>
              </div>

              {/* Bottom PHC Coverage Gauge & Population */}
              <div className="pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">PHC Coverage ({d.phc_count} PHCs):</span>
                  <span className="font-bold text-govNavy-800 font-mono">
                    {d.phc_reporting_coverage_pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.phc_reporting_coverage_pct}%`,
                      backgroundColor:
                        d.phc_reporting_coverage_pct >= 95
                          ? '#34A853'
                          : d.phc_reporting_coverage_pct >= 90
                          ? '#2DD4BF'
                          : '#E9B949'
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(d.population / 1000000).toFixed(1)}M pop
                  </span>
                  <span>Elev: {d.elevation_m}m</span>
                </div>
              </div>

              {/* Selected indicator checkmark */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-govTeal-500 rounded-bl-lg"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
