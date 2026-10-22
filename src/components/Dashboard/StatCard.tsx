import React from 'react';

interface StatCardProps {
  title: string;
  count: number;
  total?: number;
  percentage?: number;
  icon: React.ReactNode;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  subtext?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  count,
  total,
  percentage,
  icon,
  colorClass,
  bgLightClass,
  borderClass,
  subtext,
  onClick,
}: StatCardProps) {
  const calculatedPercent = percentage ?? (total && total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border ${borderClass} shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${bgLightClass} ${colorClass} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{count}</span>
          {total !== undefined && (
            <span className="text-xs text-slate-400 font-medium ml-1">/ {total} Siswa</span>
          )}
        </div>
        {calculatedPercent > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgLightClass} ${colorClass}`}>
            {calculatedPercent}%
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          {subtext}
        </p>
      )}

      {/* Subtle indicator bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(calculatedPercent, 100)}%` }}
        />
      </div>
    </div>
  );
}
