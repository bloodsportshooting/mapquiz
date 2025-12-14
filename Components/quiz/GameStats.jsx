import React from 'react';
import { Clock, Target, Percent } from 'lucide-react';

export default function GameStats({ time, correct, total, showPercentage = true }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6 md:gap-10">
      {/* Timer */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Zeit</p>
          <p className="text-xl font-semibold text-slate-800 tabular-nums">{formatTime(time)}</p>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Punkte</p>
          <p className="text-xl font-semibold text-slate-800">
            <span className="text-emerald-600">{correct}</span>
            <span className="text-slate-400">/{total}</span>
          </p>
        </div>
      </div>

      {/* Percentage */}
      {showPercentage && (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Quote</p>
            <p className="text-xl font-semibold text-blue-600">{percentage}%</p>
          </div>
        </div>
      )}
    </div>
  );
}