import type { Decision, MissionSnapshot } from '../types';

const mockDecisions: Decision[] = [
  {
    id: 'R001',
    title: 'ENGAGE UAV-02',
    risk: 82,
    confidence: 74,
    description: 'Weapons release Track 218',
    status: 'pending',
    severity: 'CRITICAL',
  },
  {
    id: 'R002',
    title: 'REROUTE CVY-A',
    risk: 45,
    confidence: 91,
    description: 'Reroute via Delta',
    status: 'pending',
    severity: 'MEDIUM',
  },
];

const mockSnapshot: MissionSnapshot = {
  operationName: 'S3M Adaptive Shield',
  threatLevel: 67,
  activeAlerts: 4,
  generatedAt: new Date().toISOString(),
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createMockBackend = () => ({
  async getMissionSnapshot(): Promise<MissionSnapshot> {
    await delay(120);
    return { ...mockSnapshot, generatedAt: new Date().toISOString() };
  },
  async listDecisions(): Promise<Decision[]> {
    await delay(120);
    return mockDecisions.map((decision) => ({ ...decision }));
  },
  async submitDecision(id: string, status: 'approved' | 'rejected'): Promise<Decision> {
    await delay(80);
    const index = mockDecisions.findIndex((decision) => decision.id === id);
    if (index < 0) {
      throw new Error(`Decision ${id} was not found in mock backend.`);
    }
    mockDecisions[index] = { ...mockDecisions[index], status };
    return { ...mockDecisions[index] };
  },
});
