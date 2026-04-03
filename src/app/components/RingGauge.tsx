interface RingGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  severity: 'operational' | 'caution' | 'critical';
}

const severityColors = {
  operational: { color: '#05DF72', glow: 'rgba(5, 223, 114, 0.8)' },
  caution: { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.8)' },
  critical: { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.8)' }
};

export function RingGauge({ value, size = 150, strokeWidth = 8, label, severity }: RingGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const { color, glow } = severityColors[severity];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Outer glow ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(28, 37, 51, 0.6)"
          strokeWidth={strokeWidth}
        />

        {/* Value arc with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 24px ${glow})`,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>

      {/* Center content with glow */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-display text-[32px] font-bold leading-none tracking-wider"
          style={{
            color,
            textShadow: `0 0 20px ${glow}, 0 0 40px ${glow}`
          }}
        >
          {value}
        </div>
        {label && (
          <div
            className="text-[10px] uppercase tracking-[0.15em] mt-2 font-semibold"
            style={{
              color: '#A0D0E0',
              textShadow: '0 0 8px rgba(160, 208, 224, 0.5)'
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
