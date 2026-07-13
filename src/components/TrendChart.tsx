import React from 'react';

interface TrendChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
}

export default function TrendChart({ data, maxValue, height = 160 }: TrendChartProps) {
  if (data.length === 0) return null;

  const ceiling = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const barGap = 8;
  const labelHeight = 24;
  const valueHeight = 16;
  const chartHeight = height - labelHeight - valueHeight;
  const barWidth = Math.max(16, Math.min(48, (600 - barGap * data.length) / data.length));

  // Map value to a zinc shade class
  const getBarFill = (ratio: number): string => {
    if (ratio >= 0.9) return '#18181b';       // zinc-900 / black
    if (ratio >= 0.7) return '#3f3f46';       // zinc-700
    if (ratio >= 0.5) return '#71717a';       // zinc-500
    if (ratio >= 0.3) return '#a1a1aa';       // zinc-400
    return '#d4d4d8';                          // zinc-300
  };

  const totalWidth = data.length * (barWidth + barGap) - barGap;

  return (
    <div className="border border-black p-6 bg-[#fafafa] w-full overflow-x-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${totalWidth + 24} ${height}`}
        preserveAspectRatio="xMidYMax meet"
        className="block"
      >
        {/* Dashed grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={0}
            x2={totalWidth + 24}
            y1={valueHeight + chartHeight * (1 - frac)}
            y2={valueHeight + chartHeight * (1 - frac)}
            stroke="#e4e4e7"
            strokeDasharray="4 4"
          />
        ))}

        {/* Baseline */}
        <line
          x1={0}
          x2={totalWidth + 24}
          y1={valueHeight + chartHeight}
          y2={valueHeight + chartHeight}
          stroke="#18181b"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const ratio = ceiling > 0 ? d.value / ceiling : 0;
          const barH = Math.max(2, ratio * chartHeight);
          const x = 12 + i * (barWidth + barGap);
          const y = valueHeight + chartHeight - barH;

          return (
            <g key={i}>
              {/* Value label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={9}
                fontFamily="monospace"
                fill="#71717a"
              >
                {d.value}
              </text>

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={getBarFill(ratio)}
                stroke="#18181b"
                strokeWidth={1}
              />

              {/* Label below baseline */}
              <text
                x={x + barWidth / 2}
                y={valueHeight + chartHeight + 14}
                textAnchor="middle"
                fontSize={9}
                fontFamily="monospace"
                fill="#18181b"
                style={{ textTransform: 'uppercase' }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
