import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { StatusIndicator } from '../StatusIndicator';
import { CornerBrackets } from '../CornerBrackets';
import { Maximize2, Zap, Shield, Target, Radio, ChevronDown, ChevronRight, Play, Pause, SkipBack, Layers, MapPin, Eye, Radar, Satellite, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';

export function COPWorkspace() {
  const [activeEnvironment, setActiveEnvironment] = useState<'AIR' | 'GROUND' | 'MARITIME' | 'CYBER'>('AIR');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [showMissionLayer, setShowMissionLayer] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'5m' | '30m' | '6h'>('30m');
  const { setAiPanelOpen } = useAppStore();

  const tracks = [
    {
      id: 'T-218',
      type: 'HOSTILE',
      conf: 89,
      status: 'critical',
      speed: '420 kts',
      alt: '15K ft',
      identityConf: 89,
      hostileProbability: 94,
      friendlyProbability: 2,
      unknownProbability: 4,
      sourceReliability: 'HIGH',
      lastUpdate: '12s ago',
      recommendedAction: 'Immediate visual ID required',
      sensors: ['EO/IR', 'Radar', 'SIGINT'],
      trackHistory: { splits: 0, merges: 0, deception: 'LOW' }
    },
    {
      id: 'T-331',
      type: 'UNKNOWN',
      conf: 67,
      status: 'caution',
      speed: '180 kts',
      alt: '8K ft',
      identityConf: 67,
      hostileProbability: 35,
      friendlyProbability: 22,
      unknownProbability: 43,
      sourceReliability: 'MEDIUM',
      lastUpdate: '45s ago',
      recommendedAction: 'Continue tracking, request additional sensors',
      sensors: ['Radar', 'AIS'],
      trackHistory: { splits: 1, merges: 0, deception: 'MEDIUM' }
    },
    {
      id: 'UAV-01',
      type: 'FRIENDLY',
      conf: 98,
      status: 'operational',
      speed: '85 kts',
      alt: '12K ft',
      identityConf: 98,
      hostileProbability: 1,
      friendlyProbability: 98,
      unknownProbability: 1,
      sourceReliability: 'HIGH',
      lastUpdate: '3s ago',
      recommendedAction: 'Nominal operations',
      sensors: ['EO/IR', 'Radar', 'HUMINT', 'Datalink'],
      trackHistory: { splits: 0, merges: 0, deception: 'NONE' }
    },
    {
      id: 'UAV-02',
      type: 'FRIENDLY',
      conf: 95,
      status: 'operational',
      speed: '90 kts',
      alt: '14K ft',
      identityConf: 95,
      hostileProbability: 2,
      friendlyProbability: 95,
      unknownProbability: 3,
      sourceReliability: 'HIGH',
      lastUpdate: '5s ago',
      recommendedAction: 'Nominal operations',
      sensors: ['Radar', 'Datalink'],
      trackHistory: { splits: 0, merges: 0, deception: 'NONE' }
    },
    {
      id: 'UAV-04',
      type: 'FRIENDLY',
      conf: 72,
      status: 'caution',
      speed: '45 kts',
      alt: '3K ft',
      identityConf: 72,
      hostileProbability: 8,
      friendlyProbability: 72,
      unknownProbability: 20,
      sourceReliability: 'MEDIUM',
      lastUpdate: '2m 14s ago',
      recommendedAction: 'IFF interrogation recommended - signal degraded',
      sensors: ['Radar'],
      trackHistory: { splits: 0, merges: 1, deception: 'MEDIUM' }
    }
  ];

  const missionLayers = [
    { id: 'units', name: 'Tasked Units', enabled: true, color: '#05DF72' },
    { id: 'objectives', name: 'Objective Zones', enabled: true, color: '#00F0FF' },
    { id: 'corridors', name: 'Corridors', enabled: false, color: '#FFB800' },
    { id: 'restricted', name: 'No-Go Areas', enabled: true, color: '#FF3366' },
    { id: 'weather', name: 'Weather/Comms', enabled: false, color: '#8A5CFF' }
  ];

  const typeColors: any = {
    HOSTILE: '#EF4444',
    UNKNOWN: '#EAB308',
    FRIENDLY: '#22C55E'
  };

  const environments = [
    { id: 'AIR', label: 'AIR', color: '#00B8FF' },
    { id: 'GROUND', label: 'GROUND', color: '#05DF72' },
    { id: 'MARITIME', label: 'MARITIME', color: '#00F0FF' },
    { id: 'CYBER', label: 'CYBER', color: '#8A5CFF' }
  ];

  const commandActions = [
    { id: 'engage', label: 'ENGAGE TRACK', icon: Target, color: '#FF3366' },
    { id: 'intercept', label: 'INTERCEPT', icon: Zap, color: '#FFB800' },
    { id: 'defend', label: 'DEFENSIVE POSTURE', icon: Shield, color: '#00F0FF' },
    { id: 'comms', label: 'ESTABLISH COMMS', icon: Radio, color: '#05DF72' }
  ];

  const sensorIcons: any = {
    'EO/IR': Eye,
    'Radar': Radar,
    'SIGINT': Radio,
    'AIS': Satellite,
    'HUMINT': Target,
    'Datalink': Radio
  };

  const handleMapDoubleClick = () => {
    setIsMapExpanded(!isMapExpanded);
    if (!isMapExpanded) {
      setAiPanelOpen(false);
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'HIGH': return '#05DF72';
      case 'MEDIUM': return '#FFB800';
      case 'LOW': return '#FF3366';
      default: return '#6B7C95';
    }
  };

  const getDeceptionColor = (level: string) => {
    switch (level) {
      case 'NONE': return '#05DF72';
      case 'LOW': return '#FFB800';
      case 'MEDIUM': return '#F97316';
      case 'HIGH': return '#FF3366';
      default: return '#6B7C95';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Environment Tabs */}
      <div className="flex gap-2">
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => setActiveEnvironment(env.id as any)}
            className={`px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-300`}
            style={activeEnvironment === env.id ? {
              background: `${env.color}20`,
              border: `1px solid ${env.color}60`,
              color: env.color,
              boxShadow: `0 0 15px ${env.color}40`
            } : {
              background: 'rgba(28, 37, 51, 0.3)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              color: '#6B7C95'
            }}
          >
            {env.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Mission Layer Toggle */}
        <button
          onClick={() => setShowMissionLayer(!showMissionLayer)}
          className="px-3 py-1 rounded-lg flex items-center gap-2 transition-all"
          style={{
            background: showMissionLayer ? 'rgba(0, 240, 255, 0.15)' : 'rgba(28, 37, 51, 0.3)',
            border: `1px solid ${showMissionLayer ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)'}`
          }}
        >
          <Layers className="w-4 h-4 text-cyber-cyan" />
          <span className="text-[10px] text-cyber-cyan uppercase tracking-wider font-semibold">
            MISSION LAYER
          </span>
          {showMissionLayer ? <ChevronDown className="w-3 h-3 text-cyber-cyan" /> : <ChevronRight className="w-3 h-3 text-cyber-cyan" />}
        </button>

        <div className="px-3 py-1 rounded-lg flex items-center gap-2" style={{
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          <div className="w-2 h-2 rounded-full bg-cyber-cyan glow-cyan animate-pulse" />
          <span className="text-[11px] text-cyber-cyan uppercase tracking-wider font-semibold">
            LIVE FEED: {activeEnvironment}
          </span>
        </div>
      </div>

      {/* Mission Layer Panel */}
      {showMissionLayer && (
        <div className="relative bg-s3m-card border border-cyber-cyan/30 rounded-lg p-3">
          <CornerBrackets color="#00F0FF" />
          <div className="grid grid-cols-5 gap-2">
            {missionLayers.map((layer) => (
              <button
                key={layer.id}
                className="px-3 py-2 rounded text-[10px] uppercase tracking-wider font-semibold transition-all"
                style={{
                  background: layer.enabled ? `${layer.color}20` : 'rgba(28, 37, 51, 0.3)',
                  border: `1px solid ${layer.enabled ? `${layer.color}60` : 'rgba(107, 124, 149, 0.3)'}`,
                  color: layer.enabled ? layer.color : '#6B7C95'
                }}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Temporal Playback Controls */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaybackActive(!isPlaybackActive)}
              className="w-8 h-8 rounded flex items-center justify-center bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 transition-colors"
            >
              {isPlaybackActive ? <Pause className="w-4 h-4 text-cyber-cyan" /> : <Play className="w-4 h-4 text-cyber-cyan" />}
            </button>
            <button
              className="w-8 h-8 rounded flex items-center justify-center bg-s3m-elevated hover:bg-s3m-card border border-s3m-border-default transition-colors"
            >
              <SkipBack className="w-4 h-4 text-s3m-text-secondary" />
            </button>
          </div>

          <div className="h-6 w-px bg-s3m-border-default" />

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary">REPLAY:</span>
            {(['5m', '30m', '6h'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className="px-2 py-1 rounded text-[9px] uppercase tracking-wider font-semibold transition-all"
                style={{
                  background: playbackSpeed === speed ? 'rgba(0, 240, 255, 0.2)' : 'rgba(28, 37, 51, 0.3)',
                  border: `1px solid ${playbackSpeed === speed ? 'rgba(0, 240, 255, 0.5)' : 'rgba(107, 124, 149, 0.3)'}`,
                  color: playbackSpeed === speed ? '#00F0FF' : '#6B7C95'
                }}
              >
                {speed}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-s3m-border-default" />

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary">MARKERS:</span>
            <div className="flex gap-2 text-[9px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-s3m-text-tertiary">Decisions: 3</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyber-cyan" />
                <span className="text-s3m-text-tertiary">Interventions: 2</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-s3m-warning" />
                <span className="text-s3m-text-tertiary">Track Divergence: 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map */}
        <div
          className={`bg-[#030810] rounded-xl border border-cyber-glass-border relative overflow-hidden transition-all duration-500 ${isMapExpanded ? 'flex-[3.5]' : 'flex-[2.2]'}`}
          onDoubleClick={handleMapDoubleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Expand indicator */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}>
            <Maximize2 className="w-3 h-3 text-cyber-cyan" />
            <span className="text-[9px] text-cyber-cyan uppercase tracking-wider">DOUBLE CLICK TO {isMapExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.08) 0%, transparent 70%)'
            }}
          />

          {/* Range rings */}
          {[30, 50, 70].map((percent, i) => (
            <svg key={i} className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
              <circle
                cx="50%"
                cy="50%"
                r={`${percent}%`}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </svg>
          ))}

          {/* Corner HUD ticks */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
            const positions: any = {
              'top-left': 'top-4 left-4',
              'top-right': 'top-4 right-4',
              'bottom-left': 'bottom-4 left-4',
              'bottom-right': 'bottom-4 right-4'
            };

            return (
              <svg key={pos} className={`absolute w-5 h-5 ${positions[pos]}`} style={{ opacity: 0.4 }}>
                {pos === 'top-left' && <path d="M 20 0 L 0 0 L 0 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'top-right' && <path d="M 0 0 L 20 0 L 20 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'bottom-left' && <path d="M 0 0 L 0 20 L 20 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'bottom-right' && <path d="M 20 0 L 20 20 L 0 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
              </svg>
            );
          })}

          {/* Tracks (simplified representation) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* T-218 Hostile with threat ring */}
            <div className="absolute" style={{ top: '30%', left: '45%' }}>
              <svg width="30" height="30" className="relative">
                <circle
                  cx="15"
                  cy="15"
                  r="13"
                  fill="none"
                  stroke="#FF3366"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 51, 102, 0.6))' }}
                />
                <path
                  d="M 15 5 L 20 18 L 15 15 L 10 18 Z"
                  fill="none"
                  stroke="#FF3366"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 51, 102, 0.8))' }}
                />
              </svg>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyber-red whitespace-nowrap glow-red">
                T-218
              </div>
            </div>

            {/* UAVs */}
            {['35%', '40%', '50%', '60%'].map((top, i) => (
              <div key={i} className="absolute" style={{ top, left: `${55 + i * 5}%` }}>
                <svg width="16" height="16">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="#05DF72"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(5, 223, 114, 0.6))' }}
                  />
                </svg>
              </div>
            ))}

            {/* Unknown track */}
            <div className="absolute" style={{ top: '55%', left: '35%' }}>
              <svg width="18" height="18">
                <rect
                  x="4"
                  y="4"
                  width="10"
                  height="10"
                  fill="none"
                  stroke="#FFB800"
                  strokeWidth="2"
                  transform="rotate(45 9 9)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 184, 0, 0.6))' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Track Panel */}
        {!isMapExpanded && (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {tracks.map((track) => (
              <div key={track.id}>
                <CommandCard
                  className="hover:bg-cyber-glass/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      backgroundColor: typeColors[track.type],
                      boxShadow: `0 0 8px ${typeColors[track.type]}`
                    }}
                  />
                  <div className="pl-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-[12px] font-semibold"
                          style={{
                            color: typeColors[track.type],
                            textShadow: `0 0 8px ${typeColors[track.type]}80`
                          }}
                        >
                          {track.id}
                        </span>
                        <span
                          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            color: typeColors[track.type],
                            backgroundColor: `${typeColors[track.type]}20`,
                            border: `1px solid ${typeColors[track.type]}40`
                          }}
                        >
                          {track.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge value={track.conf} size="sm" />
                        {expandedTrack === track.id ? <ChevronDown className="w-3 h-3 text-cyber-cyan" /> : <ChevronRight className="w-3 h-3 text-cyber-cyan" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusIndicator
                        status={track.status as any}
                        label={track.status.toUpperCase()}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-cyber-text-tertiary">Speed:</span>{' '}
                        <span className="font-mono text-cyber-text-secondary">{track.speed}</span>
                      </div>
                      <div>
                        <span className="text-cyber-text-tertiary">Alt:</span>{' '}
                        <span className="font-mono text-cyber-text-secondary">{track.alt}</span>
                      </div>
                    </div>
                  </div>
                </CommandCard>

                {/* Expanded Track Details */}
                {expandedTrack === track.id && (
                  <div className="mt-2 bg-s3m-elevated border border-cyber-cyan/30 rounded-lg p-3 space-y-3">
                    {/* Identity Probability */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        IDENTITY PROBABILITY
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${track.hostileProbability}%`,
                                background: '#FF3366'
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-cyber-red w-12 text-right">{track.hostileProbability}% H</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${track.friendlyProbability}%`,
                                background: '#05DF72'
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-cyber-green w-12 text-right">{track.friendlyProbability}% F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${track.unknownProbability}%`,
                                background: '#FFB800'
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-s3m-warning w-12 text-right">{track.unknownProbability}% U</span>
                        </div>
                      </div>
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-1">
                          SOURCE RELIABILITY
                        </div>
                        <div
                          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded inline-block"
                          style={{
                            color: getReliabilityColor(track.sourceReliability),
                            backgroundColor: `${getReliabilityColor(track.sourceReliability)}20`
                          }}
                        >
                          {track.sourceReliability}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-1">
                          LAST UPDATE
                        </div>
                        <div className="text-[10px] font-mono text-s3m-text-secondary">
                          {track.lastUpdate}
                        </div>
                      </div>
                    </div>

                    {/* Cross-Domain Correlation */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        CROSS-DOMAIN CORRELATION
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {track.sensors.map((sensor, i) => {
                          const SensorIcon = sensorIcons[sensor] || Target;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyber-cyan/20 border border-cyber-cyan/40"
                            >
                              <SensorIcon className="w-3 h-3 text-cyber-cyan" />
                              <span className="text-[9px] text-cyber-cyan uppercase tracking-wider">{sensor}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Track History */}
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        TRACK ANALYSIS
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[8px] text-s3m-text-tertiary mb-0.5">SPLITS</div>
                          <div className="text-[11px] font-mono text-s3m-text-primary">{track.trackHistory.splits}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[8px] text-s3m-text-tertiary mb-0.5">MERGES</div>
                          <div className="text-[11px] font-mono text-s3m-text-primary">{track.trackHistory.merges}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[8px] text-s3m-text-tertiary mb-0.5">DECEPTION</div>
                          <div
                            className="text-[9px] uppercase tracking-wider font-semibold"
                            style={{ color: getDeceptionColor(track.trackHistory.deception) }}
                          >
                            {track.trackHistory.deception}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded p-2">
                      <div className="text-[9px] uppercase tracking-wider text-cyber-cyan mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        RECOMMENDED ACTION
                      </div>
                      <div className="text-[10px] text-s3m-text-primary leading-relaxed">
                        {track.recommendedAction}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Actions Bar (appears when map is expanded) */}
      {isMapExpanded && (
        <div className="glass-panel rounded-xl p-4 border-cyber-cyan/30" style={{
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-cyber-cyan" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.8))' }} />
            <span className="text-[12px] text-cyber-cyan font-display font-semibold tracking-[0.12em] uppercase">
              AUTOMATED COMMAND OPTIONS
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {commandActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="glass-panel rounded-lg p-3 hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{
                    border: `1px solid ${action.color}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${action.color}60`;
                    e.currentTarget.style.borderColor = `${action.color}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = `${action.color}40`;
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5" style={{
                      color: action.color,
                      filter: `drop-shadow(0 0 6px ${action.color}80)`
                    }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{
                      color: action.color,
                      textShadow: `0 0 8px ${action.color}60`
                    }}>
                      {action.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
