import React, { useState } from 'react';
import { SimulationRunRequest, SimulationRunResponse } from '../types/api';
import { postSimulation } from '../services/api';
import {
  Layers,
  X,
  Play,
  Thermometer,
  CloudRain,
  ShieldAlert,
  Droplets,
  TrendingDown,
  Bed,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  districtId: string;
  disease: string;
}

export const WhatIfSandbox: React.FC<WhatIfModalProps> = ({
  isOpen,
  onClose,
  districtId,
  disease
}) => {
  const [tempShift, setTempShift] = useState<number>(1.5);
  const [rainShift, setRainShift] = useState<number>(20.0);
  const [fogging, setFogging] = useState<number>(65);
  const [chlorination, setChlorination] = useState<number>(50);
  const [simResult, setSimResult] = useState<SimulationRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const res = await postSimulation({
        temp_shift: tempShift,
        rain_shift: rainShift,
        fogging_coverage: fogging,
        chlorination_coverage: chlorination,
        district_id: districtId,
        disease: disease
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-govNavy-800 text-white px-6 py-4 flex items-center justify-between border-b border-govNavy-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-govTeal-500/20 text-govTeal-300 border border-govTeal-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  What-If Counterfactual Policy Sandbox
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-govTeal-400/20 text-govTeal-300">
                  Scenario Simulator
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Stress-test climate anomalies against public health interventions in {districtId.toUpperCase()}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Sliders Grid: 2 Climate Forcings + 2 Health Interventions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Temp Shift */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  Temperature Anomaly
                </span>
                <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {tempShift > 0 ? `+${tempShift}` : tempShift}°C
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={tempShift}
                onChange={(e) => setTempShift(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>-5.0°C</span>
                <span>0.0°C Baseline</span>
                <span>+5.0°C Extreme</span>
              </div>
            </div>

            {/* 2. Rain Shift */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  Precipitation Shock
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {rainShift > 0 ? `+${rainShift}` : rainShift}%
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={rainShift}
                onChange={(e) => setRainShift(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>-50% Drought</span>
                <span>0% Normal</span>
                <span>+100% Cloudburst</span>
              </div>
            </div>

            {/* 3. Fogging Coverage */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-govTeal-600" />
                  PHC ULV Fogging Coverage
                </span>
                <span className="text-xs font-mono font-bold text-govTeal-700 bg-govTeal-50 px-2 py-0.5 rounded border border-govTeal-200">
                  {fogging}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fogging}
                onChange={(e) => setFogging(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-govTeal-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0% Nil</span>
                <span>50% Sub-centers</span>
                <span>100% Saturation</span>
              </div>
            </div>

            {/* 4. Chlorination Coverage */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  Super-Chlorination Coverage
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {chlorination}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={chlorination}
                onChange={(e) => setChlorination(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0% Standard</span>
                <span>50% High-risk</span>
                <span>100% All Water Sources</span>
              </div>
            </div>
          </div>

          {/* Trigger Simulation Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl bg-govNavy-800 hover:bg-govNavy-700 text-govTeal-300 font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-govTeal-400" />
                  <span>Computing Stochastic Projection...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-govTeal-400" />
                  <span>Simulate Policy Scenario</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Cards */}
          {simResult && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-[11px] text-emerald-700 font-bold">Cases Averted</div>
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    +{simResult.cases_averted}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    -{simResult.risk_score_reduction_pct}% Caseload
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-[11px] text-blue-700 font-bold">Bed-Days Saved</div>
                  <div className="text-2xl font-black font-mono text-blue-800 flex items-center justify-center gap-1">
                    <Bed className="w-4 h-4 text-blue-600" />
                    {simResult.hospital_bed_days_saved}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">District Hospital Capacity</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-[11px] text-amber-700 font-bold">Economic Savings</div>
                  <div className="text-2xl font-black font-mono text-amber-800">
                    ₹{(simResult.estimated_cost_savings_inr / 100000).toFixed(1)}L
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold">Healthcare Costs Preserved</div>
                </div>

                <div className="p-3 rounded-xl bg-govTeal-50 border border-govTeal-200 text-center">
                  <div className="text-[11px] text-govTeal-700 font-bold">Net Caseload (30d)</div>
                  <div className="text-2xl font-black font-mono text-govNavy-900">
                    {simResult.simulated_caseload_30d}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">vs {simResult.baseline_caseload_30d} Baseline</div>
                </div>
              </div>

              {/* Trajectory Graph Comparison */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Unmitigated Baseline vs Counterfactual Trajectory
                </h4>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.trajectory} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date_str" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="baseline_cases"
                        name="Unmitigated Caseload"
                        stroke="#E76F51"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <Line
                        type="monotone"
                        dataKey="simulated_cases"
                        name="Simulated With Interventions"
                        stroke="#0D9488"
                        strokeWidth={2.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Description */}
              <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg leading-relaxed">
                <strong>Executive Assessment: </strong>
                {simResult.intervention_summary}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
