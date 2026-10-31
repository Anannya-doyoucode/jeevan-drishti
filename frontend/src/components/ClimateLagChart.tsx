import React from 'react';
import { ClimateObservationsResponse } from '../types/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { CloudRain, Thermometer, Droplets, Clock, Info } from 'lucide-react';

interface ClimateLagChartProps {
  data: ClimateObservationsResponse | null;
  isLoading: boolean;
}

export const ClimateLagChart: React.FC<ClimateLagChartProps> = ({ data, isLoading }) => {
  if (!data) return null;

  // Format data points for composed chart
  const chartPoints = data.observations.map((obs) => ({
    date: obs.date.substring(5), // MM-DD
    rainfall: obs.rainfall_mm,
    rainLag7: obs.rainfall_lag_7d,
    rainLag21: obs.rainfall_lag_21d,
    tempMax: obs.temp_max_c,
    tempMin: obs.temp_min_c,
    humidity: obs.humidity_pct
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-4 mb-5">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              Climate Observations & Lag-Aligned Incubation Windows
            </h3>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              21-Day Lag Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Precipitation and thermal thresholds mapped to vector pupation and pathogen survival
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span>30d Rain: <strong>{data.summary_rain_30d_mm} mm</strong></span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-600" />
            <span>Avg Temp: <strong>{data.avg_temp_c}°C</strong></span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-teal-600" />
            <span>RH: <strong>{data.avg_humidity_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Composed Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
            <YAxis
              yAxisId="rain"
              orientation="left"
              tick={{ fontSize: 10, fill: '#3B82F6' }}
              label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3B82F6' }}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              domain={[15, 45]}
              tick={{ fontSize: 10, fill: '#F97316' }}
              label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#F97316' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-govNavy-800 text-white p-2.5 rounded-lg text-xs shadow-xl border border-govNavy-600">
                      <div className="font-bold text-govTeal-300 mb-1">Date: {label}</div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="text-blue-300">Daily Rain: {payload[0]?.value} mm</div>
                        <div className="text-orange-300">Max Temp: {payload[1]?.value}°C</div>
                        <div className="text-teal-300">Humidity: {payload[2]?.value}%</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {/* Daily Rainfall Bar */}
            <Bar yAxisId="rain" dataKey="rainfall" name="Observed Daily Rain (mm)" fill="#60A5FA" radius={[2, 2, 0, 0]} />

            {/* 21d Rain Lag Curve */}
            <Line yAxisId="rain" type="monotone" dataKey="rainLag21" name="21-Day Rain Lag (mm)" stroke="#2563EB" strokeWidth={1.8} dot={false} />

            {/* Max Temperature Line */}
            <Line yAxisId="temp" type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#EA580C" strokeWidth={2} dot={false} />

            {/* Humidity Line */}
            <Line yAxisId="temp" type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#14B8A6" strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Lag Window Explanation Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="flex items-center gap-1 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-govTeal-600" />
          <strong>Entomological Timeline: </strong>
          Rain (Day 0) → Puddle formation (Day 5) → Larval pupation (Day 12) → Dengue transmission spike (Day 21)
        </span>
        <span className="text-govTeal-700 font-semibold font-mono">
          Alignment: 21-Day Lag Optimal Correlation (R = 0.81)
        </span>
      </div>
    </div>
  );
};
