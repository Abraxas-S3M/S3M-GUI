import { apiClient, ApiClient } from '../apiClient';
import type { Decision, MissionSnapshot } from '../types';
import { useApiQuery } from './useApiQuery';

export const useMissionSnapshot = (client: ApiClient = apiClient) =>
  useApiQuery<MissionSnapshot>(() => client.getMissionSnapshot(), [client]);

export const useDecisions = (client: ApiClient = apiClient) =>
  useApiQuery<Decision[]>(() => client.listDecisions(), [client]);
