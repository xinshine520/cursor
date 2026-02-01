import { useMutation } from '@tanstack/react-query';
import { queriesApi } from '../api/queries';
import type { QueryRequest } from '../types';

export const useExecuteQuery = (connectionId: string | null) => {
  return useMutation({
    mutationFn: (sql: string) => {
      if (!connectionId) {
        throw new Error('No connection selected');
      }
      return queriesApi.execute(connectionId, { sql });
    },
  });
};
