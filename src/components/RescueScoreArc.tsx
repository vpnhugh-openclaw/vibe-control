interface RescueScoreArcProps {
  score: number;
  size?: number;
}

export function RescueScoreArc({ score, size = 48 }: RescueScoreArcProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  // Interpolate violet→cyan based on score
  const hue = 252 + ((187 - 252) * score) / 100;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="hsl(var(--bg-active))"
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`hsl(${hue}, 80%, 60%)`}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-label tabular-nums font-semibold">
        {Math.round(score)}
      </span>
    </div>
  );
}
