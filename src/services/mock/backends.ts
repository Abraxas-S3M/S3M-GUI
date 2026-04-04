import { mockBackendData } from './data';
import type {
  BackendSnapshot,
  CommsData,
  Decision,
  DecisionStatus,
  OperationalContextData,
  ReadinessData,
  RiskData,
  SurveillanceData,
  TracksData
} from '../api/types';

export interface BackendAdapter {
  getSnapshot(): Promise<BackendSnapshot>;
  getDecisions(): Promise<Decision[]>;
  updateDecisionStatus(id: string, status: DecisionStatus): Promise<Decision>;
  getRisk(): Promise<RiskData>;
  getReadiness(): Promise<ReadinessData>;
  getSurveillance(): Promise<SurveillanceData>;
  getComms(): Promise<CommsData>;
  getTracks(): Promise<TracksData>;
  getOperationalContext(): Promise<OperationalContextData>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const simulateLatency = async (ms = 200): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

class MockBackendAdapter implements BackendAdapter {
  private state: BackendSnapshot = clone(mockBackendData);

  async getSnapshot(): Promise<BackendSnapshot> {
    await simulateLatency();
    return clone(this.state);
  }

  async getDecisions(): Promise<Decision[]> {
    await simulateLatency();
    return clone(this.state.decisions);
  }

  async updateDecisionStatus(id: string, status: DecisionStatus): Promise<Decision> {
    await simulateLatency();

    const decision = this.state.decisions.find((item) => item.id === id);
    if (!decision) {
      throw new Error(`Decision "${id}" was not found in mock backend`);
    }

    decision.status = status;
    return clone(decision);
  }

  async getRisk(): Promise<RiskData> {
    await simulateLatency();
    return clone(this.state.risk);
  }

  async getReadiness(): Promise<ReadinessData> {
    await simulateLatency();
    return clone(this.state.readiness);
  }

  async getSurveillance(): Promise<SurveillanceData> {
    await simulateLatency();
    return clone(this.state.surveillance);
  }

  async getComms(): Promise<CommsData> {
    await simulateLatency();
    return clone(this.state.comms);
  }

  async getTracks(): Promise<TracksData> {
    await simulateLatency();
    return clone(this.state.tracks);
  }

  async getOperationalContext(): Promise<OperationalContextData> {
    await simulateLatency();
    return clone(this.state.operationalContext);
  }
}

const mockBackendAdapter = new MockBackendAdapter();

export const getBackendAdapter = (): BackendAdapter => mockBackendAdapter;
