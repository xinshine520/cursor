import { useMutation } from '@tanstack/react-query';
import { queriesApi } from '../api/queries';
import type { NaturalLanguageQueryRequest } from '../types';

export const useGenerateQuery = (connectionId: string | null) => {
  return useMutation({
    mutationFn: (query: string) => {
      if (!connectionId) {
        throw new Error('No connection selected');
      }
      if (!query || !query.trim()) {
        throw new Error('Query cannot be empty');
      }
      return queriesApi.generate(connectionId, { query: query.trim() });
    },
  });
};
