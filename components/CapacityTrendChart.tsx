'use client';

interface CheckInData {
  date: Date;
  energy: number;
  sleep: number;
  stress: number;
  capacityScore: number;
}

interface CapacityTrendChartProps {
  data: CheckInData[];
}

export default function CapacityTrendChart({ data }: CapacityTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p>No check-in history yet</p>
        <p className="text-sm mt-2">Complete check-ins for 7 days to see your trend</p>
      </div>
    );
  }

  // Sort data by date (oldest first for chart)
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = 10;
  const minValue = 0;
  const xStep = chartWidth / Math.max(sortedData.length - 1, 1);

  // Generate points for each metric
  const generatePoints = (getValue: (d: CheckInData) => number) => {
    return sortedData
      .map((d, i) => {
        const x = padding.left + i * xStep;
        const value = getValue(d);
        // Ensure value is a valid number, default to 0 if not
        const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        const y = padding.top + chartHeight - (safeValue / maxValue) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const energyPoints = generatePoints((d) => d.energy ?? 0);
  const sleepPoints = generatePoints((d) => d.sleep ?? 0);
  const stressPoints = generatePoints((d) => d.stress ?? 0);

  // Format date for display
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Energy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Sleep</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Stress</span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '600px' }}
        >
          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((value) => {
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Energy line */}
          <polyline
            points={energyPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Energy points */}
          {sortedData.map((d, i) => {
            const x = padding.left + i * xStep;
            const energyValue = d.energy ?? 0;
            const y =
              padding.top + chartHeight - (energyValue / maxValue) * chartHeight;
            return (
              <circle
                key={`energy-${i}`}
                cx={x}
                cy={isNaN(y) ? 0 : y}
                r="5"
                fill="#10b981"
                className="hover:r-7 transition-all cursor-pointer"
              >
                <title>{`Energy: ${energyValue}`}</title>
              </circle>
            );
          })}

          {/* Sleep line */}
          <polyline
            points={sleepPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sleep points */}
          {sortedData.map((d, i) => {
            const x = padding.left + i * xStep;
            const sleepValue = d.sleep ?? 0;
            const y =
              padding.top + chartHeight - (sleepValue / maxValue) * chartHeight;
            return (
              <circle
                key={`sleep-${i}`}
                cx={x}
                cy={isNaN(y) ? 0 : y}
                r="5"
                fill="#3b82f6"
                className="hover:r-7 transition-all cursor-pointer"
              >
                <title>{`Sleep: ${sleepValue}`}</title>
              </circle>
            );
          })}

          {/* Stress line */}
          <polyline
            points={stressPoints}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Stress points */}
          {sortedData.map((d, i) => {
            const x = padding.left + i * xStep;
            const stressValue = d.stress ?? 0;
            const y =
              padding.top + chartHeight - (stressValue / maxValue) * chartHeight;
            return (
              <circle
                key={`stress-${i}`}
                cx={x}
                cy={isNaN(y) ? 0 : y}
                r="5"
                fill="#ef4444"
                className="hover:r-7 transition-all cursor-pointer"
              >
                <title>{`Stress: ${stressValue}`}</title>
              </circle>
            );
          })}

          {/* X-axis labels (dates) */}
          {sortedData.map((d, i) => {
            const x = padding.left + i * xStep;
            return (
              <text
                key={`date-${i}`}
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {formatDate(d.date)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Avg Energy</div>
          <div className="text-2xl font-bold text-emerald-600">
            {(
              sortedData.reduce((sum, d) => sum + d.energy, 0) /
              sortedData.length
            ).toFixed(1)}
          </div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Avg Sleep</div>
          <div className="text-2xl font-bold text-blue-600">
            {(
              sortedData.reduce((sum, d) => sum + d.sleep, 0) /
              sortedData.length
            ).toFixed(1)}
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Avg Stress</div>
          <div className="text-2xl font-bold text-red-600">
            {(
              sortedData.reduce((sum, d) => sum + d.stress, 0) /
              sortedData.length
            ).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
