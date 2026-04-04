import type {
  CommsData,
  Decision,
  OperationalContextData,
  ReadinessData,
  RiskData,
  SurveillanceData,
  ThreatTrack
} from './types';

export const mockDecisions: Decision[] = [
  {
    id: 'R001',
    title: 'ENGAGE UAV-02',
    risk: 82,
    confidence: 74,
    description: 'Weapons release Track 218',
    status: 'pending',
    severity: 'CRITICAL',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'R002',
    title: 'REROUTE CVY-A',
    risk: 45,
    confidence: 91,
    description: 'Reroute via Delta',
    status: 'pending',
    severity: 'MEDIUM',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'R003',
    title: 'ESCALATE SIG-01',
    risk: 67,
    confidence: 88,
    description: 'Escalate SIGINT to INTSUM',
    status: 'pending',
    severity: 'HIGH',
    updatedAt: new Date().toISOString()
  }
];

export const mockOperationalContext: OperationalContextData = {
  threats: [
    {
      id: 'T-218',
      label: 'Fast mover IFF failure',
      level: 'CRITICAL',
      domain: 'kinetic',
      summary: 'High-speed track with intermittent transponder outages.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'T-CYB-44',
      label: 'Cross-domain cyber anomaly',
      level: 'HIGH',
      domain: 'cyber',
      summary: 'Potential command-and-control spoofing against UAV routing.',
      updatedAt: new Date().toISOString()
    }
  ],
  decisions: mockDecisions,
  directives: [
    {
      id: 'DIR-1',
      title: 'ROE CHARLIE-3',
      authority: 'Combined Joint Task Force',
      status: 'active',
      details: 'Positive ID required for kinetic actions near civilian zones.',
      updatedAt: new Date().toISOString()
    }
  ],
  updatedAt: new Date().toISOString()
};

export const mockRiskData: RiskData = {
  composite: 67,
  domains: [
    { domain: 'air', score: 74, trend: 'up' },
    { domain: 'cyber', score: 71, trend: 'up' },
    { domain: 'intel', score: 59, trend: 'steady' },
    { domain: 'logistics', score: 51, trend: 'down' }
  ],
  forecast: [
    { timestamp: new Date(Date.now() + 15 * 60_000).toISOString(), score: 69 },
    { timestamp: new Date(Date.now() + 30 * 60_000).toISOString(), score: 71 },
    { timestamp: new Date(Date.now() + 45 * 60_000).toISOString(), score: 68 }
  ],
  drivers: [
    { name: 'IFF instability', impact: 0.36, direction: 'negative' },
    { name: 'ISR coverage', impact: 0.21, direction: 'positive' },
    { name: 'Network anomaly', impact: 0.29, direction: 'negative' }
  ],
  updatedAt: new Date().toISOString()
};

export const mockTracks: ThreatTrack[] = [
  {
    id: 'TRK-218',
    domain: 'kinetic',
    confidence: 92,
    severity: 88,
    correlatedTrackIds: ['TRK-CY-12'],
    summary: 'High-velocity air contact moving toward defended sector.',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'TRK-CY-12',
    domain: 'cyber',
    confidence: 80,
    severity: 69,
    correlatedTrackIds: ['TRK-218'],
    summary: 'Spoofed telemetry packets aligned with TRK-218 timing.',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'TRK-IN-7',
    domain: 'intel',
    confidence: 73,
    severity: 58,
    correlatedTrackIds: [],
    summary: 'SIGINT intercept indicates potential support element nearby.',
    lastSeen: new Date().toISOString()
  }
];

export const mockReadinessData: ReadinessData = {
  personnel: {
    available: 1240,
    deployed: 880,
    onLeave: 47
  },
  equipment: {
    ready: 312,
    maintenance: 49,
    unavailable: 15
  },
  unitStatus: [
    { unitId: 'ALPHA-1', readiness: 92, status: 'ready' },
    { unitId: 'BRAVO-3', readiness: 76, status: 'degraded' },
    { unitId: 'CHARLIE-2', readiness: 61, status: 'degraded' }
  ],
  updatedAt: new Date().toISOString()
};

export const mockSurveillanceData: SurveillanceData = {
  assets: [
    { id: 'UAV-02', type: 'MQ-9', status: 'active', location: 'Sector 8' },
    { id: 'UAV-07', type: 'RQ-4', status: 'standby', location: 'FOB East' },
    { id: 'SIG-11', type: 'SIGINT Node', status: 'active', location: 'Sector 6' }
  ],
  taskingQueue: [
    {
      id: 'TSK-101',
      priority: 'high',
      description: 'Re-task UAV-02 for corridor sweep',
      assignedAssetId: 'UAV-02',
      status: 'in_progress'
    },
    {
      id: 'TSK-104',
      priority: 'medium',
      description: 'Thermal sweep near grid 7-F',
      status: 'queued'
    }
  ],
  targetBoard: [
    {
      id: 'TGT-44',
      designation: 'Unknown fast mover',
      confidence: 84,
      lastSeen: new Date().toISOString()
    }
  ],
  updatedAt: new Date().toISOString()
};

export const mockCommsData: CommsData = {
  inbox: [
    {
      id: 'MSG-1',
      from: 'JTF-HQ',
      to: 'OPS-CELL',
      subject: 'ROE reminder',
      body: 'Maintain positive identification before engagement in populated areas.',
      read: false,
      priority: 'priority',
      timestamp: new Date().toISOString()
    },
    {
      id: 'MSG-2',
      from: 'ISR-DESK',
      to: 'OPS-CELL',
      subject: 'UAV-02 feed update',
      body: 'Thermal feed quality restored, correlation confidence increased.',
      read: true,
      priority: 'routine',
      timestamp: new Date().toISOString()
    }
  ],
  relayQueue: [
    {
      id: 'RL-201',
      messageId: 'MSG-1',
      status: 'sent',
      updatedAt: new Date().toISOString()
    }
  ],
  updatedAt: new Date().toISOString()
};
