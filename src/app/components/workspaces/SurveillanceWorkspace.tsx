import { useState } from 'react';
import { CommandCard } from '../CommandCard';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { CornerBrackets } from '../CornerBrackets';
import { Eye, MapPin, AlertTriangle, Target, Crosshair, Radio, Shield, ChevronDown, ChevronRight, Calendar, TrendingUp, Ship, Building, User, Car, BookmarkCheck, Layers } from 'lucide-react';

export function SurveillanceWorkspace() {
  const [expandedCollectionManager, setExpandedCollectionManager] = useState(true);
  const [expandedSourceReliability, setExpandedSourceReliability] = useState(false);
  const [expandedWatchlists, setExpandedWatchlists] = useState(false);
  const [expandedFusion, setExpandedFusion] = useState(true);

  const personsOfInterest = [
    { id: 'POI-087', name: 'KHALID AL-RASHID', status: 'ACTIVE', location: 'Sector 7-B', lastSeen: '14:42Z', threat: 89, activity: 'Meeting with known operatives' },
    { id: 'POI-052', name: 'YURI VOLKOV', status: 'TRACKING', location: 'Grid 12-F', lastSeen: '14:38Z', threat: 76, activity: 'Border crossing attempt' },
    { id: 'POI-129', name: 'AMIRA HASSAN', status: 'ACTIVE', location: 'Zone 3-A', lastSeen: '14:35Z', threat: 82, activity: 'Communications intercept detected' },
    { id: 'POI-064', name: 'CHEN WEI', status: 'DORMANT', location: 'Unknown', lastSeen: '12:15Z', threat: 45, activity: 'No recent activity' }
  ];

  const targetsOfInterest = [
    { id: 'TOI-041', type: 'FACILITY', name: 'Chemical Storage', location: '34.2°N, 45.7°E', surveillance: 'SAT/DRONE', confidence: 94, notes: 'Increased activity detected' },
    { id: 'TOI-018', type: 'VEHICLE', name: 'Convoy Alpha-7', location: 'Route Delta', surveillance: 'UAV', confidence: 88, notes: 'High-value transport suspected' },
    { id: 'TOI-093', type: 'FACILITY', name: 'Communications Hub', location: '33.8°N, 46.2°E', surveillance: 'SIGINT', confidence: 91, notes: 'Encrypted transmissions ongoing' },
    { id: 'TOI-027', type: 'LOCATION', name: 'Safehouse Bravo', location: 'Grid 8-K', surveillance: 'HUMINT', confidence: 72, notes: 'Suspected meeting point' }
  ];

  const statusColors: any = {
    ACTIVE: { color: '#FF3366', glow: 'rgba(255, 51, 102, 0.6)' },
    TRACKING: { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.6)' },
    DORMANT: { color: '#6B7C95', glow: 'rgba(107, 124, 149, 0.4)' }
  };

  const typeColors: any = {
    FACILITY: { color: '#8A5CFF', glow: 'rgba(138, 92, 255, 0.6)' },
    VEHICLE: { color: '#00B8FF', glow: 'rgba(0, 184, 255, 0.6)' },
    LOCATION: { color: '#05DF72', glow: 'rgba(5, 223, 114, 0.6)' }
  };

  const liveTargets = [
    { id: 'TGT-447', name: 'Fast Mover Alpha', type: 'AERIAL', location: '34.5°N, 45.9°E', velocity: '450 kts', altitude: '12,000 ft', threat: 'HIGH', confidence: 87, suggestions: ['INTERCEPT', 'IDENTIFY', 'TRACK'] },
    { id: 'TGT-892', name: 'Ground Unit Bravo', type: 'GROUND', location: 'Grid 8-F', velocity: '25 kph', altitude: 'N/A', threat: 'MEDIUM', confidence: 92, suggestions: ['ENGAGE', 'SURVEIL', 'REQUEST SUPPORT'] },
    { id: 'TGT-334', name: 'Maritime Contact', type: 'MARITIME', location: '32.1°N, 48.3°E', velocity: '15 kts', altitude: 'Sea Level', threat: 'LOW', confidence: 78, suggestions: ['MONITOR', 'IDENTIFY', 'HAIL'] },
    { id: 'TGT-661', name: 'Cyber Intrusion', type: 'CYBER', location: 'Network Node 47', velocity: 'N/A', altitude: 'N/A', threat: 'CRITICAL', confidence: 96, suggestions: ['ISOLATE', 'TRACE', 'COUNTER'] },
    { id: 'TGT-523', name: 'UAV Contact Delta', type: 'AERIAL', location: '33.8°N, 46.1°E', velocity: '180 kts', altitude: '8,500 ft', threat: 'MEDIUM', confidence: 84, suggestions: ['TRACK', 'ASSESS', 'DEPLOY COUNTER-UAV'] }
  ];

  const threatColors: any = {
    CRITICAL: '#FF3366',
    HIGH: '#F97316',
    MEDIUM: '#FFB800',
    LOW: '#38BDF8'
  };

  const targetTypeIcons: any = {
    AERIAL: Crosshair,
    GROUND: Target,
    MARITIME: Target,
    CYBER: AlertTriangle
  };

  // Collection Manager Data
  const collectionTasks = [
    { id: 'COLL-847', area: 'Sector 7-B', target: 'Chemical Storage', sensor: 'SAT-12', status: 'active', coverage: 87, lastUpdate: '14:42Z' },
    { id: 'COLL-892', area: 'Grid 12-F', target: 'Border Crossing', sensor: 'UAV-07', status: 'active', coverage: 94, lastUpdate: '14:38Z' },
    { id: 'COLL-734', area: 'Zone 3-A', target: 'Comms Hub', sensor: 'SIGINT-03', status: 'delayed', coverage: 62, lastUpdate: '13:15Z' },
    { id: 'COLL-512', area: 'Grid 8-K', target: 'Safehouse Bravo', sensor: 'HUMINT', status: 'pending', coverage: 0, lastUpdate: 'N/A' }
  ];

  const collectionGaps = [
    { area: 'Sector 4-D', time: '0400-0800Z', target: 'Supply Route', severity: 'HIGH', duration: '4hrs' },
    { area: 'Zone 9-B', time: '1200-1600Z', target: 'Meeting Location', severity: 'CRITICAL', duration: '4hrs' },
    { area: 'Grid 15-A', time: '2000-0200Z', target: 'Maritime Transit', severity: 'MEDIUM', duration: '6hrs' }
  ];

  const retaskingRecommendations = [
    { sensor: 'SAT-08', from: 'Routine patrol', to: 'Sector 4-D coverage', priority: 'HIGH', impact: 'Closes 4hr gap' },
    { sensor: 'UAV-12', from: 'Area scan', to: 'Zone 9-B surveillance', priority: 'CRITICAL', impact: 'Covers meeting location' },
    { sensor: 'SIGINT-05', from: 'Idle', to: 'Grid 15-A monitoring', priority: 'MEDIUM', impact: 'Maritime tracking' }
  ];

  // Source Reliability Data
  const sourceReliability = [
    { source: 'SAT-12', type: 'Imagery', uptime: 98.7, bias: 'Low', falseAlarmRate: 2.1, timeliness: 94, status: 'operational' },
    { source: 'UAV-07', type: 'Video', uptime: 94.2, bias: 'Low', falseAlarmRate: 4.8, timeliness: 89, status: 'operational' },
    { source: 'SIGINT-03', type: 'Signals', uptime: 87.4, bias: 'Medium', falseAlarmRate: 12.3, timeliness: 72, status: 'caution' },
    { source: 'HUMINT-01', type: 'Human', uptime: 76.8, bias: 'High', falseAlarmRate: 18.7, timeliness: 54, status: 'caution' },
    { source: 'OSINT-02', type: 'Open Source', uptime: 99.1, bias: 'Medium', falseAlarmRate: 8.4, timeliness: 81, status: 'operational' }
  ];

  // Entity Watchlists Data
  const entityWatchlists = {
    persons: [
      { id: 'POI-087', name: 'KHALID AL-RASHID', status: 'ACTIVE', lastSeen: '14:42Z', alerts: 3 },
      { id: 'POI-052', name: 'YURI VOLKOV', status: 'TRACKING', lastSeen: '14:38Z', alerts: 1 },
      { id: 'POI-129', name: 'AMIRA HASSAN', status: 'ACTIVE', lastSeen: '14:35Z', alerts: 2 }
    ],
    organizations: [
      { id: 'ORG-024', name: 'Phoenix Trading LLC', status: 'ACTIVE', activity: 'Financial transfers', alerts: 5 },
      { id: 'ORG-017', name: 'Red Star Logistics', status: 'MONITORING', activity: 'Weapons trafficking suspected', alerts: 8 }
    ],
    vessels: [
      { id: 'VES-341', name: 'MV AURORA', status: 'TRACKING', location: '32.1°N, 48.3°E', alerts: 2 },
      { id: 'VES-278', name: 'FREIGHTER DELTA-7', status: 'ACTIVE', location: '31.8°N, 47.9°E', alerts: 4 }
    ],
    vehicles: [
      { id: 'VEH-892', name: 'Convoy Alpha-7', status: 'ACTIVE', location: 'Route Delta', alerts: 3 },
      { id: 'VEH-634', name: 'Technical Bravo-2', status: 'DORMANT', location: 'Unknown', alerts: 0 }
    ],
    sites: [
      { id: 'SITE-041', name: 'Chemical Storage', status: 'ACTIVE', location: '34.2°N, 45.7°E', alerts: 6 },
      { id: 'SITE-093', name: 'Communications Hub', status: 'ACTIVE', location: '33.8°N, 46.2°E', alerts: 4 }
    ]
  };

  // OSINT/ISR Fusion Data
  const fusionAlerts = [
    {
      id: 'FUSION-847',
      type: 'Watchlist Movement',
      entity: 'KHALID AL-RASHID (POI-087)',
      sources: ['Imagery', 'SIGINT', 'OSINT'],
      confidence: 91,
      summary: 'Target observed meeting with ORG-024 associates at SITE-041',
      timestamp: '14:42Z',
      severity: 'HIGH'
    },
    {
      id: 'FUSION-823',
      type: 'Anomaly Detection',
      entity: 'Chemical Storage (SITE-041)',
      sources: ['SAT', 'SIGINT', 'Reports'],
      confidence: 87,
      summary: 'Unusual activity pattern: 300% increase in vehicle traffic, encrypted comms spike',
      timestamp: '14:28Z',
      severity: 'CRITICAL'
    },
    {
      id: 'FUSION-801',
      type: 'Watchlist Movement',
      entity: 'MV AURORA (VES-341)',
      sources: ['AIS', 'Imagery', 'HUMINT'],
      confidence: 84,
      summary: 'Vessel deviated from declared route, rendezvoused with unknown contact',
      timestamp: '14:15Z',
      severity: 'MEDIUM'
    }
  ];

  const autoGeneratedBriefs = [
    {
      title: 'Sector 7-B Activity Surge',
      confidence: 89,
      keyPoints: [
        'POI-087 meeting with known operatives',
        'SITE-041 vehicle traffic +300%',
        'Encrypted communications detected'
      ],
      recommendation: 'Increase surveillance, deploy additional ISR assets',
      priority: 'HIGH'
    },
    {
      title: 'Maritime Route Deviation',
      confidence: 82,
      keyPoints: [
        'VES-341 off declared course',
        'Rendezvous with unidentified vessel',
        'AIS transponder anomalies'
      ],
      recommendation: 'Request naval intercept, maintain continuous tracking',
      priority: 'MEDIUM'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#22C55E';
      case 'caution': return '#EAB308';
      case 'critical': return '#EF4444';
      case 'active': return '#22C55E';
      case 'delayed': return '#EAB308';
      case 'pending': return '#607590';
      default: return '#607590';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#EAB308';
      case 'LOW': return '#38BDF8';
      default: return '#607590';
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'Low': return '#22C55E';
      case 'Medium': return '#EAB308';
      case 'High': return '#EF4444';
      default: return '#607590';
    }
  };

  return (
    <div className="p-4 h-full space-y-4 overflow-y-auto">
      {/* Top Row: POI and TOI side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Persons Of Interest */}
        <CommandCard accentColor="#FF3366" title="PERSONS OF INTEREST" indicator>
          <div className="space-y-3">
            {personsOfInterest.map((person, i) => (
              <div
                key={i}
                className="glass-panel rounded-lg p-3 hover:border-cyber-red/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye
                      className="w-4 h-4"
                      style={{
                        color: statusColors[person.status].color,
                        filter: `drop-shadow(0 0 4px ${statusColors[person.status].glow})`
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[17px] text-cyber-text-primary font-semibold font-mono">
                          {person.name}
                        </span>
                        <span
                          className="text-[17px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            color: statusColors[person.status].color,
                            background: `${statusColors[person.status].color}20`,
                            border: `1px solid ${statusColors[person.status].color}40`
                          }}
                        >
                          {person.status}
                        </span>
                      </div>
                      <div className="text-[17px] text-cyber-text-tertiary mt-0.5 font-mono">
                        {person.id}
                      </div>
                    </div>
                  </div>
                  <ConfidenceBadge value={person.threat} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[17px] mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyber-cyan" />
                    <span className="text-cyber-text-tertiary">Location:</span>
                    <span className="text-cyber-text-secondary">{person.location}</span>
                  </div>
                  <div>
                    <span className="text-cyber-text-tertiary">Last Seen:</span>{' '}
                    <span className="text-cyber-text-secondary font-mono">{person.lastSeen}</span>
                  </div>
                </div>

                <div className="text-[17px] text-cyber-text-secondary leading-relaxed">
                  {person.activity}
                </div>
              </div>
            ))}
          </div>
        </CommandCard>

        {/* Targets Of Interest */}
        <CommandCard accentColor="#8A5CFF" title="TARGETS OF INTEREST" indicator>
          <div className="space-y-3">
            {targetsOfInterest.map((target, i) => (
              <div
                key={i}
                className="glass-panel rounded-lg p-3 hover:border-cyber-purple/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle
                        className="w-4 h-4"
                        style={{
                          color: typeColors[target.type].color,
                          filter: `drop-shadow(0 0 4px ${typeColors[target.type].glow})`
                        }}
                      />
                      <span className="text-[17px] text-cyber-text-primary font-semibold">
                        {target.name}
                      </span>
                      <span
                        className="text-[17px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          color: typeColors[target.type].color,
                          background: `${typeColors[target.type].color}20`,
                          border: `1px solid ${typeColors[target.type].color}40`
                        }}
                      >
                        {target.type}
                      </span>
                    </div>
                    <div className="text-[17px] text-cyber-text-tertiary font-mono">
                      {target.id}
                    </div>
                  </div>
                  <ConfidenceBadge value={target.confidence} size="sm" />
                </div>

                <div className="space-y-1 text-[17px] mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyber-cyan" />
                    <span className="text-cyber-text-tertiary">Location:</span>
                    <span className="text-cyber-text-secondary">{target.location}</span>
                  </div>
                  <div>
                    <span className="text-cyber-text-tertiary">Surveillance:</span>{' '}
                    <span className="text-cyber-cyan">{target.surveillance}</span>
                  </div>
                </div>

                <div className="text-[17px] text-cyber-text-secondary leading-relaxed">
                  {target.notes}
                </div>
              </div>
            ))}
          </div>
        </CommandCard>
      </div>

      {/* Live Target Feed */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded p-4">
        <CornerBrackets color="#00F0FF" />

        <div className="mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyber-cyan" />
          <span className="text-[17px] uppercase tracking-[0.08em] text-s3m-text-secondary font-semibold">
            LIVE TARGET FEED
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <span className="font-mono text-[17px] text-cyber-green">
              {liveTargets.length} TRACKING
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {liveTargets.map((target) => {
            const TIcon = targetTypeIcons[target.type] || Target;
            const threatColor = threatColors[target.threat];

            return (
              <div
                key={target.id}
                className="relative bg-s3m-elevated border border-s3m-border-default rounded p-3 hover:border-cyber-cyan transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Icon and ID */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <TIcon
                      className="w-5 h-5"
                      style={{
                        color: threatColor,
                        filter: `drop-shadow(0 0 4px ${threatColor}80)`
                      }}
                    />
                    <span className="font-mono text-[17px] text-s3m-text-tertiary">
                      {target.id}
                    </span>
                  </div>

                  {/* Target Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[17px] font-semibold text-s3m-text-primary">
                        {target.name}
                      </span>
                      <span
                        className="text-[17px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: threatColor,
                          backgroundColor: `${threatColor}20`
                        }}
                      >
                        {target.threat}
                      </span>
                      <span className="text-[17px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan">
                        {target.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-[17px] mb-2">
                      <div>
                        <span className="text-s3m-text-tertiary">Location:</span>{' '}
                        <span className="text-s3m-text-secondary font-mono">{target.location}</span>
                      </div>
                      <div>
                        <span className="text-s3m-text-tertiary">Velocity:</span>{' '}
                        <span className="text-s3m-text-secondary font-mono">{target.velocity}</span>
                      </div>
                      <div>
                        <span className="text-s3m-text-tertiary">Altitude:</span>{' '}
                        <span className="text-s3m-text-secondary font-mono">{target.altitude}</span>
                      </div>
                      <div>
                        <span className="text-s3m-text-tertiary">Confidence:</span>{' '}
                        <span className="text-cyber-cyan font-mono">{target.confidence}%</span>
                      </div>
                    </div>

                    {/* Action Suggestions */}
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] uppercase tracking-wider text-s3m-text-tertiary">
                        SUGGESTED ACTIONS:
                      </span>
                      <div className="flex gap-1.5">
                        {target.suggestions.map((action, i) => (
                          <button
                            key={i}
                            className="text-[17px] uppercase tracking-wider px-2 py-1 rounded bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 border border-cyber-cyan/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collection Manager Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedCollectionManager(!expandedCollectionManager)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedCollectionManager ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Calendar className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            COLLECTION MANAGER
          </span>
        </button>

        {expandedCollectionManager && (
          <div className="space-y-3">
            {/* Collection Tasks */}
            <div>
              <div className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                Active Collection Tasks
              </div>
              <div className="grid grid-cols-2 gap-2">
                {collectionTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[17px] text-s3m-text-tertiary">{task.id}</span>
                      <span
                        className="text-[17px] uppercase font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: getStatusColor(task.status),
                          background: `${getStatusColor(task.status)}20`,
                          border: `1px solid ${getStatusColor(task.status)}40`
                        }}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{task.target}</div>
                    <div className="flex items-center justify-between text-[17px] mb-1">
                      <span className="text-s3m-text-tertiary">Area: <span className="text-s3m-text-primary">{task.area}</span></span>
                      <span className="text-s3m-text-tertiary">Sensor: <span className="text-s3m-cyan">{task.sensor}</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">Coverage: <span className="font-mono" style={{ color: task.coverage > 80 ? '#22C55E' : task.coverage > 60 ? '#EAB308' : '#EF4444' }}>{task.coverage}%</span></span>
                      <span className="text-s3m-text-tertiary">Updated: <span className="font-mono text-s3m-text-primary">{task.lastUpdate}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Collection Gaps */}
              <div>
                <div className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Collection Gaps
                </div>
                <div className="space-y-2">
                  {collectionGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[17px] text-s3m-text-primary font-semibold">{gap.area}</span>
                        <span
                          className="text-[17px] uppercase font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: getSeverityColor(gap.severity),
                            background: `${getSeverityColor(gap.severity)}20`,
                            border: `1px solid ${getSeverityColor(gap.severity)}40`
                          }}
                        >
                          {gap.severity}
                        </span>
                      </div>
                      <div className="text-[17px] text-s3m-text-tertiary mb-1">Target: {gap.target}</div>
                      <div className="flex items-center justify-between text-[17px]">
                        <span className="text-s3m-text-tertiary">Time: <span className="font-mono text-s3m-text-primary">{gap.time}</span></span>
                        <span className="text-s3m-text-tertiary">Duration: <span className="text-s3m-red">{gap.duration}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Retasking */}
              <div>
                <div className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                  Recommended Retasking
                </div>
                <div className="space-y-2">
                  {retaskingRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-2 hover:border-s3m-cyan/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[17px] text-s3m-cyan font-semibold">{rec.sensor}</span>
                        <span
                          className="text-[17px] uppercase font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            color: getSeverityColor(rec.priority),
                            background: `${getSeverityColor(rec.priority)}20`,
                            border: `1px solid ${getSeverityColor(rec.priority)}40`
                          }}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <div className="text-[17px] text-s3m-text-tertiary mb-1">
                        From: <span className="text-s3m-text-primary">{rec.from}</span>
                      </div>
                      <div className="text-[17px] text-s3m-text-tertiary mb-1">
                        To: <span className="text-s3m-text-primary">{rec.to}</span>
                      </div>
                      <div className="text-[17px] text-s3m-green">{rec.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Reliability Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedSourceReliability(!expandedSourceReliability)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedSourceReliability ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <TrendingUp className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            SOURCE RELIABILITY
          </span>
        </button>

        {expandedSourceReliability && (
          <div className="grid grid-cols-5 gap-3">
            {sourceReliability.map((source) => (
              <div
                key={source.source}
                className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[17px] text-s3m-text-primary font-semibold">{source.source}</div>
                    <div className="text-[17px] text-s3m-text-tertiary">{source.type}</div>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(source.status) }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[17px]">
                    <span className="text-s3m-text-tertiary uppercase">Uptime</span>
                    <span className="font-mono" style={{ color: source.uptime > 95 ? '#22C55E' : source.uptime > 85 ? '#EAB308' : '#EF4444' }}>
                      {source.uptime}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[17px]">
                    <span className="text-s3m-text-tertiary uppercase">Bias</span>
                    <span className="font-semibold" style={{ color: getBiasColor(source.bias) }}>
                      {source.bias}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[17px]">
                    <span className="text-s3m-text-tertiary uppercase">False Alarms</span>
                    <span className="font-mono" style={{ color: source.falseAlarmRate < 5 ? '#22C55E' : source.falseAlarmRate < 10 ? '#EAB308' : '#EF4444' }}>
                      {source.falseAlarmRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-s3m-card rounded p-1 text-[17px]">
                    <span className="text-s3m-text-tertiary uppercase">Timeliness</span>
                    <span className="font-mono text-s3m-cyan">{source.timeliness}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entity Watchlists Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedWatchlists(!expandedWatchlists)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedWatchlists ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <BookmarkCheck className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            ENTITY WATCHLISTS
          </span>
        </button>

        {expandedWatchlists && (
          <div className="grid grid-cols-5 gap-3">
            {/* Persons */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3 h-3 text-s3m-cyan" />
                <span className="text-[17px] text-s3m-text-tertiary uppercase font-semibold">Persons</span>
              </div>
              <div className="space-y-2">
                {entityWatchlists.persons.map((person) => (
                  <div key={person.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-2">
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{person.name}</div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">{person.id}</span>
                      <span className="text-s3m-red">{person.alerts} alerts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizations */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-3 h-3 text-s3m-cyan" />
                <span className="text-[17px] text-s3m-text-tertiary uppercase font-semibold">Organizations</span>
              </div>
              <div className="space-y-2">
                {entityWatchlists.organizations.map((org) => (
                  <div key={org.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-2">
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{org.name}</div>
                    <div className="text-[17px] text-s3m-text-tertiary mb-1">{org.activity}</div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">{org.id}</span>
                      <span className="text-s3m-red">{org.alerts} alerts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vessels */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ship className="w-3 h-3 text-s3m-cyan" />
                <span className="text-[17px] text-s3m-text-tertiary uppercase font-semibold">Vessels</span>
              </div>
              <div className="space-y-2">
                {entityWatchlists.vessels.map((vessel) => (
                  <div key={vessel.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-2">
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{vessel.name}</div>
                    <div className="text-[17px] text-s3m-text-tertiary mb-1">{vessel.location}</div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">{vessel.id}</span>
                      <span className="text-s3m-red">{vessel.alerts} alerts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-3 h-3 text-s3m-cyan" />
                <span className="text-[17px] text-s3m-text-tertiary uppercase font-semibold">Vehicles</span>
              </div>
              <div className="space-y-2">
                {entityWatchlists.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-2">
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{vehicle.name}</div>
                    <div className="text-[17px] text-s3m-text-tertiary mb-1">{vehicle.location}</div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">{vehicle.id}</span>
                      <span className="text-s3m-red">{vehicle.alerts} alerts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sites */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 text-s3m-cyan" />
                <span className="text-[17px] text-s3m-text-tertiary uppercase font-semibold">Sites</span>
              </div>
              <div className="space-y-2">
                {entityWatchlists.sites.map((site) => (
                  <div key={site.id} className="bg-s3m-elevated border border-s3m-border-default rounded p-2">
                    <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{site.name}</div>
                    <div className="text-[17px] text-s3m-text-tertiary mb-1">{site.location}</div>
                    <div className="flex items-center justify-between text-[17px]">
                      <span className="text-s3m-text-tertiary">{site.id}</span>
                      <span className="text-s3m-red">{site.alerts} alerts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OSINT/ISR Fusion Section */}
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <button
          onClick={() => setExpandedFusion(!expandedFusion)}
          className="w-full flex items-center gap-2 mb-3 hover:bg-s3m-elevated/30 p-1 rounded transition-colors"
        >
          {expandedFusion ? (
            <ChevronDown className="w-4 h-4 text-s3m-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 text-s3m-cyan" />
          )}
          <Layers className="w-4 h-4 text-s3m-cyan" />
          <span className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold">
            OSINT/ISR FUSION
          </span>
        </button>

        {expandedFusion && (
          <div className="space-y-3">
            {/* Fusion Alerts */}
            <div>
              <div className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                Multi-Source Alerts
              </div>
              <div className="space-y-2">
                {fusionAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3 hover:border-s3m-cyan/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[17px] text-s3m-text-tertiary">{alert.id}</span>
                          <span
                            className="text-[17px] uppercase font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              color: getSeverityColor(alert.severity),
                              background: `${getSeverityColor(alert.severity)}20`,
                              border: `1px solid ${getSeverityColor(alert.severity)}40`
                            }}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-[17px] uppercase text-s3m-cyan px-1.5 py-0.5 rounded bg-s3m-cyan/10">
                            {alert.type}
                          </span>
                        </div>
                        <div className="text-[17px] text-s3m-text-primary font-semibold mb-1">{alert.entity}</div>
                      </div>
                      <ConfidenceBadge value={alert.confidence} size="sm" />
                    </div>

                    <div className="text-[17px] text-s3m-text-secondary mb-2">{alert.summary}</div>

                    <div className="flex items-center justify-between text-[17px]">
                      <div className="flex items-center gap-1">
                        <span className="text-s3m-text-tertiary">Sources:</span>
                        {alert.sources.map((src, idx) => (
                          <span key={idx} className="text-s3m-cyan">{src}{idx < alert.sources.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                      <span className="font-mono text-s3m-text-tertiary">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Generated Briefs */}
            <div>
              <div className="text-[17px] text-s3m-text-tertiary uppercase tracking-wider font-semibold mb-2">
                Auto-Generated Briefs
              </div>
              <div className="grid grid-cols-2 gap-3">
                {autoGeneratedBriefs.map((brief, idx) => (
                  <div
                    key={idx}
                    className="bg-s3m-elevated border border-s3m-border-default rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[17px] text-s3m-text-primary font-semibold">{brief.title}</div>
                      <ConfidenceBadge value={brief.confidence} size="sm" />
                    </div>

                    <div className="mb-2">
                      <div className="text-[17px] text-s3m-text-tertiary uppercase mb-1">Key Points</div>
                      <div className="space-y-1">
                        {brief.keyPoints.map((point, pidx) => (
                          <div key={pidx} className="flex gap-2 text-[17px] text-s3m-text-secondary">
                            <span className="text-s3m-cyan">→</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-s3m-card rounded p-2">
                      <div className="text-[17px] text-s3m-text-tertiary uppercase mb-1">Recommendation</div>
                      <div className="text-[17px] text-s3m-text-primary mb-1">{brief.recommendation}</div>
                      <span
                        className="text-[17px] uppercase font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: getSeverityColor(brief.priority),
                          background: `${getSeverityColor(brief.priority)}20`,
                          border: `1px solid ${getSeverityColor(brief.priority)}40`
                        }}
                      >
                        {brief.priority} PRIORITY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
