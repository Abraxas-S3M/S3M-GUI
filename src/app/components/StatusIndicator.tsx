interface StatusIndicatorProps {
  status: 'operational' | 'caution' | 'critical' | 'degraded';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  operational: { color: '#05DF72', glow: 'rgba(5, 223, 114, 0.99)' },
  caution: { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.8)' },
  critical: { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.8)' },
  degraded: { color: '#8A5CFF', glow: 'rgba(138, 92, 255, 0.8)' }
};

const sizeConfig = {
  sm: { dot: 6, text: 10, blur: 12 },
  md: { dot: 8, text: 12, blur: 16 },
  lg: { dot: 10, text: 14, blur: 20 }
};

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const { color, glow } = statusConfig[status];
  const { dot, text, blur } = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full"
        style={{
          width: dot,
          height: dot,
          backgroundColor: color,
          boxShadow: `0 0 ${blur}px ${glow}`
        }}
      />
      {label && (
        <span
          className="uppercase tracking-wider font-semibold"
          style={{
            fontSize: text,
            color,
            textShadow: `0 0 ${blur}px ${glow}`
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
