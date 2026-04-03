interface CommandCardProps {
  children: React.ReactNode;
  accentColor?: string;
  title?: string;
  indicator?: React.ReactNode;
  className?: string;
}

export function CommandCard({ children, accentColor = '#00F0FF', title, indicator, className = '' }: CommandCardProps) {
  return (
    <div
      className={`glass-panel rounded-xl p-4 relative ${className}`}
      style={{
        boxShadow: accentColor ? `0 0 20px ${accentColor}20, inset 0 0 40px ${accentColor}05` : '0 0 20px rgba(0, 240, 255, 0.1)'
      }}
    >
      {title && (
        <div className="mb-4 flex items-center gap-2">
          {indicator && (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 rounded-sm"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 8px ${accentColor}80`
                  }}
                />
              ))}
            </div>
          )}
          <span
            className="text-[11px] uppercase tracking-[0.1em] font-semibold"
            style={{
              color: accentColor,
              textShadow: `0 0 10px ${accentColor}80`
            }}
          >
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
