'use client';

interface CapacityScoreCircleProps {
  score: number;
  size?: number;
}

export default function CapacityScoreCircle({ score, size = 200 }: CapacityScoreCircleProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = () => {
    if (score < 40) return '#f97316'; // orange for recovery
    if (score >= 70) return '#10b981'; // emerald for deep work
    return '#3b82f6'; // blue for balanced
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="text-sm text-gray-500 mt-1">Capacity</div>
      </div>
    </div>
  );
}
