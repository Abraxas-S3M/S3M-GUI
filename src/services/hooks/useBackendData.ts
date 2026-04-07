import { APIClient, backendApiClient } from '../api/client';
import type { DecisionData, OperationalContextData } from '../api/types';
import { useApiQuery } from './useApiQuery';

export const useMissionSnapshot = (client: APIClient = backendApiClient) =>
  useApiQuery<OperationalContextData>(() => client.getOperationalContext(), [client]);

export const useDecisions = (client: APIClient = backendApiClient) =>
  useApiQuery<DecisionData>(() => client.getDecisions(), [client]);
