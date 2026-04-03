const events = [
  { time: '14:18', label: 'IED report', severity: 'MEDIUM' as const },
  { time: '14:25', label: 'Naval Hormuz', severity: 'MEDIUM' as const },
  { time: '14:27', label: 'Port scan', severity: 'MEDIUM' as const },
  { time: '14:28', label: 'Bravo DEGRADED', severity: 'HIGH' as const },
  { time: '14:30', label: 'UAV-04 anomaly', severity: 'HIGH' as const },
  { time: '14:31', label: 'Phi-3 spike', severity: 'HIGH' as const },
  { time: '14:32', label: 'T-218 HOSTILE', severity: 'CRITICAL' as const },
  { time: '14:33', label: 'Drone spike', severity: 'HIGH' as const }
];

const severityColors = {
  MEDIUM: { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.6)' },
  HIGH: { color: '#FF6B35', glow: 'rgba(255, 107, 53, 0.6)' },
  CRITICAL: { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.8)' }
};

export function Timeline() {
  return (
    <div className="h-10 bg-cyber-deep/30 border-b border-cyber-glass-border px-4 overflow-x-auto" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center h-full gap-2">
        {events.map((event, i) => {
          const { color, glow } = severityColors[event.severity];

          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-cyber-glass/50 transition-all duration-300 cursor-pointer shrink-0"
              style={{
                border: `1px solid ${color}30`,
                background: `${color}08`
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${glow}`
                }}
              />
              <span className="font-mono text-[10px] text-cyber-text-tertiary">{event.time}</span>
              <span className="text-[11px] text-cyber-text-secondary">{event.label}</span>
              <span
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{
                  color,
                  textShadow: `0 0 8px ${glow}`
                }}
              >
                {event.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
