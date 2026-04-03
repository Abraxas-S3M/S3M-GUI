interface ConfidenceBadgeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function ConfidenceBadge({ value, size = 'md' }: ConfidenceBadgeProps) {
  const getColor = () => {
    if (value >= 80) return { color: '#05DF72', glow: 'rgba(5, 223, 114, 0.99)' };
    if (value >= 60) return { color: '#00B8FF', glow: 'rgba(0, 184, 255, 0.8)' };
    if (value >= 40) return { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.8)' };
    return { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.8)' };
  };

  const { color, glow} = getColor();
  const fontSize = size === 'sm' ? 10 : 12;
  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          boxShadow: `0 0 12px ${glow}`
        }}
      />
      <span
        className="font-mono font-semibold"
        style={{
          fontSize,
          color,
          textShadow: `0 0 10px ${glow}`
        }}
      >
        {value}%
      </span>
    </div>
  );
}
