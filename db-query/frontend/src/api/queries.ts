import { apiClient } from './client';
import type {
  QueryRequest,
  QueryResult,
  NaturalLanguageQueryRequest,
  GeneratedQuery,
} from '../types';

export const queriesApi = {
  execute: async (connectionId: string, payload: QueryRequest): Promise<QueryResult> => {
    const { data } = await apiClient.post<QueryResult>(
      `/connections/${connectionId}/query`,
      payload
    );
    return data;
  },

  generate: async (
    connectionId: string,
    payload: NaturalLanguageQueryRequest
  ): Promise<GeneratedQuery> => {
    const { data } = await apiClient.post<GeneratedQuery>(
      `/connections/${connectionId}/query/generate`,
      payload
    );
    return data;
  },
};
