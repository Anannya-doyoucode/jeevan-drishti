import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { ForecastPoint } from '../types/api';
import { TrendingUp, AlertOctagon, HelpCircle, Calendar, ShieldCheck } from 'lucide-react';

interface ForecastDrawerProps {
  districtName: string;
  selectedDisease: string;
  onSelectDisease: (disease: string) => void;
  horizon: number;
  onSelectHorizon: (days: number) => void;
  trajectory: ForecastPoint[];
  advisoryText: string;
  isLoading: boolean;
  onOpenShap: () => void;
}

export const ForecastDrawer: React.FC<ForecastDrawerProps> = ({
  districtName,
  selectedDisease,
  onSelectDisease,
  horizon,
  onSelectHorizon,
  trajectory,
  advisoryText,
  isLoading,
  onOpenShap
}) => {
  const diseases = ['Dengue', 'Malaria', 'Cholera', 'Thermal Stress', 'Leptospirosis'];

  // Prepare data for Recharts composed chart
  const chartData = trajectory.map((p) => ({
    name: p.date_str,
    dayOffset: p.day_offset,
    predicted: p.predicted_cases,
    lower: p.lower_bound,
    upper: p.upper_bound,
    // For shaded uncertainty band: [lower, upper]
    uncertaintyRange: [p.lower_bound, p.upper_bound],
    isForecast: p.historical_or_forecast === 'FORECAST'
  }));

  const maxVal = Math.max(...trajectory.map(t => t.upper_bound), 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4 mb-5">
      {/* Header and Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-risk-high" />
              Probabilistic Caseload Trajectory & 95% Uncertainty Interval
            </h3>
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-govNavy-800 text-govTeal-300">
              {districtName}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Bayesian time-series projection with climate-lag interaction terms
          </p>
        </div>

        {/* Disease Entity and Horizon Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Disease entity tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            {diseases.map((dis) => (
              <button
                key={dis}
                onClick={() => onSelectDisease(dis)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedDisease.toLowerCase() === dis.toLowerCase()
                    ? 'bg-govNavy-800 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dis}
              </button>
            ))}
          </div>

          {/* Horizon pills: 7D, 14D, 30D */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => onSelectHorizon(h)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  horizon === h
                    ? 'bg-govTeal-500 text-govNavy-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>

          {/* Why Flagged SHAP Trigger */}
          <button
            onClick={onOpenShap}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-govTeal-50 hover:bg-govTeal-100 text-govTeal-700 border border-govTeal-300 flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-govTeal-600" />
            <span>Why Flagged?</span>
          </button>
        </div>
      </div>

      {/* Recharts Trajectory Graph */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="uncertaintyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E76F51" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E76F51" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748B' }}
              stroke="#CBD5E1"
            />
            <YAxis
              domain={[0, Math.ceil(maxVal * 1.15)]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              stroke="#CBD5E1"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-govNavy-800 text-white p-2.5 rounded-lg shadow-xl text-xs border border-govNavy-600">
                      <div className="font-bold text-govTeal-300 mb-1">
                        {data.name} {data.dayOffset === 0 ? '(Today)' : data.dayOffset > 0 ? `(+${data.dayOffset}d Forecast)` : `(${data.dayOffset}d Historical)`}
                      </div>
                      <div className="space-y-0.5 text-slate-200">
                        <div>
                          Predicted Caseload: <strong className="text-white font-mono">{data.predicted}</strong>
                        </div>
                        {data.isForecast && (
                          <div className="text-[11px] text-slate-400">
                            95% CI Range: <span className="text-govTeal-300 font-mono">[{data.lower} - {data.upper}]</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
              iconType="circle"
            />

            {/* Shaded 95% Uncertainty Interval Area */}
            <Area
              type="monotone"
              dataKey="upper"
              name="95% Upper Bound"
              stroke="#E76F51"
              strokeDasharray="4 4"
              fill="url(#uncertaintyGradient)"
            />
            <Area
              type="monotone"
              dataKey="lower"
              name="95% Lower Bound"
              stroke="#E76F51"
              strokeDasharray="4 4"
              fill="#FFFFFF"
            />

            {/* Median / Point Forecast Trajectory */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="Expected Caseload Trajectory"
              stroke="#0B1220"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0B1220' }}
              activeDot={{ r: 6, fill: '#2DD4BF', stroke: '#0B1220', strokeWidth: 2 }}
            />

            {/* Vertical demarcation line for Day 0 (Today) */}
            <ReferenceLine
              x={chartData.find(d => d.dayOffset === 0)?.name}
              stroke="#94A3B8"
              strokeDasharray="3 3"
              label={{ value: 'Today', fill: '#64748B', fontSize: 10, position: 'top' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Public Health Advisory Banner */}
      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-govTeal-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-slate-800">Operational Advisory & PHC Action: </span>
          <span className="text-slate-600 leading-relaxed">{advisoryText}</span>
        </div>
      </div>
    </div>
  );
};
