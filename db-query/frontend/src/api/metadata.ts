import { apiClient } from './client';
import type { DatabaseMetadata } from '../types';

export const metadataApi = {
  get: async (connectionId: string): Promise<DatabaseMetadata> => {
    const { data } = await apiClient.get<DatabaseMetadata>(
      `/connections/${connectionId}/metadata`
    );
    return data;
  },

  refresh: async (connectionId: string): Promise<DatabaseMetadata> => {
    const { data } = await apiClient.post<DatabaseMetadata>(
      `/connections/${connectionId}/metadata/refresh`
    );
    return data;
  },
};
