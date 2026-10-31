import React, { useState } from 'react';
import { MAHARASHTRA_DISTRICT_GEOS, DistrictGeoFeature } from '../data/maharashtraGeo';
import { DistrictMetadata } from '../types/api';
import { MapPin, AlertCircle, Shield, Droplets, Flame, Bug } from 'lucide-react';

interface MapViewProps {
  districts: DistrictMetadata[];
  selectedDistrictId: string;
  onSelectDistrict: (id: string) => void;
  isLoading: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  isLoading
}) => {
  const [hoveredGeo, setHoveredGeo] = useState<DistrictGeoFeature | null>(null);

  const getDistrictMeta = (id: string): DistrictMetadata | undefined => {
    return districts.find(d => d.id === id);
  };

  const getFillColor = (geo: DistrictGeoFeature): string => {
    if (!geo.isTarget) return '#E2E8F0'; // Non-target background district
    const meta = getDistrictMeta(geo.id);
    if (!meta) return '#94A3B8'; // Missing Data Slate

    switch (meta.current_risk_level) {
      case 'HIGH':
        return '#E76F51'; // Coral
      case 'MODERATE':
        return '#E9B949'; // Yellow
      case 'LOW':
        return '#34A853'; // Green
      default:
        return '#94A3B8';
    }
  };

  const getHazardIcon = (hazard: string) => {
    switch (hazard) {
      case 'Vector-Borne':
        return <Bug className="w-3.5 h-3.5 text-orange-500" />;
      case 'Water-Borne':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'Thermal Stress':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4 relative overflow-hidden flex flex-col h-full">
      {/* Title & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-high animate-pulse"></span>
            Maharashtra Outbreak Surveillance Map
          </h2>
          <p className="text-xs text-slate-500">
            Real-time multi-hazard risk choropleth & active epicenters
          </p>
        </div>

        {/* Risk Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-high"></span>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-moderate"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-low"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-missing"></span>
            <span>Context / Safe</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 min-h-[380px] w-full flex items-center justify-center bg-gradient-to-b from-slate-50/50 to-slate-100/30 rounded-lg border border-slate-100 p-2">
        <svg
          viewBox="100 60 640 500"
          className="w-full h-full max-h-[460px] drop-shadow-sm select-none"
        >
          {/* Base State Boundary / Surrounding districts */}
          <g className="transition-all duration-300">
            {MAHARASHTRA_DISTRICT_GEOS.map((geo) => {
              const isSelected = geo.id === selectedDistrictId;
              const meta = getDistrictMeta(geo.id);
              const fillColor = getFillColor(geo);
              const isHighRisk = meta?.current_risk_level === 'HIGH';

              return (
                <g key={geo.id} className="cursor-pointer group">
                  <path
                    d={geo.svgPath}
                    fill={fillColor}
                    fillOpacity={geo.isTarget ? (isSelected ? 0.95 : 0.82) : 0.4}
                    stroke={isSelected ? '#0B1220' : '#FFFFFF'}
                    strokeWidth={isSelected ? 2.8 : (geo.isTarget ? 1.6 : 0.8)}
                    className="transition-all duration-200 hover:fill-opacity-100"
                    onClick={() => geo.isTarget && onSelectDistrict(geo.id)}
                    onMouseEnter={() => setHoveredGeo(geo)}
                    onMouseLeave={() => setHoveredGeo(null)}
                  />

                  {/* District Text Label */}
                  {geo.isTarget && (
                    <text
                      x={geo.centerX}
                      y={geo.centerY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[9px] font-bold pointer-events-none select-none ${
                        isSelected ? 'fill-govNavy-900 font-extrabold' : 'fill-slate-800'
                      }`}
                      style={{ textShadow: '0 1px 2px rgba(255,255,255,0.85)' }}
                    >
                      {geo.name}
                    </text>
                  )}

                  {/* Hotspot Radar Ring and Blinking Beacon for High Risk Zones */}
                  {geo.isTarget && isHighRisk && geo.hotspotX && geo.hotspotY && (
                    <g transform={`translate(${geo.hotspotX}, ${geo.hotspotY})`} pointerEvents="none">
                      {/* Animated Radar Pulse Ring */}
                      <circle
                        r="12"
                        className="fill-risk-high/20 stroke-risk-high/80 radar-ring"
                        strokeWidth="1.5"
                      />
                      <circle
                        r="20"
                        className="fill-none stroke-risk-high/40 radar-ring"
                        strokeWidth="1"
                        style={{ animationDelay: '0.8s' }}
                      />
                      {/* Inner Blinking Marker */}
                      <circle
                        r="4"
                        className="fill-risk-high stroke-white stroke-2 beacon-pulse"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredGeo && hoveredGeo.isTarget && (
          <div
            className="absolute bottom-3 left-3 bg-govNavy-800/95 text-white p-3 rounded-xl shadow-xl border border-govNavy-600 text-xs max-w-xs pointer-events-none backdrop-blur-sm z-20"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-sm text-govTeal-300">
                {hoveredGeo.name} ({hoveredGeo.marathiName})
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                getDistrictMeta(hoveredGeo.id)?.current_risk_level === 'HIGH' ? 'bg-risk-high text-white' :
                getDistrictMeta(hoveredGeo.id)?.current_risk_level === 'MODERATE' ? 'bg-risk-moderate text-govNavy-900' : 'bg-risk-low text-white'
              }`}>
                {getDistrictMeta(hoveredGeo.id)?.current_risk_level} RISK
              </span>
            </div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Primary Hazard:</span>
                <span className="font-semibold text-slate-100 flex items-center gap-1">
                  {getHazardIcon(getDistrictMeta(hoveredGeo.id)?.dominant_hazard || '')}
                  {getDistrictMeta(hoveredGeo.id)?.dominant_hazard}
                </span>
              </div>
              <div>
                <span className="text-slate-400">PHC Reporting Coverage:</span>{' '}
                <span className="font-semibold text-govTeal-400">
                  {getDistrictMeta(hoveredGeo.id)?.phc_reporting_coverage_pct}%
                </span>
              </div>
              {hoveredGeo.hotspotLabel && (
                <div className="pt-1 text-amber-300 font-medium text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-risk-high" />
                  Epicenter: {hoveredGeo.hotspotLabel}
                </div>
              )}
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-govNavy-700 text-[10px] text-slate-400 italic">
              Click district polygon to inspect surveillance dashboard
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-govTeal-600" />
          Active Focus: <strong className="text-slate-800">{getDistrictMeta(selectedDistrictId)?.name || 'Pune'}</strong>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          7 Priority Surveillance Zones
        </span>
      </div>
    </div>
  );
};
