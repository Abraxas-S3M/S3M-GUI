interface ProgressBarProps {
  value: number;
  severity: 'operational' | 'caution' | 'critical';
  height?: number;
}

const severityColors = {
  operational: { color: '#05DF72', glow: 'rgba(5, 223, 114, 0.6)' },
  caution: { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.6)' },
  critical: { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.6)' }
};

export function ProgressBar({ value, severity, height = 4 }: ProgressBarProps) {
  const { color, glow } = severityColors[severity];

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{
        height: `${height}px`,
        backgroundColor: 'rgba(28, 37, 51, 0.4)',
        border: '1px solid rgba(0, 240, 255, 0.15)'
      }}
    >
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
          boxShadow: `0 0 16px ${glow}, inset 0 0 8px ${glow}`,
          filter: `brightness(1.2)`
        }}
      />
    </div>
  );
}
