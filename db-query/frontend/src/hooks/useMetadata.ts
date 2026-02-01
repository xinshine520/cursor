import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metadataApi } from '../api/metadata';
import type { DatabaseMetadata } from '../types';

export const useMetadata = (connectionId: string | null) => {
  return useQuery({
    queryKey: ['metadata', connectionId],
    queryFn: () => (connectionId ? metadataApi.get(connectionId) : Promise.resolve(null)),
    enabled: !!connectionId,
    retry: false,
  });
};

export const useRefreshMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionId: string) => metadataApi.refresh(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({ queryKey: ['metadata', connectionId] });
    },
  });
};
