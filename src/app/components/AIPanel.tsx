import { Send, ChevronRight } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { useAppStore } from '../store';

interface AIPanelProps {
  isOpen: boolean;
}

export function AIPanel({ isOpen }: AIPanelProps) {
  const { toggleAiPanel } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="w-[288px] bg-cyber-deep/40 border-l border-cyber-glass-border flex flex-col" style={{ backdropFilter: 'blur(15px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-cyber-glass-border flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-cyber-green glow-green" />
        <span className="text-[13px] text-cyber-cyan font-display font-semibold tracking-[0.12em] uppercase">
          LIVE FEED / CHAT
        </span>
        <div className="flex-1" />
        <button
          onClick={toggleAiPanel}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-cyber-cyan/10 transition-all duration-300 group"
          style={{
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}
        >
          <ChevronRight
            className="w-4 h-4 text-cyber-cyan transition-all duration-300 group-hover:translate-x-0.5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.6))' }}
          />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* System message */}
        <div className="glass-panel rounded-xl p-3">
          <div className="text-[12px] text-cyber-text-primary leading-relaxed mb-3">
            Track T-218 identified as hostile. Fast mover with IFF failure detected in sector 7.
          </div>
          <div className="flex gap-2">
            <button className="text-[11px] text-cyber-cyan hover:text-cyber-blue transition-colors uppercase tracking-wider font-semibold">
              OPEN COP →
            </button>
          </div>
        </div>

        {/* Operator message */}
        <div className="p-3 border border-cyber-glass-border/30 rounded-xl">
          <div className="text-[12px] text-cyber-text-secondary leading-relaxed">
            What's the current threat assessment?
          </div>
        </div>

        {/* System response */}
        <div className="glass-panel rounded-xl p-3">
          <div className="text-[12px] text-cyber-text-primary leading-relaxed mb-3">
            Current composite risk: 47 (HIGH). Primary driver: Track T-218 hostile contact in approach vector.
          </div>
          <div className="flex gap-2">
            <button className="text-[11px] text-cyber-cyan hover:text-cyber-blue transition-colors uppercase tracking-wider font-semibold">
              RISK ENGINE →
            </button>
          </div>
        </div>

        {/* System message */}
        <div className="glass-panel rounded-xl p-3">
          <div className="text-[12px] text-cyber-text-primary leading-relaxed mb-3">
            Cyber anomaly detected on subnet 10.5.2.0/24. Possible unauthorized access attempt.
          </div>
          <div className="flex gap-2">
            <button className="text-[11px] text-cyber-cyan hover:text-cyber-blue transition-colors uppercase tracking-wider font-semibold">
              CYBER WORKSPACE →
            </button>
          </div>
        </div>

        {/* Operator message */}
        <div className="p-3 border border-cyber-glass-border/30 rounded-xl">
          <div className="text-[12px] text-cyber-text-secondary leading-relaxed">
            Show me readiness status for all units
          </div>
        </div>

        {/* System response */}
        <div className="glass-panel rounded-xl p-3">
          <div className="text-[12px] text-cyber-text-primary leading-relaxed mb-3">
            Overall readiness at 78%. 4 units fully operational, 2 units at reduced capacity. Details available in Readiness Workspace.
          </div>
          <div className="flex gap-2">
            <button className="text-[11px] text-cyber-cyan hover:text-cyber-blue transition-colors uppercase tracking-wider font-semibold">
              VIEW READINESS →
            </button>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyber-glass-border">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask, command, or query…"
            className="flex-1 glass-panel rounded-xl px-3 py-2 text-[12px] text-cyber-text-primary placeholder:text-cyber-text-tertiary focus:outline-none focus:border-cyber-cyan transition-colors"
            style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }}
          />
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: '#00F0FF',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
            }}
          >
            <Send className="w-4 h-4 text-cyber-void" />
          </button>
        </div>
      </div>
    </div>
  );
}
