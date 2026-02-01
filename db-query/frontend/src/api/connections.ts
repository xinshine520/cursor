import { apiClient } from './client';
import type { Connection, ConnectionCreate, ConnectionUpdate } from '../types';

export const connectionsApi = {
  list: async (): Promise<Connection[]> => {
    const { data } = await apiClient.get<Connection[]>('/connections');
    return data;
  },

  get: async (id: string): Promise<Connection> => {
    const { data } = await apiClient.get<Connection>(`/connections/${id}`);
    return data;
  },

  create: async (payload: ConnectionCreate): Promise<Connection> => {
    const { data } = await apiClient.post<Connection>('/connections', payload);
    return data;
  },

  update: async (id: string, payload: ConnectionUpdate): Promise<Connection> => {
    const { data } = await apiClient.patch<Connection>(`/connections/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/connections/${id}`);
  },

  test: async (id: string): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post<{ status: string; message: string }>(
      `/connections/${id}/test`
    );
    return data;
  },
};
