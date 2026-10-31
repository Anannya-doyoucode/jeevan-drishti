import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

interface ScrubberBarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  isLoading: boolean;
}

export const ScrubberBar: React.FC<ScrubberBarProps> = ({
  currentWeek,
  onWeekChange,
  isLoading
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onWeekChange(currentWeek >= 52 ? 1 : currentWeek + 1);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentWeek, onWeekChange]);

  const getWeekContext = (wk: number) => {
    if (wk >= 14 && wk <= 22) return "Pre-Monsoon Dry Heat Phase (Thermal Stress Risk)";
    if (wk >= 23 && wk <= 35) return "Southwest Monsoon Active Window (Water-Borne / Flood Peak)";
    if (wk >= 36 && wk <= 46) return "Post-Monsoon Transition Window (Vector-Borne Dengue Peak)";
    return "Winter Recedence / Low Transmission Baseline";
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/90 mb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-govTeal-50 text-govTeal-600 border border-govTeal-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                Epidemiological Surveillance Timeline
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-govNavy-800 text-govTeal-300">
                Week {currentWeek} of 52
              </span>
              {isLoading && (
                <span className="text-xs text-govTeal-600 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-govTeal-500 animate-ping"></span>
                  Fetching Week Data...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {getWeekContext(currentWeek)}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Step Back 1 Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-govNavy-800 text-govTeal-300 hover:bg-govNavy-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Scrub</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play Outbreak Playback</span>
              </>
            )}
          </button>
          <button
            onClick={() => onWeekChange(Math.min(52, currentWeek + 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Step Forward 1 Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onWeekChange(44)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 hover:bg-slate-50 text-slate-700"
            title="Jump to Current Observed Week (Week 44)"
          >
            Current (W44)
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative pt-2 pb-1">
        <input
          type="range"
          min="1"
          max="52"
          value={currentWeek}
          onChange={(e) => onWeekChange(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-govTeal-500 hover:accent-govTeal-600"
        />
        {/* Milestone Tick Marks */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1.5 select-none">
          <span>W01 (Jan)</span>
          <span className="text-amber-600 font-semibold">W18 (Thermal Stress)</span>
          <span className="text-blue-600 font-semibold">W28 (Monsoon Peak)</span>
          <span className="text-risk-high font-bold underline">W44 (Dengue Surge)</span>
          <span>W52 (Dec)</span>
        </div>
      </div>
    </div>
  );
};
