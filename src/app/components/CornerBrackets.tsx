interface CornerBracketsProps {
  className?: string;
  color?: string;
  size?: number;
}

export function CornerBrackets({ className = '', color = '#00F0FF', size = 20 }: CornerBracketsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top Left */}
      <svg className="absolute top-0 left-0" width={size} height={size} style={{ opacity: 0.6, filter: `drop-shadow(0 0 4px ${color})` }}>
        <path d={`M ${size} 0 L 0 0 L 0 ${size}`} stroke={color} strokeWidth="2" fill="none" />
      </svg>

      {/* Top Right */}
      <svg className="absolute top-0 right-0" width={size} height={size} style={{ opacity: 0.6, filter: `drop-shadow(0 0 4px ${color})` }}>
        <path d={`M 0 0 L ${size} 0 L ${size} ${size}`} stroke={color} strokeWidth="2" fill="none" />
      </svg>

      {/* Bottom Left */}
      <svg className="absolute bottom-0 left-0" width={size} height={size} style={{ opacity: 0.6, filter: `drop-shadow(0 0 4px ${color})` }}>
        <path d={`M 0 0 L 0 ${size} L ${size} ${size}`} stroke={color} strokeWidth="2" fill="none" />
      </svg>

      {/* Bottom Right */}
      <svg className="absolute bottom-0 right-0" width={size} height={size} style={{ opacity: 0.6, filter: `drop-shadow(0 0 4px ${color})` }}>
        <path d={`M ${size} 0 L ${size} ${size} L 0 ${size}`} stroke={color} strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}
