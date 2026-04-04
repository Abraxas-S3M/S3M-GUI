export interface Decision {
  id: string;
  title: string;
  risk: number;
  confidence: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MissionSnapshot {
  operationName: string;
  threatLevel: number;
  activeAlerts: number;
  generatedAt: string;
}

export interface BackendErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<TData> {
  data: TData;
  requestId?: string;
}
