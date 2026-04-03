export function HealthStrip() {
  return (
    <div className="h-8 bg-cyber-deep/30 border-t border-cyber-glass-border px-6 flex items-center gap-6 text-[10px]" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-3">
        <span className="text-cyber-text-tertiary uppercase tracking-wider">CPU</span>
        <span className="font-mono text-cyber-green">42°C</span>
      </div>

      <div className="h-3 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.3), transparent)' }} />

      <div className="flex items-center gap-3">
        <span className="text-cyber-text-tertiary uppercase tracking-wider">GPU</span>
        <span className="font-mono text-cyber-text-secondary">18%</span>
      </div>

      <div className="h-3 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.3), transparent)' }} />

      <div className="flex items-center gap-3">
        <span className="text-cyber-text-tertiary uppercase tracking-wider">MEM</span>
        <span className="font-mono text-cyber-text-secondary">31/48GB</span>
      </div>

      <div className="h-3 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.3), transparent)' }} />

      <div className="flex items-center gap-3">
        <span className="text-cyber-text-tertiary uppercase tracking-wider">NET</span>
        <span className="font-mono text-cyber-cyan">STABLE</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyber-green glow-green" />
        <span className="font-mono text-cyber-green uppercase tracking-wider">AUDIT REC</span>
      </div>
    </div>
  );
}
