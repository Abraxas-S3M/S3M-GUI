import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useConnectionStore } from '../connectionStore';
import { useAppStore } from '../store';
import { StatusIndicator } from './StatusIndicator';

export function TopBar() {
  const navigate = useNavigate();
  const {
    currentTime,
    language,
    setLanguage,
    aiPanelOpen,
    toggleAiPanel,
    backendEvolutionPanelOpen,
    toggleBackendEvolutionPanel,
    selectedDemoRoomSelection,
  } = useAppStore();
  const apiStatus = useConnectionStore((state) => state.apiStatus);

  const connectionStyle =
    apiStatus === 'healthy'
      ? { background: '#05DF72', glow: 'rgba(5, 223, 114, 0.99)' }
      : apiStatus === 'degraded'
        ? { background: '#FFB800', glow: 'rgba(255, 184, 0, 0.8)' }
        : apiStatus === 'unavailable'
          ? { background: '#FF3366', glow: 'rgba(255, 51, 102, 0.8)' }
          : { background: '#7c8596', glow: 'rgba(124, 133, 150, 0.8)' };

  return (
    <div className="h-16 bg-cyber-deep/40 border-b border-cyber-glass-border flex items-center px-6 gap-6" style={{ backdropFilter: 'blur(15px)' }}>
      {/* Brand */}
      <div className="font-display text-[22px] font-bold tracking-[0.15em] text-cyber-cyan" style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.8)' }}>
        ABRAXAS S3M
      </div>

      <div className="flex-1" />

      {selectedDemoRoomSelection && (
        <div className="px-2 py-1 rounded text-[10px] uppercase tracking-wider text-cyber-text-tertiary" style={{
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          {selectedDemoRoomSelection.trackName} · {selectedDemoRoomSelection.pacing}
        </div>
      )}

      <button
        onClick={() => navigate('/demo-room')}
        className="px-3 py-1 rounded-lg transition-all duration-300 text-[11px] font-semibold uppercase tracking-wider text-cyber-text-tertiary hover:text-cyber-cyan"
        style={{
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}
        title={selectedDemoRoomSelection ? `Current theater: ${selectedDemoRoomSelection.theater}` : 'Open Demo Room'}
      >
        Change Theater
      </button>

      {/* Status Indicators */}
      <div className="flex items-center gap-4">
        <StatusIndicator status="operational" label="ONLINE" size="sm" />

        <div className="px-3 py-1 rounded-full" style={{
          background: 'rgba(0, 184, 219, 0.1)',
          border: '1px solid rgba(0, 184, 219, 0.3)',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
        }}>
          <span className="text-[12px] text-cyber-blue uppercase tracking-wider">ACTIVE</span>
        </div>
      </div>

      {/* Clock */}
      <div className="font-mono text-[16px] font-semibold tracking-wider text-cyber-cyan" style={{ textShadow: '0 0 16px rgba(0, 240, 255, 0.6)' }}>
        {currentTime}
      </div>

      {/* Language */}
      <div className="flex gap-1">
        {['EN', 'AR'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as 'EN' | 'AR')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${
              language === lang
                ? 'text-cyber-void'
                : 'text-cyber-text-tertiary hover:text-cyber-cyan'
            }`}
            style={language === lang ? {
              background: '#00F0FF',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
            } : {}}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* AI Toggle */}
      <button
        onClick={toggleAiPanel}
        className={`px-3 py-1 rounded-lg transition-all duration-300 text-[11px] font-semibold uppercase tracking-wider ${
          aiPanelOpen
            ? 'text-cyber-void'
            : 'text-cyber-text-tertiary hover:text-cyber-cyan'
        }`}
        style={aiPanelOpen ? {
          background: '#00F0FF',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
        } : {
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}
      >
        AI
      </button>

      <button
        onClick={toggleBackendEvolutionPanel}
        className={`px-3 py-1 rounded-lg transition-all duration-300 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
          backendEvolutionPanelOpen
            ? 'text-cyber-void'
            : 'text-cyber-text-tertiary hover:text-cyber-cyan'
        }`}
        style={backendEvolutionPanelOpen ? {
          background: '#00F0FF',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
        } : {
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}
      >
        <Activity className="w-3.5 h-3.5" />
        {language === 'AR' ? 'الخلفية' : 'Backend'}
      </button>

      {/* Connection */}
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: connectionStyle.background, boxShadow: `0 0 12px ${connectionStyle.glow}` }}
      />
    </div>
  );
}
