import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '../api/connections';
import type { Connection, ConnectionCreate, ConnectionUpdate } from '../types';

export const useConnections = () => {
  return useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.list(),
  });
};

export const useConnection = (id: string | null) => {
  return useQuery({
    queryKey: ['connections', id],
    queryFn: () => (id ? connectionsApi.get(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};

export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ConnectionCreate) => connectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};

export const useUpdateConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConnectionUpdate }) =>
      connectionsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.id] });
    },
  });
};

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => connectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: (id: string) => connectionsApi.test(id),
  });
};
