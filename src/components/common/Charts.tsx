import React, { useState } from 'react';

interface AreaLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  fillColor?: string;
  height?: number;
  unit?: string;
  prefix?: string;
  decimals?: number;
}

export const AreaLineChart: React.FC<AreaLineChartProps> = ({
  data,
  color = '#06B6D4', // cyan-500
  fillColor = 'rgba(6, 182, 212, 0.15)',
  height = 180,
  unit = '',
  prefix = '',
  decimals = 0,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-500">
        No simulation data recorded
      </div>
    );
  }

  const padding = { top: 20, right: 15, bottom: 25, left: 45 };
  const width = 500;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yRange = maxVal === minVal ? 1 : maxVal - minVal;
  const yMin = Math.max(0, minVal - yRange * 0.1);
  const yMax = maxVal + yRange * 0.1;

  const getX = (index: number) => padding.left + (index / Math.max(1, data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

  // Path generator
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

  // Grid ticks
  const yTicks = [yMin, yMin + (yMax - yMin) * 0.5, yMax];

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {yTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-mono-numbers"
              >
                {prefix}
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick.toFixed(decimals)}
                {unit}
              </text>
            </g>
          );
        })}

        {/* Area & Line */}
        <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points & Interactive Hover targets */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.value);
          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              className="cursor-pointer"
            >
              {/* Invisible wider target for mouse capture */}
              <circle cx={x} cy={y} r="12" fill="transparent" />

              {/* Visible dot on hover or every few steps */}
              {(isHovered || data.length <= 15 || i === 0 || i === data.length - 1) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#FFFFFF' : color}
                  stroke={isHovered ? color : '#0F172A'}
                  strokeWidth="2"
                  className="transition-all"
                />
              )}

              {/* X-axis labels for first, mid, and last points */}
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <text
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono-numbers"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Active hover vertical crosshair */}
        {hoverIndex !== null && data[hoverIndex] && (
          <line
            x1={getX(hoverIndex)}
            y1={padding.top}
            x2={getX(hoverIndex)}
            y2={padding.top + innerHeight}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Floating tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          className="absolute pointer-events-none -top-2 transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded shadow-xl text-xs z-20 whitespace-nowrap"
          style={{
            left: `${((getX(hoverIndex)) / width) * 100}%`,
          }}
        >
          <div className="text-[10px] text-slate-400">{data[hoverIndex].label}</div>
          <div className="font-semibold text-white font-mono-numbers">
            {prefix}
            {data[hoverIndex].value.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
            {unit}
          </div>
        </div>
      )}
    </div>
  );
};

interface BarChartItem {
  name: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

interface HorizontalBarChartProps {
  data: BarChartItem[];
  maxVal?: number;
  unit?: string;
  prefix?: string;
  color?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  maxVal,
  unit = '',
  prefix = '',
  color = '#38BDF8',
}) => {
  const calculatedMax = maxVal || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2.5 w-full">
      {data.map((item, idx) => {
        const pct = Math.min(100, Math.max(4, (item.value / calculatedMax) * 100));
        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300 truncate max-w-[200px]">{item.name}</span>
              <span className="font-mono-numbers text-slate-200">
                {prefix}
                {item.value.toLocaleString()}
                {unit}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.highlight ? '#F59E0B' : color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{
  data: DonutSlice[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}> = ({ data, size = 160, centerText, centerSubtext }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1E293B"
          strokeWidth={strokeWidth}
        />
        {data.map((slice, i) => {
          const sliceFraction = slice.value / total;
          const strokeDasharray = `${sliceFraction * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += sliceFraction * circumference;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {(centerText || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerText && (
            <span className="text-lg font-bold text-white font-mono-numbers tracking-tight">
              {centerText}
            </span>
          )}
          {centerSubtext && (
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              {centerSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const ScoreGauge: React.FC<{ score: number; label: string; rating: string }> = ({
  score,
  label,
  rating,
}) => {
  const ratingColors: Record<string, string> = {
    Excellent: '#10B981', // emerald-500
    Effective: '#06B6D4', // cyan-500
    Moderate: '#F59E0B', // amber-500
    'Needs Improvement': '#F97316', // orange-500
    Poor: '#EF4444', // red-500
  };

  const color = ratingColors[rating] || '#06B6D4';

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            fill="transparent"
            stroke="#1E293B"
            strokeWidth="12"
          />
          <circle
            cx="72"
            cy="72"
            r="60"
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 377} 377`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white font-mono-numbers">
            {score}
          </span>
          <span className="text-[11px] text-slate-400 font-mono-numbers">/ 100</span>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-sm font-bold text-white tracking-wide">{rating.toUpperCase()}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
};

interface VelocityPoint {
  day: number;
  impressions: number;
  conversions: number;
  impressionVelocity: number; // day-over-day growth or rate
  conversionVelocity: number;
}

interface VelocitySparklineProps {
  data: VelocityPoint[];
  plateauDay?: number;
  height?: number;
}

export const VelocitySparkline: React.FC<VelocitySparklineProps> = ({
  data,
  plateauDay,
  height = 130,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const padding = { top: 15, right: 20, bottom: 25, left: 20 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Normalize impressions velocity (0-1) and conversion velocity (0-1)
  const maxImp = Math.max(...data.map((d) => d.impressions), 1);
  const minImp = Math.min(...data.map((d) => d.impressions), 0);
  const maxConv = Math.max(...data.map((d) => d.conversions), 1);
  const minConv = Math.min(...data.map((d) => d.conversions), 0);

  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * innerW;
  const getYImp = (val: number) => padding.top + innerH - ((val - minImp) / Math.max(1, maxImp - minImp)) * innerH;
  const getYConv = (val: number) => padding.top + innerH - ((val - minConv) / Math.max(1, maxConv - minConv)) * innerH;

  const impPath = `M ${data.map((d, i) => `${getX(i)},${getYImp(d.impressions)}`).join(' L ')}`;
  const convPath = `M ${data.map((d, i) => `${getX(i)},${getYConv(d.conversions)}`).join(' L ')}`;

  const plateauX = plateauDay ? getX(Math.min(data.length - 1, Math.max(0, plateauDay - 1))) : null;

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="grad-vel-imp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-vel-conv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Plateau Region if detected */}
        {plateauX !== null && (
          <g>
            <rect
              x={plateauX}
              y={padding.top}
              width={padding.left + innerW - plateauX}
              height={innerH}
              fill="#F59E0B"
              fillOpacity="0.07"
            />
            <line
              x1={plateauX}
              y1={padding.top}
              x2={plateauX}
              y2={padding.top + innerH}
              stroke="#F59E0B"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <text
              x={plateauX + 6}
              y={padding.top + 10}
              className="text-[9px] fill-amber-400 font-mono font-semibold"
            >
              Growth Plateau Zone
            </text>
          </g>
        )}

        {/* Horizontal base guides */}
        <line
          x1={padding.left}
          y1={padding.top + innerH}
          x2={padding.left + innerW}
          y2={padding.top + innerH}
          stroke="#1E293B"
          strokeWidth="1"
        />

        {/* Areas */}
        <path
          d={`${impPath} L ${getX(data.length - 1)},${padding.top + innerH} L ${getX(0)},${padding.top + innerH} Z`}
          fill="url(#grad-vel-imp)"
        />
        <path
          d={`${convPath} L ${getX(data.length - 1)},${padding.top + innerH} L ${getX(0)},${padding.top + innerH} Z`}
          fill="url(#grad-vel-conv)"
        />

        {/* Curves */}
        <path d={impPath} fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
        <path d={convPath} fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive hover targets */}
        {data.map((d, i) => {
          const x = getX(i);
          const yImp = getYImp(d.impressions);
          const yConv = getYConv(d.conversions);
          const isHovered = hoverIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} className="cursor-pointer">
              <circle cx={x} cy={yConv} r="10" fill="transparent" />
              {isHovered && (
                <>
                  <circle cx={x} cy={yImp} r="4" fill="#06B6D4" stroke="#0F172A" strokeWidth="2" />
                  <circle cx={x} cy={yConv} r="4.5" fill="#A855F7" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}
              {/* Milestone tick labels */}
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono-numbers"
                >
                  Day {d.day}
                </text>
              )}
            </g>
          );
        })}

        {hoverIdx !== null && (
          <line
            x1={getX(hoverIdx)}
            y1={padding.top}
            x2={getX(hoverIdx)}
            y2={padding.top + innerH}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoverIdx !== null && data[hoverIdx] && (
        <div
          className="absolute pointer-events-none -top-1 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs z-30 transform -translate-x-1/2 -translate-y-full whitespace-nowrap space-y-1"
          style={{ left: `${(getX(hoverIdx) / width) * 100}%` }}
        >
          <div className="text-[10px] text-slate-400 font-mono font-bold">
            Flight Day {data[hoverIdx].day}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Impression Velocity:</span>
            <span className="font-mono-numbers font-bold text-cyan-300">
              {data[hoverIdx].impressions.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-slate-300">Conversion Velocity:</span>
            <span className="font-mono-numbers font-bold text-purple-300">
              {data[hoverIdx].conversions.toLocaleString()} conv
            </span>
          </div>
          {plateauDay && data[hoverIdx].day >= plateauDay && (
            <div className="text-[10px] text-amber-400 font-semibold pt-0.5 border-t border-slate-800">
              ⚠️ In Growth Plateau Phase (Saturation)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

