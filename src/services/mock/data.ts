import type { BackendSnapshot } from '../api/types';

export const mockBackendData: BackendSnapshot = {
  decisions: [
    {
      id: 'R001',
      title: 'ENGAGE UAV-02',
      risk: 82,
      confidence: 74,
      description: 'Weapons release Track 218',
      status: 'pending',
      severity: 'CRITICAL'
    },
    {
      id: 'R002',
      title: 'REROUTE CVY-A',
      risk: 45,
      confidence: 91,
      description: 'Reroute via Delta',
      status: 'pending',
      severity: 'MEDIUM'
    },
    {
      id: 'R003',
      title: 'ESCALATE SIG-01',
      risk: 67,
      confidence: 88,
      description: 'Escalate SIGINT to INTSUM',
      status: 'pending',
      severity: 'HIGH'
    }
  ],
  risk: {
    domains: [
      { name: 'MISSION', value: 68, change: 14, color: '#EF4444', severity: 'critical' },
      { name: 'CYBER', value: 52, change: 18, color: '#8B5CF6', severity: 'caution' },
      { name: 'SUPPLY', value: 61, change: 9, color: '#EAB308', severity: 'critical' },
      { name: 'POLITICAL', value: 44, change: 6, color: '#38BDF8', severity: 'caution' },
      { name: 'KINETIC', value: 35, change: -4, color: '#22C55E', severity: 'operational' }
    ]
  },
  readiness: {
    deployable: 1247,
    nonDeployable: 183,
    total: 1430,
    forecast: {
      '7day': {
        overallReadiness: 82,
        trend: -3
      },
      '30day': {
        overallReadiness: 76,
        trend: -8
      },
      '90day': {
        overallReadiness: 68,
        trend: -14
      }
    }
  },
  surveillance: {
    targets: [
      {
        id: 'TGT-447',
        name: 'Fast Mover Alpha',
        type: 'AERIAL',
        location: '34.5°N, 45.9°E',
        threat: 'HIGH',
        confidence: 87
      },
      {
        id: 'TGT-892',
        name: 'Ground Unit Bravo',
        type: 'GROUND',
        location: 'Grid 8-F',
        threat: 'MEDIUM',
        confidence: 92
      },
      {
        id: 'TGT-661',
        name: 'Cyber Intrusion',
        type: 'CYBER',
        location: 'Network Node 47',
        threat: 'CRITICAL',
        confidence: 96
      }
    ]
  },
  comms: {
    channels: [
      { channel: 'SATCOM Primary', confidence: 92 },
      { channel: 'SATCOM Backup', confidence: 88 },
      { channel: 'Ground Link A', confidence: 74 },
      { channel: 'Ground Link B', confidence: 45 },
      { channel: 'UAV Datalink', confidence: 82 },
      { channel: 'Coalition Net', confidence: 91 }
    ]
  },
  tracks: {
    tracks: [
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
      }
    ]
  },
  operationalContext: {
    metrics: [
      { label: 'ACTIVE TRACKS', value: '7', color: '#38BDF8', sublabel: '2 unidentified' },
      { label: 'THREAT', value: 'HIGH', color: '#F97316', sublabel: '1 critical' },
      { label: 'AGENTS', value: '4/4', color: '#22C55E', sublabel: 'Operational' },
      { label: 'REVIEWS', value: '3', color: '#EAB308', sublabel: 'Pending' },
      { label: 'OPS TEMPO', value: 'HIGH', color: '#EF4444', sublabel: '↑ 30min' }
    ],
    priorities: [
      {
        id: 'P1',
        title: 'Track 218 fast mover IFF failure',
        severity: 'CRITICAL',
        source: 'COP+SIGINT'
      },
      {
        id: 'P2',
        title: 'Approve engagement R001 UAV-02',
        severity: 'HIGH',
        risk: '82%'
      },
      {
        id: 'P3',
        title: 'Cross-domain cyber→UAV-04 misreport',
        severity: 'HIGH',
        source: 'AI correlation'
      }
    ]
  }
};
