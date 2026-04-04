import {
  MOCK_API_LATENCY_MS,
  USE_MOCK_BACKEND,
} from '../api/config';
import { APIClient, type APIClientConfig } from '../api/client';
import type {
  APIResponseBase,
  APIService,
  ClassificationLevel,
  DecisionData,
  DecisionQueueCounts,
  DecisionRecord,
  ISRAssetData,
  MessageData,
  MessageItem,
  OperationalContextData,
  PendingItem,
  ReadinessData,
  RiskMetricsData,
  SendMessagePayload,
  ThreatTrackData,
  TimelineEventData,
} from '../api/types';

type ResponsePayload<T extends APIResponseBase> = Omit<T, keyof APIResponseBase>;

const delay = async (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const createRequestId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export class MockBackend implements APIService {
  private readonly latencyMs: number;
  private readonly classification: ClassificationLevel;

  private readonly decisionQueueBaselines = {
    autoApproved: 12,
    humanApproved: 47,
    vetoed: 8,
    stale: 3,
  };

  private decisions: DecisionRecord[] = [
    {
      id: 'R001',
      title: 'ENGAGE UAV-02',
      risk: 82,
      confidence: 74,
      description: 'Weapons release Track 218',
      status: 'pending',
      severity: 'CRITICAL',
      submittedBy: 'Falcon-7',
      recommendedAction: 'Immediate visual ID required',
    },
    {
      id: 'R002',
      title: 'REROUTE CVY-A',
      risk: 45,
      confidence: 91,
      description: 'Reroute via Delta',
      status: 'pending',
      severity: 'MEDIUM',
      submittedBy: 'Logistics Agent',
      recommendedAction: 'Use Route Delta due to bridge disruption',
    },
    {
      id: 'R003',
      title: 'ESCALATE SIG-01',
      risk: 67,
      confidence: 88,
      description: 'Escalate SIGINT to INTSUM',
      status: 'pending',
      severity: 'HIGH',
      submittedBy: 'SIGINT Correlation',
      recommendedAction: 'Escalate to theater intelligence within 15 minutes',
    },
  ];

  private readonly pendingApprovals: PendingItem[] = [
    {
      id: 'APR-301',
      title: 'Strike Authorization - Grid 7-F',
      type: 'approval',
      urgency: 'IMMEDIATE',
      authority: 'O-6',
      age: '5m',
    },
    {
      id: 'APR-302',
      title: 'Asset Reallocation Request - Sector 4',
      type: 'approval',
      urgency: 'PRIORITY',
      authority: 'O-5',
      age: '12m',
    },
    {
      id: 'ESC-089',
      title: 'Track 218 IFF failure - requires O-6 decision',
      type: 'escalation',
      urgency: 'IMMEDIATE',
      authority: 'O-6',
      age: '2m',
    },
  ];

  private messages: MessageItem[] = [
    {
      id: 'MSG-2847',
      from: 'OVERLORD-6',
      to: 'VIPER-2',
      subject: 'Sector 7-B update',
      body: 'Proceed to checkpoint CHARLIE and maintain visual.',
      status: 'delivered',
      priority: 'priority',
      sentAt: new Date().toISOString(),
    },
    {
      id: 'MSG-2846',
      from: 'ECHO-1',
      to: 'ALPHA-3',
      subject: 'Logistics delay',
      body: 'Convoy rerouted, ETA delayed by 45 minutes.',
      status: 'delayed',
      priority: 'routine',
      sentAt: new Date().toISOString(),
    },
    {
      id: 'MSG-2845',
      from: 'BRAVO-4',
      to: 'OVERLORD-6',
      subject: 'Immediate medevac',
      body: 'Medevac lane open, awaiting approval code.',
      status: 'acknowledged',
      priority: 'emergency',
      sentAt: new Date().toISOString(),
    },
  ];

  constructor(latencyMs = MOCK_API_LATENCY_MS, classification: ClassificationLevel = 'SECRET') {
    this.latencyMs = latencyMs;
    this.classification = classification;
  }

  async getOperationalContext(): Promise<OperationalContextData> {
    return this.respond<OperationalContextData>('command', {
      threats: [
        {
          id: 'P1',
          title: 'Track 218 fast mover IFF failure',
          source: 'COP+SIGINT',
          severity: 'CRITICAL',
          risk: 82,
          confidence: 89,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'P3',
          title: 'Cyber to UAV-04 misreport correlation',
          source: 'AI correlation',
          severity: 'HIGH',
          risk: 67,
          confidence: 84,
          updatedAt: new Date().toISOString(),
        },
      ],
      risks: [
        {
          id: 'RISK-MISSION',
          title: 'Mission risk',
          domain: 'MISSION',
          score: 68,
          trendDelta: 14,
          severity: 'HIGH',
        },
        {
          id: 'RISK-SUPPLY',
          title: 'Supply risk',
          domain: 'SUPPLY',
          score: 61,
          trendDelta: 9,
          severity: 'HIGH',
        },
        {
          id: 'RISK-CYBER',
          title: 'Cyber risk',
          domain: 'CYBER',
          score: 52,
          trendDelta: 18,
          severity: 'MEDIUM',
        },
      ],
      pendingItems: this.pendingApprovals,
    });
  }

  async getDecisions(): Promise<DecisionData> {
    return this.respond<DecisionData>('decisions', {
      decisions: this.decisions,
      queueCounts: this.calculateDecisionQueueCounts(),
    });
  }

  async approveDecision(id: string, _comment?: string): Promise<DecisionData> {
    this.decisions = this.decisions.map((decision) =>
      decision.id === id ? { ...decision, status: 'approved' } : decision,
    );

    return this.respond<DecisionData>(
      'decisions',
      {
        decisions: this.decisions,
        queueCounts: this.calculateDecisionQueueCounts(),
      },
      200,
    );
  }

  async rejectDecision(id: string, _comment?: string): Promise<DecisionData> {
    this.decisions = this.decisions.map((decision) =>
      decision.id === id ? { ...decision, status: 'rejected' } : decision,
    );

    return this.respond<DecisionData>(
      'decisions',
      {
        decisions: this.decisions,
        queueCounts: this.calculateDecisionQueueCounts(),
      },
      200,
    );
  }

  async getRiskMetrics(): Promise<RiskMetricsData> {
    return this.respond<RiskMetricsData>('risk', {
      compositeRisk: 58,
      domainBreakdown: [
        { domain: 'MISSION', score: 68, change: 14, severity: 'critical' },
        { domain: 'CYBER', score: 52, change: 18, severity: 'caution' },
        { domain: 'SUPPLY', score: 61, change: 9, severity: 'critical' },
        { domain: 'POLITICAL', score: 44, change: 6, severity: 'caution' },
        { domain: 'KINETIC', score: 35, change: -4, severity: 'operational' },
      ],
      topDrivers: [
        {
          title: 'Track 218 hostile contact',
          domain: 'KINETIC',
          impact: 72,
          description:
            'Fast mover with IFF failure, approach vector toward friendly assets',
        },
        {
          title: 'Route Bravo bridge out',
          domain: 'LOGISTICS',
          impact: 58,
          description: 'Primary supply route compromised, convoy reroute required',
        },
        {
          title: 'Port scan Node 12',
          domain: 'CYBER',
          impact: 45,
          description: 'Coordinated reconnaissance on SATCOM infrastructure',
        },
      ],
      forecast: [
        { label: 'NOW', value: 58 },
        { label: '+1H', value: 66 },
        { label: '+6H', value: 74 },
        { label: '+24H', value: 52 },
      ],
    });
  }

  async getThreatTracks(): Promise<ThreatTrackData> {
    return this.respond<ThreatTrackData>('cop', {
      kinetic: [
        {
          id: 'T-218',
          type: 'HOSTILE',
          confidence: 89,
          status: 'critical',
          location: '34.2°N, 45.7°E',
          speed: '420 kts',
          altitude: '15K ft',
          sourceReliability: 'HIGH',
          lastUpdate: '12s ago',
        },
        {
          id: 'T-331',
          type: 'UNKNOWN',
          confidence: 67,
          status: 'caution',
          location: '34.1°N, 45.5°E',
          speed: '180 kts',
          altitude: '8K ft',
          sourceReliability: 'MEDIUM',
          lastUpdate: '45s ago',
        },
      ],
      cyber: [
        {
          id: 'CYB-661',
          type: 'INTRUSION',
          confidence: 96,
          status: 'critical',
          location: 'Network Node 47',
          sourceReliability: 'HIGH',
          lastUpdate: '1m ago',
        },
      ],
      intel: [
        {
          id: 'INT-847',
          type: 'FUSION_ALERT',
          confidence: 91,
          status: 'caution',
          location: 'Sector 7-B',
          sourceReliability: 'HIGH',
          lastUpdate: '14:42Z',
        },
        {
          id: 'INT-823',
          type: 'ANOMALY',
          confidence: 87,
          status: 'critical',
          location: 'SITE-041',
          sourceReliability: 'MEDIUM',
          lastUpdate: '14:28Z',
        },
      ],
    });
  }

  async getReadinessSummary(): Promise<ReadinessData> {
    return this.respond<ReadinessData>('readiness', {
      unitStatus: [
        { unit: '1st Battalion', deployable: 418, nonDeployable: 60, readinessScore: 88 },
        { unit: '2nd Battalion', deployable: 372, nonDeployable: 70, readinessScore: 81 },
        { unit: '3rd Battalion', deployable: 401, nonDeployable: 64, readinessScore: 85 },
      ],
      manning: [
        {
          unit: '1st Battalion',
          authorized: 510,
          assigned: 478,
          manningPercent: 94,
          criticalShortages: 3,
        },
        {
          unit: '2nd Battalion',
          authorized: 510,
          assigned: 442,
          manningPercent: 87,
          criticalShortages: 3,
        },
        {
          unit: '3rd Battalion',
          authorized: 510,
          assigned: 465,
          manningPercent: 91,
          criticalShortages: 2,
        },
      ],
      equipment: [
        { category: 'Ground Vehicles', available: 84, total: 100, readinessPercent: 84 },
        { category: 'UAV Fleet', available: 16, total: 20, readinessPercent: 80 },
        { category: 'Comms Kits', available: 112, total: 120, readinessPercent: 93 },
      ],
    });
  }

  async getSurveillanceAssets(): Promise<ISRAssetData> {
    return this.respond<ISRAssetData>('surveillance', {
      uavAssets: [
        {
          id: 'UAV-07',
          name: 'UAV-07',
          status: 'operational',
          platform: 'UAV',
          coverage: 94,
          lastUpdate: '14:38Z',
        },
        {
          id: 'UAV-12',
          name: 'UAV-12',
          status: 'caution',
          platform: 'UAV',
          coverage: 68,
          lastUpdate: '14:31Z',
        },
      ],
      satelliteAssets: [
        {
          id: 'SAT-12',
          name: 'SAT-12',
          status: 'operational',
          platform: 'SATELLITE',
          coverage: 87,
          lastUpdate: '14:42Z',
        },
        {
          id: 'SAT-08',
          name: 'SAT-08',
          status: 'operational',
          platform: 'SATELLITE',
          coverage: 76,
          lastUpdate: '14:22Z',
        },
      ],
      groundSensorAssets: [
        {
          id: 'SIGINT-03',
          name: 'SIGINT-03',
          status: 'caution',
          platform: 'GROUND SENSOR',
          coverage: 62,
          lastUpdate: '13:15Z',
        },
        {
          id: 'HUMINT-01',
          name: 'HUMINT-01',
          status: 'critical',
          platform: 'GROUND SENSOR',
          coverage: 54,
          lastUpdate: '12:52Z',
        },
      ],
    });
  }

  async getMessages(): Promise<MessageData> {
    return this.respond<MessageData>('communication', {
      inbox: this.messages,
      pendingApprovals: this.pendingApprovals,
    });
  }

  async sendMessage(message: SendMessagePayload): Promise<MessageData> {
    const createdMessage: MessageItem = {
      id: `MSG-${Math.floor(3000 + Math.random() * 2000)}`,
      from: 'COMMAND',
      to: message.to,
      subject: message.subject,
      body: message.body,
      priority: message.priority ?? 'priority',
      status: 'pending',
      sentAt: new Date().toISOString(),
    };

    this.messages = [createdMessage, ...this.messages];

    return this.respond<MessageData>(
      'communication',
      {
        inbox: this.messages,
        pendingApprovals: this.pendingApprovals,
      },
      201,
    );
  }

  async getTimelineEvents(): Promise<TimelineEventData> {
    return this.respond<TimelineEventData>('command', {
      events: [
        {
          id: 'TL-001',
          title: 'Track velocity increased 15% over 30 seconds',
          category: 'threat',
          severity: 'HIGH',
          occurredAt: '2026-04-03T14:42:05Z',
          details: 'Track 218 accelerated toward defended airspace.',
        },
        {
          id: 'TL-002',
          title: 'IFF interrogation timeout (3rd attempt)',
          category: 'decision',
          severity: 'CRITICAL',
          occurredAt: '2026-04-03T14:41:48Z',
          details: 'No response from track after three interrogation attempts.',
        },
        {
          id: 'TL-003',
          title: 'SIGINT detected encrypted burst transmission',
          category: 'intel',
          severity: 'MEDIUM',
          occurredAt: '2026-04-03T14:40:55Z',
          details: 'Encrypted traffic correlated with track movement.',
        },
        {
          id: 'TL-004',
          title: 'Operator override: shadow and intercept',
          category: 'decision',
          severity: 'MEDIUM',
          occurredAt: '2026-04-03T14:42:31Z',
          details: 'Human operator selected COA-B due to ROE and behavior pattern.',
        },
      ],
    });
  }

  private calculateDecisionQueueCounts(): DecisionQueueCounts {
    const pending = this.decisions.filter((decision) => decision.status === 'pending').length;
    const autoApprovedDelta = this.decisions.filter(
      (decision) => decision.status === 'approved' && decision.confidence >= 85,
    ).length;
    const humanApprovedDelta = this.decisions.filter(
      (decision) => decision.status === 'approved' && decision.confidence < 85,
    ).length;
    const vetoedDelta = this.decisions.filter(
      (decision) => decision.status === 'rejected',
    ).length;

    return {
      pending,
      autoApproved: this.decisionQueueBaselines.autoApproved + autoApprovedDelta,
      humanApproved: this.decisionQueueBaselines.humanApproved + humanApprovedDelta,
      vetoed: this.decisionQueueBaselines.vetoed + vetoedDelta,
      stale: this.decisionQueueBaselines.stale,
    };
  }

  private async respond<T extends APIResponseBase>(
    workspace: string,
    payload: ResponsePayload<T>,
    statusCode = 200,
  ): Promise<T> {
    const requestStart = Date.now();
    await delay(this.latencyMs);
    const latencyMs = Date.now() - requestStart;

    return {
      requestStatus: 'success',
      statusCode,
      timestamp: new Date().toISOString(),
      classification: this.classification,
      metadata: {
        source: 'mock',
        requestId: createRequestId(),
        transport: 'fetch',
        latencyMs,
        retries: 0,
        workspace,
      },
      ...payload,
    } as T;
  }
}

export const BACKEND_MODE = USE_MOCK_BACKEND ? 'mock' : 'real';

export const createBackendClient = (config?: APIClientConfig): APIService =>
  USE_MOCK_BACKEND ? new MockBackend() : new APIClient(config);
